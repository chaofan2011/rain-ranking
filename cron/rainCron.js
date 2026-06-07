const cron = require('node-cron')
const fs = require('fs')
const path = require('path')
const collectService = require('../services/collectService')
const rainService = require('../services/rainService')
const feishuService = require('../services/feishuService')

const LOG_DIR = path.join(__dirname, '../logs')
const START_TIME = Date.now()

function getYesterdayDate() {
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return date.toISOString().split('T')[0]
}

function writeLog(level, message, data = null) {
    const now = new Date().toISOString()
    const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`)
    const logEntry = `[${now}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`

    fs.appendFileSync(logFile, logEntry)
    console.log(logEntry.trim())
}

async function collectWithRetry(date, maxRetries = 3) {
    let failedCities = []

    for (let i = 1; i <= maxRetries; i++) {
        try {
            writeLog('INFO', `开始采集 ${date} (第${i}次尝试)`)
            const result = await collectService.collectYesterdayRain(date)

            if (result.success === result.total) {
                writeLog('INFO', `采集成功`, result)
                return { result, failedCities: [] }
            } else {
                writeLog('WARN', `部分城市采集失败`, result)
                failedCities = result.failedCities || []

                if (i < maxRetries) {
                    writeLog('INFO', `等待5秒后重试...`)
                    await new Promise(resolve => setTimeout(resolve, 5000))
                }
            }
        } catch (err) {
            writeLog('ERROR', `采集异常: ${err.message}`)
            if (i < maxRetries) {
                writeLog('INFO', `等待5秒后重试...`)
                await new Promise(resolve => setTimeout(resolve, 5000))
            }
        }
    }

    writeLog('ERROR', `${date} 采集失败，已重试${maxRetries}次`)
    return { result: null, failedCities }
}

async function pushToFeishu(date, result, failedCities) {
    try {
        writeLog('INFO', `开始推送飞书通知`)

        if (failedCities.length > 0) {
            writeLog('INFO', `推送告警通知`)
            await feishuService.sendAlert(date, result, failedCities)
        }

        if (result && result.success > 0) {
            writeLog('INFO', `推送降雨排行`)
            const data = await rainService.getYesterdayRank(date)
            await feishuService.sendRainReport(date, data)
        }

        writeLog('INFO', `飞书推送完成`)
    } catch (err) {
        writeLog('ERROR', `飞书推送异常: ${err.message}`)
    }
}

function startRainCron() {
    cron.schedule('0 5 * * *', async () => {
        writeLog('INFO', '========== 定时采集任务开始 ==========')
        const date = getYesterdayDate()

        const { result, failedCities } = await collectWithRetry(date)

        await pushToFeishu(date, result, failedCities)

        writeLog('INFO', '========== 定时采集任务结束 ==========')
    }, {
        timezone: 'Asia/Shanghai'
    })

    cron.schedule('0 12 * * *', async () => {
        writeLog('INFO', '========== 心跳推送开始 ==========')

        const now = new Date()
        const timeStr = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        const uptimeMs = Date.now() - START_TIME
        const uptimeHours = Math.floor(uptimeMs / 3600000)
        const uptimeDays = Math.floor(uptimeHours / 24)

        let uptimeStr = ''
        if (uptimeDays > 0) {
            uptimeStr = `${uptimeDays}天${uptimeHours % 24}小时`
        } else {
            uptimeStr = `${uptimeHours}小时`
        }

        const yesterday = getYesterdayDate()
        const logFile = path.join(LOG_DIR, `${yesterday}.log`)
        let lastCollect = '无记录'

        if (fs.existsSync(logFile)) {
            const logContent = fs.readFileSync(logFile, 'utf-8')
            if (logContent.includes('采集成功')) {
                lastCollect = '✅ 成功'
            } else if (logContent.includes('采集失败')) {
                lastCollect = '❌ 失败'
            }
        }

        await feishuService.sendHeartbeat({
            time: timeStr,
            status: '运行中',
            lastCollect,
            uptime: uptimeStr
        })

        writeLog('INFO', '========== 心跳推送结束 ==========')
    }, {
        timezone: 'Asia/Shanghai'
    })

    writeLog('INFO', '定时任务已启动:')
    writeLog('INFO', '  - 每天05:00采集昨日降雨数据并推送飞书')
    writeLog('INFO', '  - 每天12:00推送服务心跳报告')
}

module.exports = { startRainCron }

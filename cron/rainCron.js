const cron = require('node-cron')
const fs = require('fs')
const path = require('path')
const collectService = require('../services/collectService')
const rainService = require('../services/rainService')
const feishuService = require('../services/feishuService')

const LOG_DIR = path.join(__dirname, '../logs')

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
    for (let i = 1; i <= maxRetries; i++) {
        try {
            writeLog('INFO', `开始采集 ${date} (第${i}次尝试)`)
            const result = await collectService.collectYesterdayRain(date)

            if (result.success === result.total) {
                writeLog('INFO', `采集成功`, result)
                return result
            } else {
                writeLog('WARN', `部分城市采集失败`, result)
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
    return null
}

async function pushToFeishu(date) {
    try {
        writeLog('INFO', `开始推送飞书通知`)
        const data = await rainService.getYesterdayRank(date)
        const success = await feishuService.sendRainReport(date, data)

        if (success) {
            writeLog('INFO', `飞书推送成功`)
        } else {
            writeLog('ERROR', `飞书推送失败`)
        }
    } catch (err) {
        writeLog('ERROR', `飞书推送异常: ${err.message}`)
    }
}

function startRainCron() {
    cron.schedule('0 5 * * *', async () => {
        writeLog('INFO', '========== 定时任务开始 ==========')
        const date = getYesterdayDate()

        const result = await collectWithRetry(date)

        if (result && result.success > 0) {
            await pushToFeishu(date)
        }

        writeLog('INFO', '========== 定时任务结束 ==========')
    }, {
        timezone: 'Asia/Shanghai'
    })

    writeLog('INFO', '定时任务已启动: 每天05:00采集昨日降雨数据并推送飞书')
}

module.exports = { startRainCron }

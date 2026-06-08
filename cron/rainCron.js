const cron = require('node-cron')
const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const collectService = require('../services/collectService')
const rainService = require('../services/rainService')
const feishuService = require('../services/feishuService')

dayjs.extend(utc)
dayjs.extend(timezone)

const LOG_DIR = path.join(__dirname, '../logs')

function getYesterdayDate() {
    return dayjs().tz('Asia/Shanghai').subtract(1, 'day').format('YYYY-MM-DD')
}

function getNow() {
    return dayjs().tz('Asia/Shanghai')
}

function writeLog(level, message, data = null) {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true })
    }

    const now = getNow()
    const logFile = path.join(LOG_DIR, `${now.format('YYYY-MM-DD')}.log`)
    const logEntry = `[${now.format('YYYY-MM-DDTHH:mm:ss.SSSZ')}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`

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

    writeLog('INFO', '定时任务已启动: 每天05:00采集昨日降雨数据并推送飞书')
}

module.exports = { startRainCron }

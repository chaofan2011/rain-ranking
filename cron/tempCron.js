const cron = require('node-cron')
const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const weatherService = require('../services/weatherService')
const feishuService = require('../services/feishuService')

dayjs.extend(utc)
dayjs.extend(timezone)

const LOG_DIR = path.join(__dirname, '../logs')

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

function startTempCron() {
    cron.schedule('0 8-20 * * *', async () => {
        writeLog('INFO', '========== 气温排名推送开始 ==========')

        try {
            const data = await weatherService.getAllCitiesTempNow()
            writeLog('INFO', '气温数据获取成功', { count: data.length })

            await feishuService.sendTempRank(data)
            writeLog('INFO', '气温排名推送完成')
        } catch (err) {
            writeLog('ERROR', `气温排名推送异常: ${err.message}`)
        }

        writeLog('INFO', '========== 气温排名推送结束 ==========')
    }, {
        timezone: 'Asia/Shanghai'
    })

    writeLog('INFO', '气温排名定时任务已启动: 每天08:00-20:00每小时推送')
}

module.exports = { startTempCron }

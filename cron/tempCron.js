const cron = require('node-cron')
const fs = require('fs')
const path = require('path')
const weatherService = require('../services/weatherService')
const feishuService = require('../services/feishuService')

const LOG_DIR = path.join(__dirname, '../logs')

function writeLog(level, message, data = null) {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true })
    }

    const now = new Date().toISOString()
    const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`)
    const logEntry = `[${now}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`

    fs.appendFileSync(logFile, logEntry)
    console.log(logEntry.trim())
}

function startTempCron() {
    cron.schedule('0 8-18 * * *', async () => {
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

    writeLog('INFO', '气温排名定时任务已启动: 每天08:00-18:00每小时推送')
}

module.exports = { startTempCron }

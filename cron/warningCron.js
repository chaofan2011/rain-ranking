const cron = require('node-cron')
const fs = require('fs')
const path = require('path')
const warningService = require('../services/warningService')
const feishuService = require('../services/feishuService')

const LOG_DIR = path.join(__dirname, '../logs')

function writeLog(level, message, data = null) {
    const now = new Date().toISOString()
    const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`)
    const logEntry = `[${now}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`

    fs.appendFileSync(logFile, logEntry)
    console.log(logEntry.trim())
}

function startWarningCron() {
    cron.schedule('0 8-18 * * *', async () => {
        writeLog('INFO', '========== 预警检查开始 ==========')

        try {
            const data = await warningService.getWarning()
            writeLog('INFO', '预警数据获取成功', { zeroResult: data.metadata?.zeroResult })

            await feishuService.sendWarning(data)
            writeLog('INFO', '预警推送完成')
        } catch (err) {
            writeLog('ERROR', `预警检查异常: ${err.message}`)
        }

        writeLog('INFO', '========== 预警检查结束 ==========')
    }, {
        timezone: 'Asia/Shanghai'
    })

    writeLog('INFO', '预警定时任务已启动: 每天08:00-18:00每小时检查预警')
}

module.exports = { startWarningCron }

require('dotenv').config()
const express = require('express')
const fs = require('fs')
const path = require('path')
const { startRainCron } = require('./cron/rainCron')
const { startTempCron } = require('./cron/tempCron')

const app = express()
const START_TIME = Date.now()

const rainRouter = require('./routes/rain')
const collectRouter = require('./routes/collect')

app.get('/hello', (req, res) => {
    res.send('Hello Express')
})

app.get('/health', (req, res) => {
    const uptimeMs = Date.now() - START_TIME
    const uptimeHours = Math.floor(uptimeMs / 3600000)
    const uptimeDays = Math.floor(uptimeHours / 24)

    let uptimeStr = ''
    if (uptimeDays > 0) {
        uptimeStr = `${uptimeDays}天${uptimeHours % 24}小时`
    } else {
        uptimeStr = `${uptimeHours}小时`
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const logFile = path.join(__dirname, 'logs', `${yesterdayStr}.log`)
    let lastCollect = '无记录'

    if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, 'utf-8')
        if (logContent.includes('采集成功')) {
            lastCollect = '成功'
        } else if (logContent.includes('采集失败')) {
            lastCollect = '失败'
        }
    }

    res.json({
        status: 'ok',
        uptime: uptimeStr,
        lastCollect,
        time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    })
})

app.use('/rain', rainRouter)
app.use('/collect', collectRouter)

app.listen(3000, () => {
    console.log('服务启动成功')
    startRainCron()
    startTempCron()
})
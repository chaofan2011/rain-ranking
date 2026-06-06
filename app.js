const express = require('express')

const app = express()

const rainRouter = require('./routes/rain')

const collectRouter = require('./routes/collect')

app.get('/hello', (req, res) => {
    res.send('Hello Express')
})

app.use('/rain', rainRouter)

app.listen(3000, () => {
    console.log('服务启动成功')
})

app.use('/collect', collectRouter)
const express = require('express')
const router = express.Router()

const collectService = require('../services/collectService')

router.get('/yesterday', async (req, res) => {

    const date = req.query.date

    const result = await collectService.collectYesterdayRain(date)

    res.json(result)
})

module.exports = router
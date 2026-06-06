const express = require('express')
const router = express.Router()

const rainService = require('../services/rainService')

router.get('/yesterday', async (req, res) => {

    const date = req.query.date

    if (!date) {
        return res.status(400).json({
            success: false,
            message: 'date is required'
        })
    }

    const data = await rainService.getYesterdayRank(date)

    res.json({
        success: true,
        date,
        data
    })
})

module.exports = router
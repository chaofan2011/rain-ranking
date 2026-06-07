const db = require('../db/mysql')
const weatherService = require('./weatherService')

class CollectService {

    async collectYesterdayRain(date) {

        const [cities] = await db.query('SELECT * FROM city')

        let success = 0
        let failedCities = []

        for (const city of cities) {

            try {
                const data = await weatherService.getCityRain(
                    city.location_id,
                    date
                )
                console.log('插入数据:', city.name, data.rainfall)

                await db.query(`
                    INSERT INTO rain_daily
                    (city_id, rain_date, rainfall)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE rainfall = VALUES(rainfall)
                `, [
                    city.id,
                    date,
                    data.rainfall
                ])

                success++

            } catch (err) {
                console.error(`城市失败: ${city.name}`, err.message)
                failedCities.push({
                    name: city.name,
                    error: err.message
                })
            }
        }

        return {
            total: cities.length,
            success,
            failedCities
        }
    }
}

module.exports = new CollectService()
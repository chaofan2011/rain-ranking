const db = require('../db/mysql')
const weatherService = require('./weatherService')

class CollectService {

    async collectYesterdayRain(date) {

        // 1. 获取所有城市
        const [cities] = await db.query('SELECT * FROM city')

        let success = 0

        for (const city of cities) {

            try {

                // 2. 调用和风 API
                const data = await weatherService.getCityRain(
                    city.location_id,
                    date
                )
                console.log('插入数据:', city.name, data.rainfall)
                // 3. 插入数据库
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
            }
        }

        return {
            total: cities.length,
            success
        }
    }
}

module.exports = new CollectService()
const db = require('../db/mysql')

class RainService {

    async getYesterdayRank(date) {

        const sql = `
            SELECT
                c.name AS city,
                r.rainfall
            FROM rain_daily r
            JOIN city c ON r.city_id = c.id
            WHERE r.rain_date = ?
            ORDER BY r.rainfall DESC
        `

        const [rows] = await db.query(sql, [date])

        return rows
    }
}

module.exports = new RainService()
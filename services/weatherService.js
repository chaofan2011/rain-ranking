const axios = require('axios')
const db = require('../db/mysql')

const API_KEY = process.env.QWEATHER_KEY || '1592825e8dba4e5ca30ad99e2317fba2'
const API_HOST = process.env.QWEATHER_HOST || 'ke564uq49g.re.qweatherapi.com'

class WeatherService {

    // 获取城市列表
    async getCities() {
        const [rows] = await db.query('SELECT * FROM city')
        return rows
    }

    // 获取某个城市某一天降雨
    async getCityRain(locationId, date) {
        const url = `https://${API_HOST}/v7/historical/weather`

        const res = await axios.get(url, {
            params: {
                location: locationId,
                date: date.replace(/-/g, ''),
                key: API_KEY
            }
        })

        const data = res.data
        console.log('data------', data)
        return {
            locationId,
            date,
            rainfall: data?.weatherDaily?.precip || 0
        }
    }

}

module.exports = new WeatherService()
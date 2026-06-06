const axios = require('axios')
const db = require('../db/mysql')

const API_KEY = '你的key'

class WeatherService {

    // 获取城市列表
    async getCities() {
        const [rows] = await db.query('SELECT * FROM city')
        return rows
    }

    // 获取某个城市某一天降雨
    async getCityRain(locationId, date) {
        const url = 'https://ke564uq49g.re.qweatherapi.com/v7/historical/weather'

        const res = await axios.get(url, {
            params: {
                location: locationId,
                date: date.replace(/-/g, ''),
                key: '1592825e8dba4e5ca30ad99e2317fba2'
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
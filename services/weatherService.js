const axios = require('axios')
const db = require('../db/mysql')

const API_KEY = process.env.QWEATHER_KEY || '1592825e8dba4e5ca30ad99e2317fba2'
const API_HOST = process.env.QWEATHER_HOST || 'ke564uq49g.re.qweatherapi.com'

class WeatherService {

    async getCities() {
        const [rows] = await db.query('SELECT * FROM city')
        return rows
    }

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

    async getCityTempNow(locationId) {
        const url = `https://${API_HOST}/v7/weather/now`

        const res = await axios.get(url, {
            params: {
                location: locationId,
                key: API_KEY
            }
        })

        return {
            temp: parseFloat(res.data?.now?.temp) || 0,
            text: res.data?.now?.text || ''
        }
    }

    async getAllCitiesTempNow() {
        const [cities] = await db.query('SELECT * FROM city')
        const results = []

        for (const city of cities) {
            try {
                const { temp, text } = await this.getCityTempNow(city.location_id)
                results.push({
                    city: city.name,
                    temp,
                    text
                })
            } catch (err) {
                console.error(`获取 ${city.name} 温度失败:`, err.message)
            }
        }

        return results
    }

}

module.exports = new WeatherService()
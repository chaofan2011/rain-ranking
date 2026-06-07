const axios = require('axios')

const API_KEY = process.env.QWEATHER_KEY || '1592825e8dba4e5ca30ad99e2317fba2'
const API_HOST = process.env.QWEATHER_HOST || 'ke564uq49g.re.qweatherapi.com'
const LATITUDE = process.env.WARNING_LATITUDE || '39.22'
const LONGITUDE = process.env.WARNING_LONGITUDE || '117.13'

class WarningService {

    async getWarning() {
        const url = `https://${API_HOST}/weatheralert/v1/current/${LATITUDE}/${LONGITUDE}`

        const res = await axios.get(url, {
            params: { key: API_KEY }
        })

        return res.data
    }
}

module.exports = new WarningService()

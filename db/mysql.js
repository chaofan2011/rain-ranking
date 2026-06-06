const mysql = require('mysql2/promise')

// 创建连接池（重点）
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Mysql@859284',
    database: 'rain_db',
    waitForConnections: true,
    connectionLimit: 10
})

module.exports = pool
const pool = require("../db/pool")

class DB {
    async query(query, data, first) {
        return new Promise(async (resolve, reject) => {
            await pool.all(query, data, (err, rows) => {
                if(err) return reject(err) 
                if(first) return resolve(rows[0])
                return resolve(rows)
            })
        })
    }
}


module.exports = new DB()
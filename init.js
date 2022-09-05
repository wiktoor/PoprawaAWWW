const { initFunc } = require('./database/init_db.js')
const { getDb } = require('./database/database.js')

getDb().then(async db => await initFunc(db))
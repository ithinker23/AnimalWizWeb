const { Client } = require('pg')
const config = require('config')

const client = new Client({
    host: config.get('database.host'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.db_name')
  })

client.connect()

module.exports = client;
const { Client } = require('pg')
const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'Bush1234%',
    database: 'scrapyproducts'
  })

client.connect()

module.exports = client;
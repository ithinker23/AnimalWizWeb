const { Client } = require('pg')
const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'admin12345',
    database: 'scrapyproducts'
  })

client.connect()

module.exports = client;
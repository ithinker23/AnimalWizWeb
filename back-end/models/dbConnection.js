const { Client } = require('pg')
const client = new Client({
    host: '192.168.1.68',
    user: 'postgres',
    password: 'admin12345',
    database: 'scrapyproducts'
  })

client.connect()

module.exports = client;
const { Client } = require('pg')
const client = new Client({
    host: '192.168.1.77',
    user: 'postgres',
    password: 'Bush1234%',
    database: 'scrapyproducts'
  })

client.connect()

module.exports = client;
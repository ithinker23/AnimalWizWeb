const { Server } = require('socket.io')
const http = require('http')
const itemQuerys = require('./models/itemsQuerys')
const client = require('./models/dbConnection')
const app = require('./app')

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
  },
})

server.listen(5001, () => {
  console.log('socketio listening on port 5001')
})

let KleinID

io.on("connection", (socket) => {

  socket.on('registercelery', () => {
    KleinID = socket.id
    console.log("celery connected")
  })

  socket.on('registeruser', () => {
    console.log("user connected")

    socket.on('getSellerHomeData', async (seller) => {
      let graphData = {}

      let scraped = await itemQuerys.getscrapedcount(seller)
      graphData['foundPids'] = scraped

      let nonscraped = await itemQuerys.getnonscrapedcount(seller)
      graphData['nullPids'] = nonscraped

      let mapped = await itemQuerys.getmappedcount(seller)
      graphData['mappedPids'] = mapped

      let nullItems = await itemQuerys.getNullItems(seller)

      socket.emit('updateSellerHomeInfo', { graphData: graphData, itemData: nullItems, seller: seller })

    });

    socket.on('getHomeData', () => {
      console.log("home connected")
      socket.on('startScraper', async (scraperData) => {
        socket.to(KleinID).emit('startScraper', scraperData)
      })

      client.on('notification', async function (msg) {

        let graphData = {}

        seller = msg.payload

        let scraped = await itemQuerys.getscrapedcount(seller)
        graphData['foundPids'] = scraped

        let nonscraped = await itemQuerys.getnonscrapedcount(seller)
        graphData['nullPids'] = nonscraped

        let mapped = await itemQuerys.getmappedcount(seller)
        graphData['mappedPids'] = mapped

        let nullItems = await itemQuerys.getNullItems(seller)

        socket.emit('updateSellerHomeInfo', { graphData: graphData, itemData: nullItems, seller: seller })
      })

      client.query('LISTEN items_notif')

      socket.on('disconnect', () => {
        client.query('UNLISTEN items_notif')
      })
    })

    socket.on('getPriceOptimData', async (data) => {

      let res = await itemQuerys.getPrices(data.sellers)
      
      socket.emit('postPrices', res)

      socket.on('startScraper', async (scraperDatas) => {
        socket.to(KleinID).emit('updatePrices', scraperDatas)
      })

      client.on('notification', async (msg) => {
        res = await itemQuerys.getPrices(data.sellers)

        socket.emit('postPrices', res)
      })

      client.query('LISTEN price_notif')

      socket.on('disconnect', () => {
        client.query('UNLISTEN price_notif')
      })
    })

    socket.on('getItemsData', () => {

      socket.on('startScraperItems', async (scraperData) => {
        socket.to(KleinID).emit('startScraper', scraperData)

        client.on('notification', async function (msg) {
          let res = await itemQuerys.getItems(scraperData.scraper, scraperData.pid, "similarity")
          socket.emit('scraperItems', { data: res.rows, seller: scraperData.scraper })
        })
      })

      socket.on('mapItem', async (data) => {
        let res = await itemQuerys.updateMappings(data['pid'], data['id'], data['seller'])
        socket.emit('postMappedItem', res)
      })

      socket.on('clearMapped', async (data) => {
        await itemQuerys.clearMappings(data['pid'], data['seller'], data['id'])
        socket.emit('postMappedItem', { id: "-1", seller: data['seller'], pid: data['pid'] })
      })

      client.query('LISTEN items_notif')

      socket.on('disconnect', () => {
        client.query('UNLISTEN items_notif')
      })
    })
  })
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

module.exports = io
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

let activeTasks = {}

io.on("connection", (socket) => {

  socket.on('registercelery', () => {
    KleinID = socket.id
    console.log("celery connected")

    socket.on('celeryScraperID', data => {
      activeTasks[data.scraper] = { taskID: data.id }
      console.log(activeTasks)
    })

    socket.on('updScraperStatus', data => {
      for (let taskIndex = 0; taskIndex <= Object.keys(activeTasks).length - 1; taskIndex++) {
        if (activeTasks[Object.keys(activeTasks)[taskIndex]]['taskID'] == data['task_id']) {
          delete activeTasks[Object.keys(activeTasks)[taskIndex]]
          socket.broadcast.emit('displayNotif', { scraper: 'idk', msg: data.returnVal, Title: "Scraper Finished", isError: data.isError })
        }
      }
    })
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

    socket.on('stopScraper', data => {
      if (activeTasks[data.scraper] != null) {
        let id = activeTasks[data.scraper].taskID
        if (id != null) {
          socket.to(KleinID).emit('stopScraper', id)
          socket.emit('displayNotif', { scraper: data.scraper, msg: data.scraper + " Scraper Has Been Stopped", Title: "Scraper Stopped", isError: false })

        } else {
          socket.emit('displayNotif', { scraper: data.scraper, msg: data.scraper + " Scraper Is Not Running", Title: "Scraper Stop Failed", isError: true })
        }
      } else {
        socket.emit('displayNotif', { scraper: data.scraper, msg: data.scraper + " Scraper Is Not Running", Title: "Scraper Stop Failed", isError: true })
      }
    })

    socket.on('getHomeData', async () => {
      console.log("home connected")

      socket.on('startScraper', async (scraperData) => {
        if (Object.hasOwn(activeTasks, scraperData.scraper)) {
          socket.emit('displayNotif', { scraper: scraperData.scraper, msg: scraperData.scraper + " Scraper Has Already Been Started", Title: "Scraper Failed", isError: true })
        } else {
          socket.emit('displayNotif', { scraper: scraperData.scraper, msg: scraperData.scraper + " Scraper Has Successfully Started", Title: "Scraper Running", isError: false })
          activeTasks[scraperData.scraper] = { taskID: null }
          socket.to(KleinID).emit('startScraper', scraperData)
        }
      })

      client.on('notification', async function (msg) {

        let graphData = {}

        let seller = msg.payload

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

    socket.on('getPriceOptimData', async (priceOptimData) => {
      let priceOptimSellers = priceOptimData.sellers
      console.log(priceOptimSellers + " 1")
      let res = await itemQuerys.getPrices(priceOptimSellers)

      socket.emit('postPrices', res)

      socket.on('startScraper', async (data) => {
        if (Object.hasOwn(activeTasks, 'priceOptimTask')) {
          socket.emit('displayNotif', { scraper: 'priceOptimTask', msg: "Scraper Has Already Been Started", Title: "Scraper Failed", isError: true })
        } else {
          activeTasks['priceOptimTask'] = { taskID: null }
          socket.emit('displayNotif', { scraper: 'priceOptimTask', msg: "Scraper Has Successfully Started", Title: "Scraper Running", isError: false })
          socket.to(KleinID).emit('updatePrices', data.scraperDatas)
        }
      });

      client.on('notification', async (msg) => {
        console.log(priceOptimSellers + " 2")
        let newRes = await itemQuerys.getPrices(priceOptimSellers)

        socket.emit('postPrices', newRes)
      })

      client.query('LISTEN price_notif')

      socket.on('disconnect', () => {
        client.query('UNLISTEN price_notif')
      })
    })

    socket.on('getItemsData', () => {

      socket.on('startScraperItems', async (scraperData) => {
        if (Object.hasOwn(activeTasks, scraperData.scraper)) {
          socket.emit('displayNotif', { scraper: scraperData.scraper, msg: scraperData.scraper + " Scraper Has Already Been Started", Title: "Scraper Failed", isError: true })
        } else {
          socket.emit('displayNotif', { scraper: scraperData.scraper, msg: scraperData.scraper + " Scraper Has Successfully Started", Title: "Scraper Running", isError: false })
          activeTasks[scraperData.scraper] = { taskID: null }
          socket.to(KleinID).emit('startScraper', scraperData)

          client.on('notification', async function (msg) {
            let res = await itemQuerys.getItems(scraperData.scraper, scraperData.pid, "similarity")
            socket.emit('scraperItems', { data: res.rows, seller: scraperData.scraper })
          })
        }
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
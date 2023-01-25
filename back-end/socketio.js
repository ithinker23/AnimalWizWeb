const {Server} = require('socket.io')
const http = require('http')
const itemQuerys = require('./models/itemsQuerys')
const client = require('./models/dbConnection')
const app = require('./app')

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET','POST'],
    },
})

server.listen(5001,() => {
})

let KleinID

io.on("connection", (socket)=>{

  socket.on('registercelery', ()=>{
    KleinID = socket.id
  })

  
  socket.on('registeruser', ()=>{

    socket.on('getHomeData', async (sellers)=>{

      let graphData = {}
      let itemData = {}
      sellers.forEach(async (seller, index) => {
        itemData[seller] = {}
        graphData[seller] = {}

        let scraped = await itemQuerys.getscrapedcount(seller)
        graphData[seller]['foundPids'] = scraped
  
        let nonscraped= await itemQuerys.getnonscrapedcount(seller)
        graphData[seller]['nullPids'] = nonscraped
  
        let mapped = await itemQuerys.getmappedcount(seller)
        graphData[seller]['mappedPids'] = mapped
  
        let nullItems = await itemQuerys.getNullItems(seller)
        itemData[seller]["nullItems"] = nullItems
  
        if( index >= sellers.length - 1 ){
          socket.emit('homeData', {graphData:graphData, itemData:itemData})
        }
  
      });
      
      client.on('notification', async function(msg) {

        let graphData = {}
        let itemData = {}

        seller = msg.payload

        let scraped = await itemQuerys.getscrapedcount(seller)
        graphData['foundPids'] = scraped
  
        let nonscraped= await itemQuerys.getnonscrapedcount(seller)
        graphData['nullPids'] = nonscraped
  
        let mapped = await itemQuerys.getmappedcount(seller)
        graphData['mappedPids'] = mapped
  
        let nullItems = await itemQuerys.getNullItems(seller)
        itemData['nullItems']= nullItems

        socket.emit('homeDataUpdate', {graphData:graphData, itemData:itemData, seller:seller})
      })

      client.query('LISTEN items_notif')

      socket.on('disconnect', ()=>{
        client.query('UNLISTEN items_notif')
      })
    })

    socket.on('startScraperPriceOptim', async (scraperData)=>{
      socket.to(KleinID).emit('updatePrices', scraperData)
      
    })

    socket.on('startScraper', async (scraperData)=>{
      socket.to(KleinID).emit('startScraper', scraperData)
    })

    socket.on('startScraperItems',async (scraperData) =>{

      socket.to(KleinID).emit('startScraper', scraperData)

      client.on('channel', async function(msg) {
          
        let res = await itemQuerys.getItems(scraperData.scraper, scraperData.pid, "similarity")

        socket.emit('scraperItems', {data:res.rows,seller:scraperData.scraper})
      })
      client.query('LISTEN items_notif')

      socket.on('disconnect', ()=>{
        client.query('UNLISTEN items_notif')
      })
    })

    socket.on('getMatches', async (data) => {
      let res = await itemQuerys.getMatches(data.sellers, data.store_name)

      socket.emit('postMatches', res)

      client.on('notification', async (msg) => {
        res = await itemQuerys.getMatches(data.sellers, data.store_name)

        socket.emit('postMatches', res)
      })

      client.query('LISTEN price_notif')

      socket.on('disconnect', ()=>{
        client.query('UNLISTEN price_notif')
      })
    })
    socket.on('mapItem', async (data)=>{
      let res = await itemQuerys.updateMatches(data['pid'], data['id'], data['seller'])

      socket.emit('postMappedItem', res)
    }) 
    socket.on('disconnect', function () {
    });

  })
})

module.exports = io
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
  console.log("SOCKETIO RUNNING ON "+ 5001)
})

client.query('LISTEN channel')

let KleinID

io.on("connection", (socket)=>{

  socket.on('registerklein', ()=>{
    KleinID = socket.id
    console.log('KLEIN CONNECTED... ID:' + KleinID)

    socket.on('disconnect', function () {
      console.log('klein server disconnected');
    });
  })

  
  socket.on('registeruser', ()=>{

    console.log("USER CONNECTED: " + socket.id)

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
      
    })

    socket.on('startScraperHome', async (scraperData)=>{
      socket.to(KleinID).emit('startScraper', scraperData)
    })

    socket.on('startScraperItems',async (scraperData) =>{

      socket.to(KleinID).emit('startScraper', scraperData)

      client.on('notification', async function(msg) {
          
        let res = await itemQuerys.getItems(scraperData.scraper, scraperData.pid, "similarity")

        socket.emit('scraperItems', {data:res.rows,seller:scraperData.scraper})
      })
    })
    
    socket.on('mapItem', (data)=>{
      itemQuerys.updateMatches(data['pid'], data['id'], data['seller'])
    })

    socket.on('disconnect', function () {
      console.log('A user disconnected');
    });
  })
})

module.exports = io
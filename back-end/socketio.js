const {Server} = require('socket.io')
const http = require('http')
const homeQuerys = require('./models/homeQuerys')
const itemQuerys = require('./models/itemsQuerys')
const client = require('./models/dbConnection')
const app = require('./app')
const axios = require('axios')

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

    socket.on('startScraperItemSelection',(scraperData) =>{

      socket.to(KleinID).emit('startScraper', scraperData)

      client.on('notification', async function(msg) {

        let selectionitemData = await itemQuerys.getItems(scraperData.scraper, scraperData.pid, "similarity")
        socket.emit("setItems", {data:selectionitemData.rows, seller:scraperData.scraper})
      })

      client.query('LISTEN channel')
    })
    
    socket.on('disconnect', function () {
      console.log('A user disconnected');
    });
  })
})

module.exports = io
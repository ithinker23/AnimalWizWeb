const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cors = require('cors');
const {Server} = require('socket.io')
const http = require('http')
let homeQuerys = require('./models/homeQuerys')
let client = require('./models/dbConnection')

app.use(cors({origin: 'http://localhost:3000', credentials: true}));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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

const itemsRoute = require('./routes/itemsRoute.js');
app.use('/items', itemsRoute);

const _404Route = require('./routes/404Route');
app.use('/', _404Route)

const urlsRoute = require('./routes/urlsRoute');
app.use('/urls', urlsRoute)

const scraperRoute = require('./routes/scraperRoute');
app.use('/scrapers', scraperRoute)

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

io.on("connection", (socket)=>{
  console.log("USER CONNECTED: " + socket.id)
    
    socket.on('startPostingData', async (sellers)=>{

      let graphData = await homeQuerys.getGraphData(sellers)
      socket.emit("postGraphData", graphData)

      let itemData = await homeQuerys.getItemData(sellers)
      socket.emit("postItemData", itemData)

      client.on('notification', async function(msg) {
        graphData = await homeQuerys.getGraphData(sellers)
        socket.emit("postGraphData", graphData)

        itemData = await homeQuerys.getItemData(sellers)
        socket.emit("postItemData", itemData)
      })
    })

  socket.on('disconnect', function () {
    console.log('A user disconnected');
  });
})
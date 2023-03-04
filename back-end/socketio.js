const { Server } = require('socket.io')
const http = require('http')
const app = require('./app')
const userQuerys = require('./models/userQuerys')
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

let celeryID

const setCeleryID = (value) => {
  celeryID = value
}

const getCeleryID = () => {
  return celeryID
}

let activeTasks = {}

const celeryHandler = require('./event_handlers/celeryHandler')
const homeHandler = require('./event_handlers/homeHandler')
const itemSelectionHandler = require('./event_handlers/itemSelectionHandler')
const POHandler = require('./event_handlers/POHandler')
const userHandler = require('./event_handlers/userHandler')

let authEvents = ['stopScraper', 'getSellerHomeData', 'getHomeData', 'startScraper', 'getItemsData', 'startScraperItems', 'mapItem', 'clearMapped', 'getPriceOptimData']

const onConnection = (socket) => {

  socket.use(async (packet, next) => {
    for (let i = 0; i < authEvents.length; i++) {
      let eventName = authEvents[i]
      if (eventName == packet[0]) {
        if (await userQuerys.checkForUser(packet[1].token)) {
          next()
        } else {
          socket.emit('displayNotif', { msg: "User Is Invalid", Title: "Login Failure", isError: true })
          break
        }
      }
      if (i == authEvents.length - 1) {
        next()
      }
    }
  })

  celeryHandler(io, socket, setCeleryID)
  userHandler(io, socket)
  homeHandler(io, socket, getCeleryID)
  itemSelectionHandler(io, socket, getCeleryID)
  POHandler(io, socket, getCeleryID)

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
}

io.on("connection", onConnection)

module.exports = { io, celeryID, activeTasks }
const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cors = require('cors');
const {Server} = require('socket.io')
const http = require('http')

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


io.on("connection", (socket)=>{
    console.log("USER CONNECTED: " + socket.id)

    socket.on("start_scrapers", (data)=>{
        console.log(data)
    })
})

const itemsRoute = require('./routes/itemsRoute.js');
app.use('/items', itemsRoute);

const _404Route = require('./routes/404Route');
app.use('/', _404Route)

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
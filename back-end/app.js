const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cors = require('cors');
const io = require('./socketio')

app.use(cors({origin: '*', credentials: true}));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const _404Route = require('./routes/404Route');
app.use('/', _404Route)

const auth = require('./middlewares/userAuth.js')
app.use(auth.authExpress)

const itemsRoute = require('./routes/itemsRoute.js');
app.use('/items', itemsRoute)

const urlsRoute = require('./routes/urlsRoute');
app.use('/urls', urlsRoute)

app.listen(port)


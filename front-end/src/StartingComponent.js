import * as React from 'react';
import ItemGrid from './pages/ItemGrid';
import Home from './pages/Home'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from './components/Header'
import PriceOptimization from './pages/PriceOptimization'
import io from 'socket.io-client'
import axios from 'axios'
import NotificationPanel from './components/NotificationPanel'

const expressAPI = axios.create({ baseURL: 'http://'+ process.env.REACT_APP_EXPRESS_HOST +':'+ process.env.REACT_APP_EXPRESS_PORT +'' })
const socket = io.connect('http://'+ process.env.REACT_APP_SOCKET_HOST +':'+ process.env.REACT_APP_SOCKET_PORT +'')
socket.emit('registeruser')
const sellers = ["chewy", 'amazon']
const storeDB = "animal_wiz"

export default function StartingComponent() {

  return (
    <>
      <Header />
      <Router>
        <Routes>
          <Route path='/' element={<Home socket={socket} sellers={sellers} />} />
          <Route path="/findItems" element={<ItemGrid expressAPI={expressAPI} socket={socket} sellers={sellers} storeDB={storeDB} />} />
          <Route path="/priceOptimization" element={<PriceOptimization expressAPI={expressAPI} socket={socket} sellers={sellers} storeDB={storeDB} />} />
        </Routes>
      </Router>
      <NotificationPanel socket={socket}/>
    </>
  )
}
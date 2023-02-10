import * as React from 'react';
import ItemGrid from './pages/ItemGrid';
import Home from './pages/Home'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from './components/Header'
import PriceOptimization from './pages/PriceOptimization'
import io from 'socket.io-client'
import axios from 'axios'
import NotificationPanel from './components/NotificationPanel'
import Login from './pages/Login'
import SignUp from './pages/SignUp';

const expressAPI = axios.create({ baseURL: 'http://' + process.env.REACT_APP_EXPRESS_HOST + ':' + process.env.REACT_APP_EXPRESS_PORT + '' })
const socket = io.connect('http://' + process.env.REACT_APP_SOCKET_HOST + ':' + process.env.REACT_APP_SOCKET_PORT + '')
socket.emit('registeruser')
const storeDB = "animal_wiz"

export default function StartingComponent() {

  const sellers = ['chewy','amazon']

  return (
    <>
      <Router>
        <Header />

        <Routes>
          <Route path='/' element={<Home socket={socket} sellers={sellers} />} />
          <Route path="/findItems" element={<ItemGrid expressAPI={expressAPI} socket={socket} sellers={sellers} storeDB={storeDB} />} />
          <Route path="/priceOptimization" element={<PriceOptimization expressAPI={expressAPI} socket={socket} sellers={sellers} storeDB={storeDB} />} />
          <Route path="/login" element={<Login expressAPI={expressAPI} socket={socket}/>} />
          <Route path="/signUp" element={<SignUp expressAPI={expressAPI} socket={socket} />} />
        </Routes>
      </Router>
      <NotificationPanel socket={socket} />
    </>
  )
}
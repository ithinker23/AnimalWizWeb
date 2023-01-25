import * as React from 'react';
import FindItems from './FindItems';
import Home from './Home'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from './Header'
import PriceOptimization from './PriceOptimization'
import io from 'socket.io-client'
import axios from 'axios'
import { useEffect } from 'react';

export default function StartingComponent() {

  const expressAPI = axios.create({ baseURL: 'http://'+ process.env.REACT_APP_EXPRESS_HOST +':'+ process.env.REACT_APP_EXPRESS_PORT +'' })
  const socket = io.connect('http://'+ process.env.REACT_APP_SOCKET_HOST +':'+ process.env.REACT_APP_SOCKET_PORT +'')
  socket.emit('registeruser')
  const sellers = ["chewy", 'amazon', 'petsmart']
  const storeDB = "animal_wiz"

  useEffect(()=>{
    console.log(process.env.REACT_APP_ENVI)
  },[])
  
  return (
    <>
      <Header />
      <Router>
        <Routes>
          <Route path='/' element={<Home socket={socket} sellers={sellers} />} />
          <Route path="/findItems" element={<FindItems expressAPI={expressAPI} socket={socket} sellers={sellers} storeDB={storeDB} />} />
          <Route path="/priceOptimization" element={<PriceOptimization socket={socket} sellers={sellers} storeDB={storeDB} />} />
        </Routes>
      </Router>
    </>
  )
}
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import FindItems from './FindItems';
import Home from './Home'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from './Header'
import PriceOptimization from './PriceOptimization'
import io from 'socket.io-client'

const socket = io.connect('http://localhost:5001')
socket.emit('registeruser')
const sellers = ["chewy",'amazon']
const prevDB = "animal_wiz"
const matchesDB = "aw_matches"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <Header />
    <Router>
      <Routes>
        <Route path='/' element={<Home socket={socket} sellers={sellers}/>}/>
        <Route path="/findItems" element={<FindItems socket={socket} sellers={sellers} prevDB={prevDB} matchesDB={matchesDB}/>} />
        <Route path="/priceOptimization" element={<PriceOptimization sellers={sellers} prevDB={prevDB} matchesDB={matchesDB}/>} />
      </Routes>
      </Router>
  </>
);
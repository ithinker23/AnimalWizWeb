import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import FindItems from './FindItems';
import Home from './Home'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from './Header'
import PriceOptimization from './PriceOptimization'

const sellers = ["chewy",'amazon']
const prevDB = "animal_wiz"
const matchesDB = "aw_matches"
const pricesDB = "aw_changed_prices"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <Header />
    <Router>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path="/findItems" element={<FindItems sellers={sellers} prevDB={prevDB} matchesDB={matchesDB}/>} />
        <Route path="/priceOptimization" element={<PriceOptimization sellers={sellers} prevDB={prevDB} matchesDB={matchesDB} pricesDB={pricesDB}/>} />
      </Routes>
      </Router>
  </>
);
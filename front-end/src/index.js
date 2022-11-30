import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import FindItems from './FindItems';
import Home from './Home'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from './Header'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <Header />
    <Router>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path="/findItems" element={<FindItems />} />
      </Routes>
      </Router>
  </>
);
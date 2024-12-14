import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './login/Login';
import Register from './login/Register';
import POS from './pages/POS';
import Products from './pages/Products';
import Stocks from './pages/Stocks';
import Sales from './pages/Sales';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/Sales" element={<Sales />} />
                <Route path="/POS" element={<POS />} />
                <Route path="/products" element={<Products />} />
                <Route path="/stocks" element={<Stocks />} />
            </Routes>
        </Router>
    );
}

export default App;
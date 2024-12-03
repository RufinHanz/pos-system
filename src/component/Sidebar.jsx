import React from 'react';
import './Sidebar.css';
import { FaHome, FaSignInAlt, FaBoxOpen, FaRegCreditCard } from 'react-icons/fa'; 
import { AiFillProduct } from "react-icons/ai";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Pokemon Plushies</h2>
            <ul className="sidebar-menu">
                <li><a href="/Dashboard"><FaHome /> Dashboard</a></li> 
                <li><a href="/POS"><FaRegCreditCard /> POS</a></li>
                <li><a href="/Products"><AiFillProduct /> Products</a></li>
                <li><a href="/Stocks"><FaBoxOpen /> Stocks</a></li> 
                <li><a href="/Login"><FaSignInAlt /> Logout</a></li> 
            </ul>
        </div>
    );
};

export default Sidebar;
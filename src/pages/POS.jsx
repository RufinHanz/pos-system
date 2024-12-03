import React, { useState, useEffect } from "react";
import { db, collection, getDocs, addDoc, updateDoc, doc } from "../database/firebase";
import { FaCartPlus } from "react-icons/fa";
import Sidebar from "../component/Sidebar";
import "../pages/pagescss/POS.css";

const POS = () => {
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState([]);

    // Fetch products and stocks
    useEffect(() => {
        const fetchProducts = async () => {
            const productsCollection = collection(db, "products");
            const productSnapshot = await getDocs(productsCollection);
            const productList = productSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productList);
        };

        const fetchStocks = async () => {
            const stocksCollection = collection(db, "stocks");
            const stockSnapshot = await getDocs(stocksCollection);
            const stockList = stockSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setStocks(stockList);
        };

        fetchProducts();
        fetchStocks();
    }, []);

    // Filter available products
    useEffect(() => {
        const filteredProducts = products.filter((product) =>
            stocks.some((stock) => stock.productID === product.productID && stock.quantity > 0)
        );

        const filteredBySearch = filteredProducts.filter((product) =>
            product.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setAvailableProducts(filteredBySearch);
    }, [products, stocks, searchTerm]);

    // Add to cart with quantity input
    const handleAddToCart = (product) => {
        const stock = stocks.find((stock) => stock.productID === product.productID);
        const maxQuantity = stock.quantity;

        const quantity = parseInt(prompt(`Enter quantity (Max: ${maxQuantity}):`), 10);
        if (isNaN(quantity) || quantity <= 0 || quantity > maxQuantity) {
            alert("Invalid quantity entered!");
            return;
        }

        const cartItem = {
            ...product,
            quantity,
            totalPrice: quantity * product.productPrice,
        };

        setCart([...cart, cartItem]);
    };

    // Remove item from cart
    const handleRemoveFromCart = (index) => {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
    };

    // Handle checkout process
    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
        const money = parseFloat(prompt(`Total: ₱${totalAmount}. Enter payment amount:`));

        if (isNaN(money) || money < totalAmount) {
            alert("Insufficient funds!");
            return;
        }

        // Update stock quantities
        for (const item of cart) {
            const stock = stocks.find((stock) => stock.productID === item.productID);
            const updatedStockDoc = doc(db, "stocks", stock.id);
            await updateDoc(updatedStockDoc, { quantity: stock.quantity - item.quantity });
        }

        // Save transaction to database
        await addDoc(collection(db, "transactions"), {
            date: new Date().toISOString(),
            totalAmount,
            moneyPaid: money,
            change: money - totalAmount,
        });

        alert("Transaction complete!");
        setCart([]); // Clear the cart
        setIsCheckoutVisible(false); // Close the checkout modal
    };

    // Fetch transaction history
    const fetchTransactionHistory = async () => {
        const transactionsCollection = collection(db, "transactions");
        const transactionsSnapshot = await getDocs(transactionsCollection);
        const history = transactionsSnapshot.docs.map((doc) => doc.data());
        setTransactionHistory(history);
        setIsHistoryVisible(true);
    };

    return (
        <div className="app-container">
            <Sidebar />
            <div className="page-content">
                <h1>Main POS</h1>

                <input
                    type="text"
                    placeholder="Search by Product Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />

                <button onClick={() => setIsCheckoutVisible(true)} className="checkout-button">
                    Check Out
                </button>
                <button onClick={fetchTransactionHistory} className="history-button">
                    History
                </button>

                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {availableProducts.map((product) => (
                            <tr key={product.id}>
                                <td>{product.productName}</td>
                                <td>{product.productDescription}</td>
                                <td>₱{product.productPrice}</td> {/* Change to Peso sign */}
                                <td>
                                    <button onClick={() => handleAddToCart(product)} className="add-to-cart-button">
                                        <FaCartPlus />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {isCheckoutVisible && (
                    <div className="checkout-container">
                        <div className="checkout-modal">
                            <h2>Check Out</h2>
                            <button onClick={() => setIsCheckoutVisible(false)} className="close-button">Back</button>
                            <div className="checkout-items">
                                {cart.map((item, index) => (
                                    <div key={index} className="checkout-item">
                                        <span>{item.productName}</span>
                                        <span>Qty: {item.quantity}</span>
                                        <span>₱{item.totalPrice}</span> {/* Change to Peso sign */}
                                        <button onClick={() => handleRemoveFromCart(index)} className="delete-button">Remove</button>
                                    </div>
                                ))}
                            </div>
                            <div className="checkout-total">
                                <strong>Total: </strong>
                                ₱{cart.reduce((sum, item) => sum + item.totalPrice, 0)} {/* Change to Peso sign */}
                            </div>
                            <button onClick={handleCheckout} className="buy-button">Buy Products</button>
                        </div>
                    </div>
                )}

                {isHistoryVisible && (
                    <div className="history-container">
                        <div className="history-modal">
                            <h2>Transaction History</h2>
                            <button onClick={() => setIsHistoryVisible(false)} className="close-button">Close</button>
                            <ul>
                                {transactionHistory.map((transaction, index) => (
                                    <li key={index}>
                                        <p>Date: {new Date(transaction.date).toLocaleString()}</p>
                                        <p>Total: ₱{transaction.totalAmount}</p> {/* Change to Peso sign */}
                                        <p>Paid: ₱{transaction.moneyPaid}</p> {/* Change to Peso sign */}
                                        <p>Change: ₱{transaction.change}</p> {/* Change to Peso sign */}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default POS;

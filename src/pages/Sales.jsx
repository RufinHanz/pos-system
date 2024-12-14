import React, { useState, useEffect } from "react";
import { db, collection, getDocs } from "../database/firebase";
import Sidebar from "../component/Sidebar";
import "../pages/pagescss/POS.css";

const Sales = () => {
    const [transactionHistory, setTransactionHistory] = useState([]);

    // Fetch transaction history
    useEffect(() => {
        const fetchTransactionHistory = async () => {
            const transactionsCollection = collection(db, "transactions");
            const transactionsSnapshot = await getDocs(transactionsCollection);
            const history = transactionsSnapshot.docs.map((doc) => doc.data());
            setTransactionHistory(history);
        };

        fetchTransactionHistory();
    }, []);

    return (
        <div className="app-container">
            <Sidebar />
            <div className="page-content">
                <h1>SALES</h1>

                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product(s)</th> {/* New column for Product(s) */}
                            <th>Total Amount</th>
                            <th>Money Paid</th>
                            <th>Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionHistory.map((transaction, index) => (
                            <tr key={index}>
                                <td>{new Date(transaction.date).toLocaleString()}</td>

                                {/* Displaying Product(s) */}
                                <td>
                                    {transaction.products?.map((product, productIndex) => (
                                        <div key={productIndex}>
                                            [{product.productID}] {product.productName}
                                        </div>
                                    ))}
                                </td>

                                <td>₱{transaction.totalAmount.toFixed(2)}</td>
                                <td>₱{transaction.moneyPaid.toFixed(2)}</td>
                                <td>₱{transaction.change.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Sales;

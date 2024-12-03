import React, { useState, useEffect } from "react";
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "../database/firebase";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Sidebar from "../component/Sidebar";
import Select from "react-select";
import "../pages/pagescss/Stocks.css";

const Stocks = () => {
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [dateAdded, setDateAdded] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [currentStockId, setCurrentStockId] = useState("");

    // Fetch products for the dropdown
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

        const sortedStockList = stockList.sort((a, b) => a.productID - b.productID);
        setStocks(sortedStockList);
        setFilteredStocks(sortedStockList);
    };

    const addStock = async () => {
        if (!selectedProduct || !quantity || !dateAdded) {
            alert("Product, Quantity, and Date Added are required!");
            return;
        }

        const isProductExist = stocks.some(
            (stock) => stock.productID === selectedProduct.value
        );
        if (isProductExist) {
            alert("This product is already in stock. Please select another product.");
            return;
        }

        if (window.confirm("Do you want to add this stock?")) {
            await addDoc(collection(db, "stocks"), {
                productID: selectedProduct.value,
                productName: selectedProduct.label,
                quantity: parseInt(quantity),
                expiryDate: expiryDate || null,
                dateAdded,
            });
            fetchStocks();
            setIsModalOpen(false);
            resetFormFields();
            alert("Stock added successfully!");
        }
    };

    const editStock = async () => {
        if (!selectedProduct || !quantity || !dateAdded) {
            alert("Product, Quantity, and Date Added are required!");
            return;
        }

        if (window.confirm("Do you want to save changes to this stock?")) {
            const stockDoc = doc(db, "stocks", currentStockId);
            await updateDoc(stockDoc, {
                productID: selectedProduct.value,
                productName: selectedProduct.label,
                quantity: parseInt(quantity),
                expiryDate: expiryDate || null,
                dateAdded,
            });
            fetchStocks();
            setIsModalOpen(false);
            resetFormFields();
            alert("Stock updated successfully!");
        }
    };

    const resetFormFields = () => {
        setSelectedProduct(null);
        setQuantity("");
        setExpiryDate("");
        setDateAdded("");
        setEditMode(false);
        setCurrentStockId("");
    };

    const deleteStock = async (id) => {
        if (window.confirm("Do you want to delete this stock?")) {
            const stockDoc = doc(db, "stocks", id);
            await deleteDoc(stockDoc);
            fetchStocks();
            alert("Stock deleted successfully!");
        }
    };

    const openEditModal = (stock) => {
        setSelectedProduct({
            value: stock.productID,
            label: `[ ${stock.productID} ] [ ${stock.productName} ]`,
        });
        setQuantity(stock.quantity);
        setExpiryDate(stock.expiryDate || "");
        setDateAdded(stock.dateAdded);
        setCurrentStockId(stock.id);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = stocks.filter(
            (stock) =>
                stock.productName.toLowerCase().includes(term) ||
                stock.productID.toString().toLowerCase().includes(term)
        );
        setFilteredStocks(filtered);
    };

    useEffect(() => {
        fetchProducts();
        fetchStocks();
    }, []);

    return (
        <div className="app-container">
            <Sidebar />
            <div className="page-content">
                <h1>STOCKS</h1>
                <input
                    type="text"
                    placeholder="Search by Product Name or ID"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-bar"
                />
                <button onClick={() => setIsModalOpen(true)} className="add-stock-button">
                    Add Stock
                </button>

                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>{editMode ? "Edit Stock" : "Add New Stock"}</h2>
                            <label>Date Added</label>
                            <input
                                type="date"
                                value={dateAdded}
                                onChange={(e) => setDateAdded(e.target.value)}
                            />
                            <label>Product</label>
                            <Select
                                options={products.map((product) => ({
                                    value: product.productID,
                                    label: `[ ${product.productID} ] [ ${product.productName} ]`,
                                }))}
                                value={selectedProduct}
                                onChange={setSelectedProduct}
                                placeholder="Search for a product"
                                isClearable
                                isSearchable
                            />
                            <label>Quantity</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                            <label>Expiry Date (Optional)</label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                            <button onClick={editMode ? editStock : addStock}>
                                {editMode ? "Update Stock" : "Add Stock"}
                            </button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <table>
                    <thead>
                        <tr>
                            <th>Date Added</th>
                            <th>Product ID & Name</th>
                            <th>Quantity</th>
                            <th>Expiry</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStocks.map((stock) => (
                            <tr key={stock.id}>
                                <td>{stock.dateAdded}</td>
                                <td>[ {stock.productID} ] [ {stock.productName} ]</td>
                                <td>{stock.quantity}</td>
                                <td>{stock.expiryDate || "N/A"}</td>
                                <td>
                                    <button onClick={() => openEditModal(stock)} className="edit-button">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => deleteStock(stock.id)} className="delete-button">
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Stocks;

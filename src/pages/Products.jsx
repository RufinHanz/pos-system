import React, { useState, useEffect } from "react";
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "../database/firebase";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Sidebar from "../component/Sidebar";
import "../pages/pagescss/Products.css";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [productID, setProductID] = useState("");
    const [productCode, setProductCode] = useState("");
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editMode, setEditMode] = useState(false); 
    const [currentProductId, setCurrentProductId] = useState(""); 

    // Fetch products from Firebase and sort by productID
    const fetchProducts = async () => {
        const productsCollection = collection(db, "products");
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs
            .map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            .sort((a, b) => a.productID - b.productID); // Sort table
        setProducts(productList);
        setFilteredProducts(productList);
    };

    // Check if the productID or productCode already exists
    const checkProductExistence = (productID, productCode) => {
        return products.some(product =>
            (product.productID === productID && product.id !== currentProductId) ||
            (product.productCode === productCode && product.id !== currentProductId)
        );
    };

    // Add or update a product in the database
    const saveProduct = async () => {
        if (
            !productID ||
            !productCode ||
            !productName ||
            !productDescription ||
            !productPrice ||
            !/^\d+$/.test(productID) // Check if productID is a nonnegative integer
        ) {
            alert("All fields are required, and Product ID must be a nonnegative integer!");
            return;
        }

        // Check if the productID or productCode already exists
        const isUnique = !checkProductExistence(parseInt(productID, 10), productCode);
        if (!isUnique) {
            alert("The Product ID or Product Code already exists. Please choose a different one.");
            return;
        }

        if (editMode) {
            // Update existing product
            if (window.confirm("Do you want to save changes to this product?")) {
                const productDoc = doc(db, "products", currentProductId);
                await updateDoc(productDoc, {
                    productID: parseInt(productID, 10),
                    productCode,
                    productName,
                    productDescription,
                    productPrice: parseFloat(productPrice),
                });
                alert("Product updated successfully!");
            }
        } else {
            // Add a new product
            if (window.confirm("Do you want to add this product?")) {
                await addDoc(collection(db, "products"), {
                    productID: parseInt(productID, 10),
                    productCode,
                    productName,
                    productDescription,
                    productPrice: parseFloat(productPrice),
                });
                alert("Product added successfully!");
            }
        }

        fetchProducts();
        closeModal();
    };

    // Delete a product and stock(optional)
    const deleteProduct = async (id, productID) => {
        if (window.confirm("Do you want to delete this product?")) {
            const productDoc = doc(db, "products", id);
            await deleteDoc(productDoc);

            /* Delete Stock (optional)
            const stocksCollection = collection(db, "stocks");
            const stockSnapshot = await getDocs(stocksCollection);

            const stockDocsToDelete = stockSnapshot.docs.filter((stockDoc) => {
                const stockData = stockDoc.data();
                return stockData.productID === productID; // Match the productID
            });

            for (const stockDoc of stockDocsToDelete) {
                await deleteDoc(doc(db, "stocks", stockDoc.id));
            }*/

            fetchProducts();
            alert("Product and associated stock deleted successfully!");
        }
    };

    const openEditModal = (product) => {
        setEditMode(true);
        setCurrentProductId(product.id);
        setProductID(product.productID.toString());
        setProductCode(product.productCode);
        setProductName(product.productName);
        setProductDescription(product.productDescription);
        setProductPrice(product.productPrice.toString());
        setIsModalOpen(true);
    };

    // Open modal for adding a new product
    const openAddProductModal = () => {
        resetFormFields();
        setEditMode(false);
        setIsModalOpen(true);
    };

    // Close the modal
    const closeModal = () => {
        resetFormFields();
        setIsModalOpen(false);
    };

    // Reset input fields
    const resetFormFields = () => {
        setProductID("");
        setProductCode("");
        setProductName("");
        setProductDescription("");
        setProductPrice("");
        setCurrentProductId("");
    };

    // Restrict Product Price to non-negative numbers
    const handleProductPriceChange = (e) => {
        const value = e.target.value;
        if (value === "" || Number(value) >= 0) {
            setProductPrice(value);
        }
    };

    // Filter products based on search term
    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = products.filter(
            (product) =>
                product.productID.toString().includes(term) || product.productCode.toLowerCase().includes(term) || product.productName.toLowerCase().includes(term)
        );
        setFilteredProducts(filtered);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="app-container">
            <Sidebar />
            <div className="page-content">
                <h1>PRODUCTS</h1>
                <input
                    type="text"
                    placeholder="Search by Product ID, Code, or Name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-bar"
                />

                <button onClick={openAddProductModal} className="add-product-button">Add Product</button>

                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>{editMode ? "Edit Product" : "Add New Product"}</h2>
                            <label>Product ID</label>
                            <input
                                type="text"
                                placeholder="Enter Product ID (nonnegative integer)"
                                value={productID}
                                onChange={(e) => setProductID(e.target.value)}
                                disabled={editMode}
                            />
                            <label>Product Code</label>
                            <input
                                type="text"
                                placeholder="Enter Product Code"
                                value={productCode}
                                onChange={(e) => setProductCode(e.target.value)}
                            />
                            <label>Product Name</label>
                            <input
                                type="text"
                                placeholder="Enter Product Name"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                            <label>Product Description</label>
                            <input
                                type="text"
                                placeholder="Enter Product Description"
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                            />
                            <label>Product Price</label>
                            <input
                                type="number"
                                placeholder="Enter Product Price"
                                value={productPrice}
                                onChange={handleProductPriceChange}
                            />
                            <button onClick={saveProduct}>Submit</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                )}

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Product Code</th>
                            <th>Product Description</th>
                            <th>Product Price (Peso)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id}>
                                <td>{product.productID}</td>
                                <td>{product.productName}</td>
                                <td>{product.productCode}</td>
                                <td>{product.productDescription}</td>
                                <td>{product.productPrice}</td>
                                <td>
                                    <button onClick={() => openEditModal(product)} className="edit-button">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => deleteProduct(product.id, product.productID)} className="delete-button">
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

export default Products;
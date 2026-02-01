import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, ShoppingBag, ShoppingCart, Package, LogOut, PlusCircle, Upload } from 'lucide-react';

const API = "http://127.0.0.1:8000/api";

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  // State for the selected file from the laptop
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Form State for Adding Products
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: 10
  });

  useEffect(() => {
    fetchProducts();
    fetchCart();
    fetchOrders();
  }, [user]);

  const fetchProducts = async () => {
    const res = await axios.get(`${API}/products/`);
    setProducts(res.data);
  };

  const fetchCart = async () => {
    const res = await axios.get(`${API}/cart/${user}/`);
    setCart(res.data);
  };

  const fetchOrders = async () => {
    const res = await axios.get(`${API}/orders/${user}/`);
    setOrders(res.data);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create a local preview
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // We must use FormData to send files to the backend
    const data = new FormData();
    data.append('name', newProduct.name);
    data.append('description', newProduct.description);
    data.append('price', newProduct.price);
    data.append('stock', newProduct.stock);
    data.append('username', user); // To track who is the seller
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await axios.post(`${API}/products/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert("Product added successfully!");
      setNewProduct({ name: '', description: '', price: '', stock: 10 });
      setImageFile(null);
      setPreviewUrl(null);
      fetchProducts();
      setActiveTab('home');
    } catch (err) {
      alert("Error adding product. Check if backend handles multipart/form-data.");
    }
  };

  const addToCart = async (id) => {
    await axios.post(`${API}/cart/${user}/`, { product_id: id });
    fetchCart();
    alert("Added to cart!");
  };

  const checkout = async () => {
    await axios.post(`${API}/orders/${user}/`);
    fetchCart();
    fetchOrders();
    setActiveTab('orders');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-indigo-400">E-SHOP</div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'home' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
            <Home size={20} /> Home
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'products' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
            <PlusCircle size={20} /> Add Product
          </button>
          <button onClick={() => setActiveTab('cart')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'cart' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
            <ShoppingCart size={20} /> Cart ({cart.length})
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'orders' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
            <Package size={20} /> Order
          </button>
        </nav>
        <button onClick={onLogout} className="p-6 flex items-center gap-3 hover:bg-red-700 transition">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10 overflow-y-auto">
        {/* HOME: VIEW ALL PRODUCTS */}
        {activeTab === 'home' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-slate-800">Shop Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition border border-slate-200">
                  <img src={p.image || 'https://via.placeholder.com/300'} className="w-full h-48 object-cover" alt={p.name} />
                  <div className="p-5">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <p className="text-xs text-indigo-500 font-semibold mb-1">Seller: {p.seller}</p>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-indigo-600">${p.price}</span>
                      <button onClick={() => addToCart(p.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD PRODUCT FORM */}
        {activeTab === 'products' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">List a New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full p-3 border rounded-lg" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
              <textarea placeholder="Description" className="w-full p-3 border rounded-lg" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} required />
              <div className="flex gap-4">
                <input type="number" placeholder="Price" className="w-1/2 p-3 border rounded-lg" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
                <input type="number" placeholder="Stock" className="w-1/2 p-3 border rounded-lg" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} />
              </div>
              
              {/* FILE UPLOAD INPUT */}
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
                <input type="file" id="fileUpload" className="hidden" accept="image/*" onChange={handleFileChange} required />
                <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="text-gray-400" size={32} />
                  <span className="text-gray-600">{imageFile ? imageFile.name : "Click to upload product image"}</span>
                </label>
              </div>
              
              {previewUrl && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                  <img src={previewUrl} className="h-40 mx-auto rounded-lg shadow-sm" alt="Preview" />
                </div>
              )}

              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Create Product Listing</button>
            </form>
          </div>
        )}

        {/* CART VIEW */}
        {activeTab === 'cart' && (
          <div className="max-w-3xl bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                     {/* Replace with item.product__image if using absolute URIs from backend */}
                     <Package className="text-gray-300" />
                  </div>
                  <div><p className="font-bold">{item.product__name}</p><p className="text-xs text-gray-400">Qty: {item.quantity}</p></div>
                </div>
                <p className="font-bold text-indigo-600">${item.product__price}</p>
              </div>
            ))}
            {cart.length > 0 ? (
              <button onClick={checkout} className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold text-lg">Checkout Order</button>
            ) : <p className="text-gray-500">Cart is empty.</p>}
          </div>
        )}

        {/* ORDERS VIEW */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="bg-white p-5 rounded-xl border-l-8 border-indigo-500 shadow flex justify-between">
                  <div><p className="text-xs text-gray-400 font-bold">ORDER #{o.id}</p><p className="text-xl font-black">${o.total_price}</p></div>
                  <div className="text-right">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{o.status}</span>
                    <p className="text-xs text-gray-400 mt-2">{o.created_at}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
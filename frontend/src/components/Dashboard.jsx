import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, ShoppingBag, ShoppingCart, Package, LogOut } from 'lucide-react';

const API = "http://127.0.0.1:8000/api";

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

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
            <ShoppingBag size={20} /> Your Product
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
        {activeTab === 'home' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-slate-800">Shop Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition border border-slate-200">
                  <img src={p.image_url || 'https://via.placeholder.com/300'} className="w-full h-48 object-cover" alt={p.name} />
                  <div className="p-5">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">{p.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-indigo-600">${p.price}</span>
                      <button onClick={() => addToCart(p.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="max-w-3xl bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b py-4">
                <div className="flex items-center gap-4">
                  <img src={item.product__image_url} className="w-12 h-12 rounded bg-gray-100" />
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

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="bg-white p-5 rounded-xl border-l-8 border-indigo-500 shadow flex justify-between">
                  <div><p className="text-xs text-gray-400 font-bold">ORDER #{o.id}</p><p className="text-xl font-black">${o.total_price}</p></div>
                  <div className="text-right"><span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{o.status}</span><p className="text-xs text-gray-400 mt-2">{o.created_at}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
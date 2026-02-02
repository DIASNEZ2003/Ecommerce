import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Home, ShoppingBag, ShoppingCart, Package, LogOut, PlusCircle, 
  Upload, Tag, X, CheckCircle, AlertCircle, Trash2, Edit3, HelpCircle, 
  Star, TrendingUp, History, Search, AlignLeft, ImagePlus
} from 'lucide-react';

const API = "http://127.0.0.1:8000/api";
const categories = ["All", "Foods", "Items", "Gadgets", "Furnitures", "Accessories", "Clothes", "Others"];

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusModal, setStatusModal] = useState({ show: false, msg: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, msg: '', onConfirm: null });
  const [editProduct, setEditProduct] = useState(null); // State for the product being edited

  const [searchQuery, setSearchQuery] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock: 10, category: 'Others' });

  useEffect(() => { fetchAll(); }, [user]);

  const fetchAll = () => { fetchProducts(); fetchCart(); fetchOrders(); };
  const showStatus = (msg, type = 'success') => setStatusModal({ show: true, msg, type });
  
  const fetchProducts = async () => { 
    try { 
      const res = await axios.get(`${API}/products/`); 
      setProducts(res.data); 
    } catch(e){} 
  };
  
  const fetchCart = async () => { try { const res = await axios.get(`${API}/cart/${user}/`); setCart(res.data); } catch(e){} };
  const fetchOrders = async () => { try { const res = await axios.get(`${API}/orders/${user}/`); setOrders(res.data); } catch(e){} };

  const handleBuyMarket = (p) => {
    setConfirmModal({
      show: true,
      msg: `Confirm purchase of ${p.name} for ₱${p.price}?`,
      onConfirm: async () => {
        try {
          await axios.post(`${API}/orders/${user}/`, { product_id: p.id, rating: 5, comment: "Boutique Purchase" });
          showStatus("Purchase Successful!"); fetchAll();
        } catch (err) { showStatus("Error buying item", "error"); }
      }
    });
  };

  const handleAddToCart = (p) => {
    setConfirmModal({
      show: true,
      msg: `Add ${p.name} to basket?`,
      onConfirm: async () => {
        try {
          await axios.post(`${API}/cart/${user}/`, { product_id: p.id });
          fetchCart(); showStatus("Added!");
        } catch (err) { showStatus("Error", "error"); }
      }
    });
  };

  const handleDeleteProduct = (id) => {
    setConfirmModal({
      show: true,
      msg: "Permanently delete this product?",
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/products/${id}/`);
          showStatus("Deleted"); fetchProducts();
        } catch (e) { showStatus("Failed", "error"); }
      }
    });
  };

  // Fixed Update Logic
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/products/${editProduct.id}/`, editProduct);
      setEditProduct(null); 
      showStatus("Product Updated!"); 
      fetchProducts();
    } catch (err) { showStatus("Update Failed", "error"); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', newProduct.name); 
    data.append('description', newProduct.description);
    data.append('category', newProduct.category);
    data.append('price', newProduct.price); 
    data.append('stock', newProduct.stock);
    data.append('username', user); 
    if (imageFile) data.append('image', imageFile);
    
    await axios.post(`${API}/products/`, data);
    showStatus("Product Listed!"); 
    setNewProduct({ name: '', description: '', price: '', stock: 10, category: 'Others' });
    setImageFile(null); 
    fetchProducts();
  };

  const Stars = ({ count, interactive, onSet }) => (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={interactive ? 24 : 10} onClick={() => interactive && onSet(n)} 
          fill={n <= count ? "#db2777" : "none"} color={n <= count ? "#db2777" : "#fbcfe8"} 
          className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""} />
      ))}
    </div>
  );

  const availableProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const myProducts = products.filter(p => p.seller === user);
  const totalSpent = Array.isArray(orders) ? orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0).toFixed(2) : "0.00";

  return (
    <div className="flex h-screen bg-[#fffafa] text-slate-900 overflow-hidden font-sans">
      <div className="w-64 bg-[#0a0a0c] text-white flex flex-col shadow-2xl relative z-10">
        <div className="p-8 text-2xl font-black text-[#db2777] italic tracking-tighter uppercase text-center">HEX<span className="text-white">SHOP</span></div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={18}/>} label="Market" />
          <NavItem active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<PlusCircle size={18}/>} label="My Shop" />
          <NavItem active={activeTab === 'cart'} onClick={() => setActiveTab('cart')} icon={<ShoppingCart size={18}/>} label={`Basket (${cart?.length || 0})`} />
          <NavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<History size={18}/>} label="History" />
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={() => setConfirmModal({show: true, msg: "Log out of session?", onConfirm: onLogout})} className="w-full p-4 bg-pink-600/10 text-pink-500 rounded-2xl font-bold flex justify-center items-center gap-3 hover:bg-pink-600 hover:text-white transition-all text-[10px] uppercase tracking-widest"><LogOut size={14}/> Logout</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 bg-white shadow-inner">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">{activeTab === 'home' ? "Discover" : activeTab.toUpperCase()}</h1>
          <div className="border-2 border-pink-100 bg-white rounded-xl flex items-center px-4 py-2 focus-within:border-pink-500 transition-all">
            <Search size={14} className="mr-3 text-pink-400"/>
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-[10px] font-bold w-40" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {activeTab === 'home' && (
          <>
            <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    selectedCategory === cat 
                    ? 'bg-[#db2777] text-white shadow-lg scale-105' 
                    : 'bg-white text-slate-400 border-2 border-pink-50 hover:border-pink-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {availableProducts.map(p => (
                <ProductCard key={p.id} p={p} onBuy={() => handleBuyMarket(p)} onCart={() => handleAddToCart(p)} onDetail={() => setSelectedProduct(p)} rating={p.reviews?.length > 0 ? <Stars count={p.avg_rating}/> : null} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-[#db2777] p-6 rounded-[32px] text-white shadow-xl">
                  <p className="text-[9px] font-black uppercase opacity-70 mb-1">Total Profile Spend</p>
                  <p className="text-3xl font-black italic tracking-tighter">₱{totalSpent}</p>
               </div>
               <div className="bg-white p-6 rounded-[40px] border-2 border-pink-50 shadow-sm">
                  <h2 className="text-[10px] font-black mb-4 uppercase text-pink-500">New Product</h2>
                  <form onSubmit={handleAddProduct} className="space-y-3">
                    <input type="text" placeholder="Name" className="w-full p-3 border-2 border-pink-100 bg-white rounded-xl text-[10px] font-bold focus:border-pink-500 outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                    <textarea placeholder="Description" className="w-full p-3 border-2 border-pink-100 bg-white rounded-xl text-[10px] font-bold h-20 resize-none focus:border-pink-500 outline-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} required />
                    <select 
                      className="w-full p-3 border-2 border-pink-100 bg-white rounded-xl text-[10px] font-bold outline-none focus:border-pink-500 appearance-none"
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      required
                    >
                      {categories.filter(c => c !== "All").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Price" className="w-1/2 p-3 border-2 border-pink-100 bg-white rounded-xl text-[10px] font-bold focus:border-pink-500" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                      <input type="number" placeholder="Stock" className="w-1/2 p-3 border-2 border-pink-100 bg-white rounded-xl text-[10px] font-bold focus:border-pink-500" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
                    </div>
                    <div className="border-2 border-dashed border-pink-200 p-6 rounded-2xl text-center bg-pink-50/10 cursor-pointer hover:bg-pink-50 transition-all group" onClick={() => document.getElementById('imageInput').click()}>
                      <input type="file" id="imageInput" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                      <ImagePlus size={24} className="mx-auto text-pink-300 group-hover:text-pink-500 mb-2"/>
                      <span className="text-[9px] font-black text-pink-400 uppercase tracking-tighter">{imageFile ? imageFile.name : "Select Product Photo"}</span>
                    </div>
                    <button type="submit" className="w-full bg-[#0a0a0c] text-white py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#db2777] active:scale-95 transition-all">List to Market</button>
                  </form>
               </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6 h-fit">
              {myProducts.map(p => (
                <div key={p.id} className="bg-white rounded-[24px] border-2 border-pink-50 p-2 shadow-sm group">
                  <div className="aspect-square rounded-[18px] overflow-hidden mb-2"><img src={p.image} className="w-full h-full object-cover" /></div>
                  <div className="px-2 flex justify-between items-center pb-1">
                    <div>
                      <p className="font-black text-[9px] uppercase truncate text-slate-800">{p.name}</p>
                      <p className="text-[8px] font-bold text-pink-400">QTY: {p.stock}</p>
                    </div>
                    <div className="flex gap-1">
                      {/* Fixed Edit Button Call */}
                      <button onClick={() => setEditProduct({...p})} className="p-1.5 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-600 hover:text-white transition-all"><Edit3 size={10}/></button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={10}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CART AND ORDERS TABS REMAIN THE SAME --- */}
        {activeTab === 'cart' && (
          <div className="max-w-4xl mx-auto bg-white rounded-[32px] border-2 border-pink-50 shadow-xl overflow-hidden text-[10px]">
            <table className="w-full text-left">
              <thead className="bg-[#fffafa] font-black uppercase text-pink-500 border-b border-pink-50 text-[9px]">
                <tr><th className="p-6">Product Image</th><th className="p-6">Value</th><th className="p-6 text-center">Discard</th></tr>
              </thead>
              <tbody className="divide-y divide-pink-50 font-bold uppercase tracking-tighter">
                {cart.map(i => (
                  <tr key={i.id}>
                    <td className="p-5 flex items-center gap-5"><img src={i.product__image} className="w-12 h-12 rounded-xl object-cover shadow-sm" />{i.product__name}</td>
                    <td className="p-5 text-pink-600 font-black">₱{parseFloat(i.product__price || 0).toFixed(2)}</td>
                    <td className="p-5 text-center"><button onClick={async () => { await axios.delete(`${API}/cart/${user}/`, {data: {cart_item_id: i.id}}); fetchCart(); }} className="text-pink-300 hover:text-red-500 transition-colors p-2"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cart.length > 0 && (
              <div className="p-8 bg-[#fffafa] border-t border-pink-50 flex justify-between items-center">
                <p className="text-xl font-black text-slate-900 italic">Total: ₱{cart.reduce((s, i) => s + parseFloat(i.product__price || 0) * i.quantity, 0).toFixed(2)}</p>
                <button onClick={() => setConfirmModal({show: true, msg: "Complete bulk purchase?", onConfirm: async () => { await axios.post(`${API}/orders/${user}/`); fetchAll(); setActiveTab('orders'); showStatus("Order Success!"); }})} className="bg-[#db2777] text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg">Checkout All</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto space-y-3">
            {orders.map(o => (
              <div key={o.id} className="bg-white p-6 rounded-[28px] border-2 border-pink-50 flex justify-between items-center shadow-sm">
                <div className="flex gap-6 items-center">
                  <img src={o.product_image} className="w-14 h-14 rounded-2xl object-cover bg-slate-50" />
                  <div><p className="font-black text-slate-800 uppercase text-[10px]">{o.product_name}</p><p className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">Order ID #{o.id}</p></div>
                </div>
                <p className="font-black text-pink-600 text-base">₱{parseFloat(o.total_price || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* FIXED EDIT MODAL UI */}
      {editProduct && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border-4 border-pink-100 relative">
            <button onClick={() => setEditProduct(null)} className="absolute top-6 right-6 text-slate-300 hover:text-pink-500"><X size={24}/></button>
            <h2 className="text-xl font-black uppercase text-slate-800 mb-6">Edit Product</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" className="w-full p-4 border-2 border-pink-50 rounded-2xl text-[10px] font-bold focus:border-pink-500 outline-none" value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} placeholder="Name" required />
              <textarea className="w-full p-4 border-2 border-pink-50 rounded-2xl text-[10px] font-bold h-24 resize-none outline-none focus:border-pink-500" value={editProduct.description} onChange={e => setEditProduct({...editProduct, description: e.target.value})} placeholder="Description" required />
              <select className="w-full p-4 border-2 border-pink-50 rounded-2xl text-[10px] font-bold outline-none focus:border-pink-500" value={editProduct.category} onChange={e => setEditProduct({...editProduct, category: e.target.value})}>
                {categories.filter(c => c !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="flex gap-3">
                <input type="number" className="w-1/2 p-4 border-2 border-pink-50 rounded-2xl text-[10px] font-bold focus:border-pink-500 outline-none" value={editProduct.price} onChange={e => setEditProduct({...editProduct, price: e.target.value})} placeholder="Price" required />
                <input type="number" className="w-1/2 p-4 border-2 border-pink-50 rounded-2xl text-[10px] font-bold focus:border-pink-500 outline-none" value={editProduct.stock} onChange={e => setEditProduct({...editProduct, stock: e.target.value})} placeholder="Stock" required />
              </div>
              <button type="submit" className="w-full bg-[#db2777] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all shadow-lg mt-2">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-pink-100">
            <HelpCircle className="mx-auto text-pink-500 mb-4" size={40}/><p className="text-slate-800 font-black text-[11px] mb-8 uppercase tracking-tight">{confirmModal.msg}</p>
            <div className="flex gap-3"><button onClick={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, show: false }); }} className="flex-1 bg-[#db2777] text-white py-4 rounded-xl font-black text-[9px] uppercase active:scale-95">Confirm</button><button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-xl font-black text-[9px] uppercase active:scale-95">Cancel</button></div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-pink-100">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${statusModal.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-pink-50 text-pink-600'}`}><CheckCircle size={36}/></div>
            <p className="text-slate-800 font-black uppercase text-[10px] tracking-widest mb-8">{statusModal.msg}</p>
            <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="w-full bg-[#0a0a0c] text-white py-4 rounded-xl font-black text-[10px] uppercase">Close</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0c]/80 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-sm rounded-[64px] p-10 relative shadow-2xl border-4 border-pink-100 flex flex-col items-center text-center">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 p-3 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100"><X size={20} /></button>
            <div className="w-44 h-44 rounded-[40px] overflow-hidden shadow-2xl border-4 border-pink-50 -mt-20 mb-6"><img src={selectedProduct.image} className="w-full h-full object-cover" /></div>
            <h2 className="text-2xl font-black uppercase text-slate-800 leading-none mb-1">{selectedProduct.name}</h2>
            <p className="text-[#db2777] font-black text-2xl mb-1 tracking-tighter italic">₱{selectedProduct.price}</p>
            <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-4">Available: {selectedProduct.stock}</p>
            <div className="mb-6 scale-75"><Stars count={selectedProduct.avg_rating} /></div>
            <div className="mb-8 p-5 bg-pink-50/20 rounded-[32px] text-[10px] text-pink-900 font-bold italic border-2 border-pink-100/50 leading-relaxed">"{selectedProduct.description}"</div>
            {selectedProduct.seller !== user && (
              <div className="w-full space-y-4">
                  <div className="space-y-3">
                    <Stars count={userRating} interactive={true} onSet={setUserRating} />
                    <textarea className="w-full p-4 border-2 border-pink-200 bg-white rounded-2xl text-[10px] font-bold h-20 resize-none outline-none focus:border-pink-500 transition-all" placeholder="Tell us your experience..." value={userComment} onChange={e => setUserComment(e.target.value)} />
                  </div>
                  <button onClick={() => handleBuyMarket(selectedProduct)} className="w-full bg-[#db2777] text-white py-5 rounded-[28px] font-black text-xs uppercase shadow-xl hover:shadow-pink-200 active:scale-95 transition-all">Buy & Rate</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label }) {
  return (<button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] ${active ? 'bg-[#db2777] text-white shadow-xl scale-[1.03]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{icon} {label}</button>);
}

function ProductCard({ p, onBuy, onCart, onDetail, rating }) {
  return (
    <div onClick={onDetail} className="bg-white rounded-[32px] border-2 border-pink-50 overflow-hidden group hover:shadow-xl hover:border-pink-200 cursor-pointer transition-all p-2.5 relative text-center active:scale-[0.98] duration-300">
      <div className="aspect-square overflow-hidden relative rounded-[24px] bg-[#fff1f2]/50"><img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute top-2 right-2 bg-[#0a0a0c]/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[9px] font-black italic shadow-lg">₱{p.price}</div></div>
      <div className="mt-3 px-1 pb-1">
        <h3 className="font-black truncate text-[10px] uppercase tracking-tight text-slate-800 mb-0.5 leading-none">{p.name}</h3>
        <p className="text-[8px] font-bold text-pink-400 uppercase mb-2 tracking-tighter">STOCK: {p.stock}</p>
        <div className="mb-3 scale-75 origin-center">{rating}</div>
        <div className="flex gap-1.5"><button onClick={(e) => { e.stopPropagation(); onBuy(); }} className="flex-1 bg-[#db2777] text-white py-2 rounded-lg text-[8px] font-black uppercase hover:bg-[#0a0a0c] transition-all">Buy</button><button onClick={(e) => { e.stopPropagation(); onCart(); }} className="flex-1 bg-slate-50 text-slate-800 py-2 rounded-lg text-[8px] font-black uppercase hover:bg-pink-100 transition-all">Basket</button></div>
      </div>
    </div>
  );
}
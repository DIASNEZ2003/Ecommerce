import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Home, ShoppingBag, ShoppingCart, Package, LogOut, PlusCircle, 
  Upload, Tag, X, CheckCircle, AlertCircle, Trash2, Edit3, HelpCircle, 
  Star, TrendingUp, History, Search, AlignLeft, ImagePlus, Bell, MessageSquare, ChevronRight, Share2, Heart, DollarSign, Send, Plus, User, RotateCcw
} from 'lucide-react';

const API = "http://127.0.0.1:8000/api";
const categories = ["All", "Gadgets", "Foods", "Items", "Accessories", "Clothes", "Furnitures", "Others"];

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  
  const [statusModal, setStatusModal] = useState({ show: false, msg: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, msg: '', onConfirm: null });
  const [showAddModal, setShowAddModal] = useState(false);
  
  // State for Add/Edit Form
  const [productForm, setProductForm] = useState({ id: null, name: '', description: '', price: '', stock: 10, category: 'Others' });
  const [isEditing, setIsEditing] = useState(false);
  
  const [imageFile, setImageFile] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => { 
    fetchAll(); 
    const savedPic = localStorage.getItem(`hexshop_avatar_${user}`);
    if (savedPic) setProfilePic(savedPic);
    const intv = setInterval(fetchNotifs, 15000); 
    return () => clearInterval(intv);
  }, [user]);

  const fetchAll = () => { fetchProducts(); fetchCart(); fetchOrders(); fetchNotifs(); };
  
  const fetchProducts = async () => { 
    try { 
      const res = await axios.get(`${API}/products/`); 
      setProducts(res.data || []); 
      if(selectedProduct) {
        const up = res.data.find(x => x.id === selectedProduct.id);
        if(up) setSelectedProduct(up);
      }
    } catch(e){} 
  };

  const fetchCart = async () => { try { const res = await axios.get(`${API}/cart/${user}/`); setCart(res.data || []); } catch(e){} };
  const fetchOrders = async () => { try { const res = await axios.get(`${API}/orders/${user}/`); setOrders(res.data || []); } catch(e){} };
  
  const fetchNotifs = async () => { try { const res = await axios.get(`${API}/notifications/${user}/`); setNotifications(res.data || []); } catch(e){} };

  const handleToggleNotifs = async () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) { try { await axios.post(`${API}/notifications/${user}/`); fetchNotifs(); } catch(e) {} }
  };

  const handleReviewSubmit = async (p) => {
    if(!userComment) return alert("Please write a comment");
    try {
      await axios.post(`${API}/orders/${user}/`, { product_id: p.id, rating: userRating, comment: userComment });
      fetchAll();
      setStatusModal({show: true, msg: "Review Submitted Successfully!"});
      setUserComment("");
    } catch(e) { alert("Error submitting review"); }
  };

  const handleBuyNow = async (p) => {
     try {
      await axios.post(`${API}/orders/${user}/`, { product_id: p.id, rating: 5, comment: "Quick Buy" });
      fetchAll();
      setStatusModal({show: true, msg: "Purchased Successfully!"});
      setSelectedProduct(null);
    } catch(e) { alert("Error purchasing item"); }
  };

  // --- MY SHOP ACTIONS ---

  const handleDeleteProduct = (id) => {
    setConfirmModal({
      show: true,
      msg: "Delete this product permanently?",
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/products/${id}/`);
          fetchAll();
          setStatusModal({ show: true, msg: "Product Deleted" });
        } catch (e) { alert("Delete failed"); }
      }
    });
  };

  const handleRestock = (p) => {
    const amount = prompt("Enter quantity to restock:", "10");
    if (amount && !isNaN(amount)) {
      const newStock = parseInt(amount);
      // We assume the backend accepts a partial update or we just send the new stock
      // For this mock, we pretend we are updating the product
      const updatedData = { ...p, stock: newStock };
      // In a real app you'd use a specific endpoint or PATCH/PUT
      // Here we simulate the update call similar to handleFormSubmit
      // For simplicity in this demo structure, let's just assume we update it:
      axios.put(`${API}/products/${p.id}/`, updatedData).then(() => {
        fetchAll();
        setStatusModal({ show: true, msg: "Restocked Successfully!" });
      });
    }
  };

  const openEditModal = (p) => {
    setProductForm({ 
      id: p.id,
      name: p.name, 
      description: p.description, 
      price: p.price, 
      stock: p.stock, 
      category: p.category 
    });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setProductForm({ id: null, name: '', description: '', price: '', stock: 10, category: 'Others' });
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(productForm).forEach(k => {
      if(k !== 'id') data.append(k, productForm[k]);
    });
    data.append('username', user);
    if (imageFile) data.append('image', imageFile);
    
    try {
      if (isEditing) {
        await axios.put(`${API}/products/${productForm.id}/`, productForm); // Note: file upload might need specific handling for PUT depending on backend
        setStatusModal({ show: true, msg: "Product Updated!" });
      } else {
        await axios.post(`${API}/products/`, data);
        setStatusModal({ show: true, msg: "Product Listed!" });
      }
      fetchAll();
      setShowAddModal(false);
      setImageFile(null);
    } catch(e) { alert("Operation failed"); }
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        localStorage.setItem(`hexshop_avatar_${user}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const myProducts = products.filter(p => p.seller === user);
  const revenue = myProducts.flatMap(p => (p.sales_history || [])).reduce((sum, s) => sum + s.amount, 0);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans overflow-hidden text-slate-900">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0f1111] flex flex-col z-50">
        <div className="p-8 text-2xl font-black text-pink-500 italic tracking-tighter uppercase border-b border-white/5">HEX<span className="text-white">SHOP</span></div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={18}/>} label="Market" />
          <NavItem active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<PlusCircle size={18}/>} label="My Shop" />
          <NavItem active={activeTab === 'cart'} onClick={() => setActiveTab('cart')} icon={<ShoppingCart size={18}/>} label={`Basket (${cart.length})`} />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18}/>} label="History" />
        </nav>
        <button onClick={onLogout} className="m-6 p-4 bg-pink-600 text-white font-bold uppercase text-[10px] tracking-widest hover:bg-pink-700 transition-all">Logout</button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto bg-white relative">
        <header className="sticky top-0 bg-white border-b z-40 p-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 border border-slate-200 px-4 py-2 w-[500px] bg-slate-50 focus-within:border-pink-500 transition-all">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search for brands, shops and items..." className="bg-transparent outline-none text-xs font-medium w-full" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          
          <div className="flex items-center gap-6 relative">
             <div className="relative">
               <Bell size={20} className={`cursor-pointer transition-all ${showNotifs ? 'text-pink-600' : 'text-slate-400 hover:text-pink-500'}`} onClick={handleToggleNotifs} />
               {unreadCount > 0 && (
                 <div className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white animate-pulse">
                   {unreadCount}
                 </div>
               )}
               {showNotifs && (
                 <div className="absolute right-0 top-full mt-4 w-80 bg-white border border-slate-100 shadow-2xl rounded-xl overflow-hidden z-[100]">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notifications</span>
                      <button onClick={() => setShowNotifs(false)} className="text-slate-300 hover:text-pink-500"><X size={14}/></button>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scroll">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-300 text-[10px] font-bold italic">No new alerts</div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-pink-50/30' : ''}`}>
                            <p className="text-[10px] font-bold text-slate-700 leading-snug mb-1">{n.message}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{new Date(n.created_at).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                 </div>
               )}
             </div>
             
             <div className="relative group cursor-pointer" onClick={() => document.getElementById('profileUpload').click()}>
                <input type="file" id="profileUpload" className="hidden" accept="image/*" onChange={handleProfileUpload} />
                <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden border-2 border-white shadow-md group-hover:border-pink-200 transition-all">
                   {profilePic ? <img src={profilePic} className="w-full h-full object-cover" /> : user.charAt(0)}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Upload size={12} className="text-white"/>
                </div>
             </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'home' && (
            <>
              <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-white text-slate-400 border border-slate-100 hover:border-pink-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {products.filter(p => 
                    p.stock > 0 && 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    (selectedCategory === "All" || p.category === selectedCategory)
                  ).map(p => (
                  <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-white border hover:border-pink-500 hover:shadow-2xl transition-all cursor-pointer group flex flex-col relative">
                    <div className="aspect-square bg-[#fcfcfc] overflow-hidden relative">
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                          <p className="text-[9px] text-slate-400 font-bold mb-1 flex items-center gap-1"><User size={10}/> {p.seller}</p>
                          <h3 className="text-[12px] font-bold text-slate-800 uppercase truncate mb-1">{p.name}</h3>
                          <p className="text-pink-600 font-black text-sm">₱{p.price.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                        <div className="flex gap-0.5 text-yellow-400">
                          {[1,2,3,4,5].map(n => <Star key={n} size={10} fill={n <= p.avg_rating ? "currentColor" : "none"} />)}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{p.sales_count} Sold</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'shop' && (
            <div className="space-y-12">
               <div className="flex gap-6 max-w-4xl">
                  <div className="flex-1 bg-white border p-6"><p className="text-[10px] font-black text-slate-400 uppercase">Revenue</p><p className="text-2xl font-black text-pink-600">₱{revenue.toLocaleString()}</p></div>
                  <div className="flex-1 bg-white border p-6"><p className="text-[10px] font-black text-slate-400 uppercase">Items</p><p className="text-2xl font-black">{myProducts.length}</p></div>
                  <div className="flex-1 bg-[#0f1111] p-6 shadow-xl shadow-pink-500/10"><p className="text-[10px] font-black text-pink-500 uppercase">Official Rating</p><p className="text-2xl font-black text-white italic">5.0 / 5.0</p></div>
               </div>
               
               <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Your Inventory</h2>
                  <button onClick={openAddModal} className="bg-pink-600 text-white px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-pink-700 transition-all flex items-center gap-2 shadow-lg shadow-pink-200">
                    <Plus size={16} /> Add New Product
                  </button>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {myProducts.map(p => (
                      <div key={p.id} onClick={() => setSelectedProduct(p)} className="border p-2 bg-white flex flex-col hover:border-pink-500 transition-all cursor-pointer group relative">
                        {/* Gray Image + Label if Out of Stock */}
                        <div className={`aspect-square bg-slate-50 mb-2 overflow-hidden relative ${p.stock <= 0 ? 'grayscale opacity-60' : ''}`}>
                           <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                           {p.stock <= 0 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                 <span className="bg-black/80 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded-sm backdrop-blur-sm shadow-xl">Out of Stock</span>
                              </div>
                           )}
                        </div>

                        <p className="text-[8px] text-slate-400 font-bold mb-0.5"><User size={8} className="inline mr-1"/>{p.seller}</p>
                        <p className="text-[10px] font-black uppercase truncate">{p.name}</p>
                        <div className="flex justify-between items-center mt-1 mb-3">
                           <p className={`${p.stock > 0 ? 'text-pink-600' : 'text-slate-400'} font-bold text-[9px]`}>STOCK: {p.stock}</p>
                           <div className="flex gap-0.5 text-yellow-500">
                              <Star size={8} fill="currentColor"/> <span className="text-[8px] font-bold">{p.avg_rating.toFixed(1)}</span>
                           </div>
                        </div>

                        {/* RESTORED: Edit, Delete & Restock Buttons */}
                        <div className="flex gap-1 mt-auto pt-2 border-t border-slate-100">
                           <button onClick={(e) => { e.stopPropagation(); openEditModal(p); }} className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-sm hover:bg-blue-50 hover:text-blue-600 flex justify-center"><Edit3 size={12}/></button>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }} className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-sm hover:bg-red-50 hover:text-red-600 flex justify-center"><Trash2 size={12}/></button>
                           {p.stock <= 0 && (
                             <button onClick={(e) => { e.stopPropagation(); handleRestock(p); }} className="flex-[2] bg-pink-600 text-white text-[8px] font-black uppercase rounded-sm hover:bg-pink-700 flex items-center justify-center gap-1"><RotateCcw size={10}/> Restock</button>
                           )}
                        </div>
                      </div>
                  ))}
               </div>
            </div>
          )}

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
                  <button onClick={() => setConfirmModal({show: true, msg: "Complete bulk purchase?", onConfirm: async () => { await axios.post(`${API}/orders/${user}/`); fetchAll(); setActiveTab('history'); setStatusModal({show:true, msg:"Order Success!"}); }})} className="bg-[#db2777] text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg">Checkout All</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
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
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg p-10 relative shadow-2xl">
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-pink-600"><X size={20}/></button>
              <h2 className="text-2xl font-black uppercase text-slate-800 mb-8 border-l-4 border-pink-600 pl-4">{isEditing ? 'Edit Item' : 'List New Item'}</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                  <input type="text" placeholder="PRODUCT NAME" className="w-full p-4 border text-[10px] font-black outline-none focus:border-pink-500 bg-slate-50" value={productForm.name} onChange={e=>setProductForm({...productForm, name:e.target.value})} required />
                  <textarea placeholder="DESCRIPTION" className="w-full p-4 border text-[10px] font-black h-32 focus:border-pink-500 bg-slate-50 resize-none" value={productForm.description} onChange={e=>setProductForm({...productForm, description:e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="PRICE" className="w-full p-4 border text-[10px] font-black bg-slate-50" value={productForm.price} onChange={e=>setProductForm({...productForm, price:e.target.value})} required />
                    <input type="number" placeholder="STOCK" className="w-full p-4 border text-[10px] font-black bg-slate-50" value={productForm.stock} onChange={e=>setProductForm({...productForm, stock:e.target.value})} required />
                  </div>
                  <select className="w-full p-4 border text-[10px] font-black outline-none focus:border-pink-500 bg-slate-50" value={productForm.category} onChange={e=>setProductForm({...productForm, category:e.target.value})}>
                    {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="border border-dashed border-slate-300 p-6 text-center cursor-pointer hover:bg-pink-50 transition-colors" onClick={() => document.getElementById('fileUpload').click()}>
                     <input type="file" id="fileUpload" className="hidden" onChange={e=>setImageFile(e.target.files[0])} />
                     <span className="text-[10px] font-bold text-slate-400 uppercase">{imageFile ? imageFile.name : "+ Upload Image"}</span>
                  </div>
                  <button type="submit" className="w-full bg-pink-600 text-white py-4 font-black text-[10px] uppercase tracking-widest hover:bg-[#0f1111] transition-all">{isEditing ? 'Update Listing' : 'Publish Listing'}</button>
              </form>
           </div>
        </div>
      )}

      {/* --- SELECTED PRODUCT MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl flex flex-col md:flex-row relative shadow-2xl overflow-hidden max-h-[85vh] border border-white/20">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 transition-all z-50 text-slate-400 bg-white rounded-full shadow-lg"><X size={18} /></button>
            
            {/* LEFT: IMAGE GALLERY */}
            <div className="w-full md:w-1/2 p-6 border-r bg-[#fafafa] flex flex-col items-center justify-center">
               <div className="aspect-square bg-white border border-slate-100 flex items-center justify-center p-6 mb-4 shadow-md w-full max-w-xs relative">
                 <img src={selectedProduct.image} className={`max-w-full max-h-full object-contain mix-blend-multiply ${selectedProduct.stock <= 0 ? 'grayscale opacity-60' : ''}`} />
                 {selectedProduct.stock <= 0 && <span className="absolute bg-black/80 text-white text-[10px] font-black px-3 py-1 uppercase rounded-sm">Out of Stock</span>}
               </div>
               <div className="flex gap-8 items-center justify-center w-full mt-2">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Heart size={16} className="cursor-pointer hover:text-pink-500" />
                    <Share2 size={16} className="cursor-pointer hover:text-blue-500" />
                  </div>
               </div>
            </div>

            {/* RIGHT: CONTENT */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white flex flex-col custom-scroll">
               <div className="mb-2">
                 <span className="bg-pink-600 text-white text-[9px] font-black px-2 py-0.5 uppercase italic tracking-widest rounded-sm">Hex Mall</span>
               </div>
               <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tighter leading-none mb-1 italic">{selectedProduct.name}</h2>
               <p className="text-[10px] text-slate-400 font-bold mb-4 flex items-center gap-1"><User size={12}/> Sold by: <span className="text-slate-800">{selectedProduct.seller}</span></p>

               <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                 <div className="flex items-center gap-2 border-r pr-4">
                   <span className="text-yellow-500 font-black text-lg underline decoration-2 underline-offset-4">{selectedProduct.avg_rating.toFixed(1)}</span>
                   <div className="flex gap-0.5 text-yellow-500">
                     {[1,2,3,4,5].map(n => <Star key={n} size={12} fill={n <= selectedProduct.avg_rating ? "currentColor" : "none"} />)}
                   </div>
                 </div>
                 
                 {/* STOCK DISPLAY */}
                 <div className="text-xs text-slate-500 font-bold uppercase flex items-center gap-3">
                    <span>{selectedProduct.sales_count} Sold</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className={`${selectedProduct.stock > 0 ? 'text-pink-600' : 'text-red-600'} font-black`}>
                       Stock: {selectedProduct.stock}
                    </span>
                 </div>
               </div>

               <div className="mb-6">
                  <p className="text-pink-600 font-black text-4xl tracking-tighter italic">₱{selectedProduct.price.toLocaleString()}</p>
               </div>

               <div className="space-y-4 text-xs mb-8">
                  <div className="flex gap-6">
                    <span className="w-16 text-slate-400 font-black uppercase text-[9px] tracking-widest">Desc</span>
                    <p className="flex-1 text-slate-600 font-medium leading-relaxed italic text-[11px]">{selectedProduct.description}</p>
                  </div>
               </div>

               {/* REVIEWS LIST */}
               <div className="mb-8 flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-800 mb-3 tracking-[0.2em] flex items-center gap-2">
                    <MessageSquare size={12} className="text-pink-500"/> Reviews
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scroll">
                    {selectedProduct.reviews?.map((r, i) => (
                      <div key={i} className="bg-slate-50 p-3 border-l-2 border-pink-500 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[9px] font-black text-slate-800 uppercase italic">@{r.user}</p>
                          <div className="flex gap-0.5 text-yellow-500">{[1,2,3,4,5].map(n=><Star key={n} size={6} fill={n <= r.rating ? "currentColor" : "none"}/>)}</div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-tight">"{r.comment}"</p>
                      </div>
                    ))}
                  </div>
               </div>

               {/* ACTION & RATING AREA */}
               <div className="mt-auto pt-4 border-t border-slate-100">
                  {selectedProduct.seller !== user && (
                    <div className="space-y-4">
                      {/* Compact Rating Box with Stock */}
                      <div className="border border-slate-200 p-3 bg-slate-50 rounded-sm">
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rate Item</p>
                                <span className="text-[8px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">Stock: {selectedProduct.stock}</span>
                           </div>
                           <div className="flex gap-1">
                              {[1,2,3,4,5].map(n => <Star key={n} size={14} onClick={() => setUserRating(n)} fill={n <= userRating ? "#eab308" : "none"} color="#eab308" className="cursor-pointer hover:scale-110 transition-transform" />)}
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <textarea className="flex-1 p-2 border border-slate-200 text-[10px] font-bold h-10 outline-none focus:border-pink-500 resize-none bg-white placeholder-slate-300" placeholder="Type review..." value={userComment} onChange={e=>setUserComment(e.target.value)} />
                           <button onClick={() => handleReviewSubmit(selectedProduct)} className="bg-slate-900 text-white px-4 text-[9px] font-black uppercase tracking-widest hover:bg-pink-600 transition-colors flex flex-col items-center justify-center gap-1">
                              <Send size={10} /> Submit
                           </button>
                        </div>
                      </div>
                      
                      {/* BASKET & BUY BUTTONS */}
                      <div className="flex gap-2">
                          <button onClick={() => {axios.post(`${API}/cart/${user}/`, {product_id: selectedProduct.id}); fetchCart(); setStatusModal({show:true, msg:"Added to Basket!"});}} className="flex-1 border-2 border-pink-600 text-pink-600 py-3 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-pink-50 transition-all flex items-center justify-center gap-2">
                             <ShoppingBag size={14} /> Basket
                          </button>
                          <button onClick={() => handleBuyNow(selectedProduct)} className="flex-1 bg-pink-600 text-white py-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all flex items-center justify-center gap-2">
                             <DollarSign size={14} /> Buy Now
                          </button>
                      </div>
                    </div>
                  )}
                  {selectedProduct.seller === user && <div className="p-4 bg-slate-100 text-slate-400 text-center font-black uppercase tracking-[0.2em] text-[10px] italic">Your Listing</div>}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center backdrop-blur-sm">
           <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center border-4 border-pink-100 shadow-2xl">
              <HelpCircle size={40} className="mx-auto text-pink-500 mb-4"/>
              <p className="font-black text-slate-800 text-xs uppercase mb-8 tracking-widest">{confirmModal.msg}</p>
              <div className="flex gap-2">
                 <button onClick={() => { confirmModal.onConfirm(); setConfirmModal({...confirmModal, show:false}); }} className="flex-1 bg-pink-600 text-white py-3 text-[10px] font-black uppercase rounded-lg">Confirm</button>
                 <button onClick={() => setConfirmModal({...confirmModal, show:false})} className="flex-1 bg-slate-100 text-slate-500 py-3 text-[10px] font-black uppercase rounded-lg">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {statusModal.show && <div className="fixed inset-0 bg-black/95 z-[2000] flex items-center justify-center"><div className="bg-white p-12 border-t-8 border-pink-500 text-center shadow-2xl max-w-sm w-full font-black uppercase tracking-widest flex flex-col items-center"><CheckCircle size={60} className="text-pink-500 mb-6"/><p className="text-sm mb-10 text-slate-800">{statusModal.msg}</p><button onClick={() => setStatusModal({show:false})} className="w-full bg-[#0f1111] text-white py-5 text-[10px] tracking-[0.4em]">Close</button></div></div>}
    </div>
  );
}

function NavItem({ active, onClick, icon, label }) {
  return (<button onClick={onClick} className={`w-full flex items-center gap-5 p-5 transition-all border-l-4 ${active ? 'bg-pink-600 text-white border-white' : 'text-slate-500 border-transparent hover:text-white hover:bg-white/5'} font-black text-[10px] uppercase tracking-[0.3em]`}>{icon} {label}</button>);
}
import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  ShoppingBag,
  Quote,
  Truck,
  Bell,
  Search,
  BookOpen,
  Package,
  ShoppingCart,
  X,
  Trash2
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useFrappeAuth, useFrappeGetCall } from 'frappe-react-sdk';

const MainLayout = () => {
  const location = useLocation();
  const {
    currentUser,
    isLoading,
    logout,
  } = useFrappeAuth();

  const { data } = useFrappeGetCall(
    "customer_portal.api.v1.validate_customer_access"
  );

  // --- Cart State and Logic ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('customer_portal_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedCart = localStorage.getItem('customer_portal_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
    };
  }, []);

  const removeFromCart = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('customer_portal_cart', JSON.stringify(newCart));
  };

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('customer_portal_cart', JSON.stringify(newCart));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price || 0) * item.quantity), 0);

  const handlePlaceOrder = async () => {
    try {
      const res = await fetch(
        '/api/method/customer_portal.api.v1.create_sales_order',
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cart: cart
          })
        }
      );

      const payload = await res.json();
      const message = payload?.message || payload;

      if (message?.status === 'success') {
        alert(`Sales Order ${message.sales_order} Created Successfully!`);
        setCart([]);
        localStorage.setItem('customer_portal_cart', JSON.stringify([]));
        setIsCartOpen(false);
      } else {
        throw new Error(message?.message || 'Unknown error');
      }

    } catch (err: any) {
      alert('Failed to create sales order: ' + (err.message || err));
    }
  };

  const is_not_customer = !data?.message?.is_customer;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  if (is_not_customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mb-6">
            You must be logged in as a customer to access the Customer Portal.
          </p>
          <button
            onClick={() => window.location.href = "/customer-portal/login"}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 lg:relative translate-x-0">
        <div className="p-8"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50"><LayoutDashboard className="text-white" size={24} /></div><span className="text-2xl font-black text-white tracking-tight">PortalPro</span></div></div>
        <nav className="mt-4 px-6 space-y-1">
          <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
          <Link to="/dashboard" className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${location.pathname === '/dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><LayoutDashboard size={20} /><span className="font-bold">Dashboard</span></Link>
          <Link to="/analytics" className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${location.pathname === '/analytics' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><BarChart3 size={20} /><span className="font-bold">Analytics</span></Link>
          <Link to="/ledger" className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${location.pathname === '/ledger' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><BookOpen size={20} /><span className="font-bold">Ledger</span></Link>
          <Link to="/inventory" className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${location.pathname === '/inventory' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><Package size={20} /><span className="font-bold">Inventory</span></Link>

          <div className="pt-6 pb-2"><p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transactions</p></div>
          <Link to="/invoices" className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${location.pathname === '/invoices' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><FileText size={20} /><span className="font-bold text-sm">Invoices</span></Link>
          <Link to="/orders" className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${location.pathname === '/orders' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><ShoppingBag size={20} /><span className="font-bold text-sm">Sales Orders</span></Link>
          <Link to="/quotes" className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${location.pathname === '/quotes' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><Quote size={20} /><span className="font-bold text-sm">Quotations</span></Link>
          <Link to="/delivery" className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${location.pathname === '/delivery' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><Truck size={20} /><span className="font-bold text-sm">Delivery Notes</span></Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input type="text" placeholder="Global search documents..." className="bg-slate-100 border-none rounded-2xl pl-12 pr-6 py-3 w-80 text-sm focus:ring-2 focus:ring-indigo-500/10 transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-8">
            {/* Cart Button */}
            {cart.length > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100 animate-pulse hover:bg-indigo-100 transition-colors"
              >
                <ShoppingCart size={14} /> {cart.length} items in cart
              </button>
            )}
            
            <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-white border border-slate-200 rounded-xl relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{currentUser}</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Premium Customer</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black border-2 border-white shadow-inner">AJ</div>
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl border border-slate-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="p-10"> <Outlet /></div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Your Cart</h3>
                <p className="text-xs text-slate-500">Review items and create Sales Order</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-2xl border border-slate-100">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-xl" alt={item.name}/> : "📦"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">ID: {item.id}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 rounded text-slate-500"
                        >-</button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 rounded text-slate-500"
                        >+</button>
                      </div>
                      <p className="text-sm font-black text-slate-900">
                        ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Total Amount</span>
                <span className="text-2xl font-black text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                onClick={handlePlaceOrder}
              >
                Place Order
              </button>
              <p className="text-[10px] text-center text-slate-400">
                By placing the order, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;

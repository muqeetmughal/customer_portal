import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Trash2,
  Calendar
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useFrappeAuth, useFrappeGetCall } from 'frappe-react-sdk';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    isLoading,
    logout,
  } = useFrappeAuth();

  const { data } = useFrappeGetCall(
    "customer_portal.api.v1.validate_customer_access"
  );

  const [notifications, setNotifications] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portal_notifications');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const notificationRef = useRef<HTMLDivElement>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Default to today
  });
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

    const handleNewNotification = (event: any) => {
      const newNotif = {
        id: Date.now(),
        title: event.detail.title,
        message: event.detail.message,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: event.detail.type || 'info'
      };
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        localStorage.setItem('portal_notifications', JSON.stringify(updated));
        return updated;
      });
    };

    // click outsde listner
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleStorageChange);
    window.addEventListener('new-notification', handleNewNotification as EventListener);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
      window.removeEventListener('new-notification', handleNewNotification as EventListener);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('portal_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('portal_notifications', JSON.stringify([]));
  };

  const getTitleFromPath = (path: string) => {
    const map: Record<string, string> = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/analytics': 'Analytics',
      '/ledger': 'Ledger',
      '/inventory': 'Inventory',
      '/invoices': 'Invoices',
      '/orders': 'Sales Orders',
      '/quotes': 'Quotations',
      '/delivery': 'Delivery Notes',
      '/login': 'Login'
    };

    const base = map[path] || map['/'] || 'Customer Portal';
    return base;
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = getTitleFromPath(location.pathname);
    }
  }, [location.pathname]);

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
    if (!deliveryDate) {
      alert("Please select a delivery date.");
      return;
    }

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
            cart: cart,
            delivery_date: deliveryDate
          })
        }
      );

      const payload = await res.json();
      const message = payload?.message || payload;

      if (message?.status === 'success') {
        const event = new CustomEvent('new-notification', {
          detail: {
            title: 'Order Created',
            message: `Sales Order ${message.sales_order} has been created successfully.`,
            type: 'success'
          }
        });
        window.dispatchEvent(event);

        setCart([]);
        
        localStorage.setItem('customer_portal_cart', JSON.stringify([]));
        
        window.dispatchEvent(new Event('cart-updated'));

        setIsCartOpen(false);
      } else {
        throw new Error(message?.message || 'Unknown error');
      }

    } catch (err: any) {
      alert('Failed to create sales order: ' + (err.message || err));
    }
  };


  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const is_not_customer = !data?.message?.is_customer;
  if (is_not_customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mb-6">
            You must be logged in as a customer to access the Customer Portal.
          </p>
          <button
            onClick={handleLogout}
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
            
            {/* Notification Bell with Click Outside logic */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => {
                  if (!showNotifications) markAllAsRead();
                  setShowNotifications(!showNotifications);
                }}
                className={`p-3 transition-colors bg-white border border-slate-200 rounded-xl relative ${unreadCount > 0 ? 'text-indigo-600 ring-2 ring-indigo-500/10' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                <Bell size={20} className={unreadCount > 0 ? 'animate-bounce' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    <button onClick={clearNotifications} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">Clear All</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold text-xs text-slate-900">{notif.title}</h5>
                            <span className="text-[10px] text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center">
                        <Bell className="mx-auto text-slate-200 mb-2" size={32} />
                        <p className="text-xs text-slate-400">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{currentUser}</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Premium Customer</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black border-2 border-white shadow-inner">AJ</div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl border border-slate-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="p-10"> <Outlet /></div>
      </main>

      {/* Cart Drawer */}
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
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-2xl border border-slate-100 shadow-sm">
                      {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-xl" alt={item.name}/> : "📦"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-indigo-600 font-bold">${Number(item.price || 0).toFixed(2)}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-indigo-600"><X size={12} /></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-indigo-600"><X size={12} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-700 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-900 font-bold">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Add items from the inventory to get started</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                {/* Delivery Date Selection */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Calendar size={16} className="text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Select Delivery Date</span>
                  </div>
                  <input 
                    type="date" 
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex justify-between items-center px-2">
                  <span className="text-sm font-bold text-slate-500 uppercase">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;

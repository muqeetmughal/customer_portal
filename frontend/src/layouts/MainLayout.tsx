import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  ShoppingBag,
  Quote,
  Truck,
  Bell,
  Search,
  User,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  CreditCard,
  Wallet,
  Flame,
  ChevronRight,
  Download,
  Filter,
  Eye,
  BookOpen,
  Calendar,
  ArrowRightLeft,
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useFrappeAuth, useFrappeGetCall } from 'frappe-react-sdk';
import LoadingScreen from '../components/LoadingScreen';

const MainLayout = () => {
  const location = useLocation();
  const {
    currentUser,
    isValidating,
    isLoading,
    login,
    logout,
    error,
    updateCurrentUser,
    getUserCookie,
  } = useFrappeAuth();

  const is_customer_query = useFrappeGetCall("customer_portal.api.v1.is_customer");



  if (isLoading || isValidating || is_customer_query.isLoading) {
    return <LoadingScreen />
  }
  if (!currentUser ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mb-6">You must be logged.</p>
          <button
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if ( !is_customer_query.data?.message?.is_customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mb-6">You must be logged in as a customer to access the Customer Portal.</p>
          <button
            // onClick={() => login()}
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
            {/* {cart.length > 0 && (
              <button
                onClick={() => setActiveTab('inventory')}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100 animate-pulse"
              >
                <ShoppingCart size={14} /> {cart.length} items in cart
              </button>
            )} */}
          </div>
          <div className="flex items-center gap-8">
            <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-white border border-slate-200 rounded-xl relative"><Bell size={20} /><span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span></button>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <div className="text-right hidden sm:block"><p className="text-sm font-bold text-slate-900 leading-tight">{currentUser}</p><p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Premium Customer</p></div>
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
    </div>
  )
}

export default MainLayout

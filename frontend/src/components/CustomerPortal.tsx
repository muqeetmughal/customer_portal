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

// --- Expanded Mock Data ---
const SALES_DATA = [
  { month: 'Jan', orders: 45 }, { month: 'Feb', orders: 52 }, { month: 'Mar', orders: 48 },
  { month: 'Apr', orders: 61 }, { month: 'May', orders: 55 }, { month: 'Jun', orders: 67 }, { month: 'Jul', orders: 72 },
];

const INVOICE_STATUS_DATA = [
  { name: 'Paid', value: 400, color: '#10b981' },
  { name: 'Pending', value: 300, color: '#f59e0b' },
  { name: 'Overdue', value: 100, color: '#ef4444' },
];

const PURCHASE_HISTORY_DATA = [
  { name: 'Electronics', value: 4500 }, { name: 'Office Supplies', value: 1200 },
  { name: 'Services', value: 3000 }, { name: 'Hardware', value: 2100 },
];

const TOP_ITEMS = [
  { name: 'UltraWide Monitor 34"', sales: 124, revenue: '$43,400', growth: '+12%' },
  { name: 'Ergonomic Desk Chair', sales: 98, revenue: '$28,900', growth: '+8%' },
  { name: 'Wireless Mechanical KB', sales: 82, revenue: '$12,300', growth: '+15%' },
  { name: 'USB-C Docking Station', sales: 75, revenue: '$11,250', growth: '-2%' },
];

const QUOTATIONS = [
  { id: 'QT-441', date: 'Sep 28, 2024', valid: 'Oct 28, 2024', amount: '$850.00', status: 'Expired' },
  { id: 'QT-445', date: 'Oct 05, 2024', valid: 'Nov 05, 2024', amount: '$12,400.00', status: 'Active' },
  { id: 'QT-449', date: 'Oct 20, 2024', valid: 'Nov 20, 2024', amount: '$3,100.00', status: 'Active' },
];

const DELIVERY_NOTES = [
  { id: 'DEL-88', order: 'SO-992', date: 'Oct 15, 2024', tracking: 'TRK99210', status: 'Delivered' },
  { id: 'DEL-91', order: 'SO-998', date: 'Oct 18, 2024', tracking: 'TRK99215', status: 'In Transit' },
  { id: 'DEL-94', order: 'SO-995', date: 'Oct 21, 2024', tracking: 'TRK99220', status: 'Pending' },
];

const LEDGER_ENTRIES = [
  { date: 'Oct 01, 2024', type: 'Opening Balance', ref: '-', debit: '0.00', credit: '0.00', balance: '$2,500.00' },
  { date: 'Oct 05, 2024', type: 'Invoice', ref: 'INV-2024-001', debit: '1,200.00', credit: '0.00', balance: '$3,700.00' },
  { date: 'Oct 08, 2024', type: 'Payment', ref: 'PAY-8821', debit: '0.00', credit: '1,200.00', balance: '$2,500.00' },
  { date: 'Oct 12, 2024', type: 'Invoice', ref: 'INV-2024-002', debit: '3,450.00', credit: '0.00', balance: '$5,950.00' },
  { date: 'Oct 15, 2024', type: 'Credit Note', ref: 'CRN-002', debit: '0.00', credit: '500.00', balance: '$5,450.00' },
  { date: 'Oct 20, 2024', type: 'Payment', ref: 'PAY-8910', debit: '0.00', credit: '2,000.00', balance: '$3,450.00' },
];

const INVENTORY_ITEMS = [
  { id: 'PRD-001', name: 'UltraWide Monitor 34"', price: 499.00, stock: 15, category: 'Electronics', image: '🖥️' },
  { id: 'PRD-002', name: 'Ergonomic Desk Chair', price: 295.00, stock: 24, category: 'Furniture', image: '💺' },
  { id: 'PRD-003', name: 'Wireless Mechanical KB', price: 150.00, stock: 40, category: 'Electronics', image: '⌨️' },
  { id: 'PRD-004', name: 'USB-C Docking Station', price: 125.00, stock: 10, category: 'Accessories', image: '🔌' },
  { id: 'PRD-005', name: 'Noise Cancelling Headset', price: 300.00, stock: 12, category: 'Electronics', image: '🎧' },
  { id: 'PRD-006', name: 'Standing Desk Frame', price: 450.00, stock: 5, category: 'Furniture', image: '🧗' },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: 'Invoice', desc: 'Invoice #INV-2024-001 paid', date: '2 hours ago', status: 'Completed', amount: '$1,200.00' },
  { id: 2, type: 'Order', desc: 'Sales Order #SO-992 confirmed', date: '5 hours ago', status: 'Pending', amount: '$3,450.00' },
  { id: 3, type: 'Quote', desc: 'Quote #QT-441 expired', date: '1 day ago', status: 'Expired', amount: '$850.00' },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

const CustomerPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cart, setCart] = useState([]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, isCurrency }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className={`text-2xl font-bold text-slate-900 mt-1 ${isCurrency ? 'font-mono' : ''}`}>{value}</h3>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
            {trendValue}
          </span>
          <span className="text-xs text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      Paid: 'bg-emerald-100 text-emerald-700',
      Pending: 'bg-amber-100 text-amber-700',
      Overdue: 'bg-rose-100 text-rose-700',
      Confirmed: 'bg-blue-100 text-blue-700',
      Processing: 'bg-indigo-100 text-indigo-700',
      Shipped: 'bg-violet-100 text-violet-700',
      Delivered: 'bg-emerald-100 text-emerald-700',
      'In Transit': 'bg-sky-100 text-sky-700',
      Active: 'bg-emerald-100 text-emerald-700',
      Expired: 'bg-slate-100 text-slate-700',
      Invoice: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      Payment: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      'Credit Note': 'bg-rose-50 text-rose-600 border border-rose-100',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  const DashboardView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value="$125,430.00" icon={DollarSign} trend="up" trendValue="+14%" colorClass="bg-slate-800" isCurrency />
        <StatCard title="Outstanding" value="$12,850.50" icon={Wallet} trend="down" trendValue="-5%" colorClass="bg-rose-600" isCurrency />
        <StatCard title="Paid to Date" value="$112,579.50" icon={CreditCard} trend="up" trendValue="+18%" colorClass="bg-emerald-600" isCurrency />
        <StatCard title="Ledger Balance" value="$3,450.00" icon={BookOpen} colorClass="bg-indigo-600" isCurrency />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Recent Activities</h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Explore Logs</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_ACTIVITIES.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{activity.type}</p>
                        <p className="text-xs text-slate-500">{activity.desc}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">{activity.date}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{activity.amount}</td>
                      <td className="px-6 py-4"><StatusBadge status={activity.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const InventoryView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product Catalog</h2>
          <p className="text-sm text-slate-500">Browse and order items directly</p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"><Filter size={20}/></button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"><Plus size={20}/> New Request</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {INVENTORY_ITEMS.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{item.image}</div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h3>
            <p className="text-xs text-slate-400 mb-4">Item ID: {item.id}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Price</p>
                <p className="text-xl font-black text-slate-900">${item.price.toFixed(2)}</p>
              </div>
              <button onClick={() => addToCart(item)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><ShoppingCart size={20}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const DocumentListView = ({ title, data, columns, icon: Icon }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100"><Icon className="text-white" size={24} /></div>
          <div><h2 className="text-2xl font-bold text-slate-900">{title}</h2><p className="text-sm text-slate-500">Manage your {title.toLowerCase()} records</p></div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"><Filter size={16} /> Filter</button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"><Download size={16} /> Export All</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                {columns.map((col, i) => <th key={i} className={`px-6 py-5 ${col.align === 'right' ? 'text-right' : ''}`}>{col.label}</th>)}
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  {columns.map((col, i) => (
                    <td key={i} className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''}`}>
                      {col.key === 'status' || col.key === 'type' ? <StatusBadge status={item[col.key]} /> :
                       col.key === 'id' || col.key === 'balance' ? <span className="font-bold text-slate-900">{item[col.key]}</span> :
                       col.key === 'debit' ? <span className="text-sm font-semibold text-rose-600">{item[col.key] !== '0.00' ? `+ ${item[col.key]}` : '-'}</span> :
                       col.key === 'credit' ? <span className="text-sm font-semibold text-emerald-600">{item[col.key] !== '0.00' ? `- ${item[col.key]}` : '-'}</span> :
                       <span className="text-sm text-slate-600">{item[col.key]}</span>}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye size={18}/></button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Download size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'inventory': return <InventoryView />;
      case 'analytics':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Sales Velocity</h3>
              <div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={SALES_DATA}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} /><Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} /></LineChart></ResponsiveContainer></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-slate-800">Top Items</h3><Flame size={18} className="text-orange-500" /></div>
              <div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={TOP_ITEMS.map(i => ({name: i.name.split(' ')[0], sales: i.sales}))}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} /><Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Collections Overview</h3>
              <div className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={INVOICE_STATUS_DATA} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">{INVOICE_STATUS_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} /></PieChart></ResponsiveContainer></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Delivery Distribution</h3>
              <div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={PURCHASE_HISTORY_DATA} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" /><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={32} /></BarChart></ResponsiveContainer></div>
            </div>
          </div>
        );
      case 'quotes': return <DocumentListView title="Quotations" data={QUOTATIONS} columns={[{label: 'Quote ID', key: 'id'}, {label: 'Created', key: 'date'}, {label: 'Valid Until', key: 'valid'}, {label: 'Total', key: 'amount'}, {label: 'Status', key: 'status'}]} icon={Quote} />;
      case 'delivery': return <DocumentListView title="Delivery Notes" data={DELIVERY_NOTES} columns={[{label: 'Delivery ID', key: 'id'}, {label: 'Order Ref', key: 'order'}, {label: 'Dispatch Date', key: 'date'}, {label: 'Tracking #', key: 'tracking'}, {label: 'Status', key: 'status'}]} icon={Truck} />;
      case 'ledger': return (
        <DocumentListView
          title="Customer Ledger"
          data={LEDGER_ENTRIES}
          columns={[
            {label: 'Posting Date', key: 'date'},
            {label: 'Type', key: 'type'},
            {label: 'Reference', key: 'ref'},
            {label: 'Debit (+)', key: 'debit', align: 'right'},
            {label: 'Credit (-)', key: 'credit', align: 'right'},
            {label: 'Balance', key: 'balance', align: 'right'}
          ]}
          icon={BookOpen}
        />
      );
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-950 text-white flex flex-col p-8">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40"><LayoutDashboard size={24} /></div>
          <div><h1 className="text-xl font-black tracking-tight">MANUS<span className="text-indigo-500">ERP</span></h1><p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Customer Portal</p></div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="pb-2"><p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p></div>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><LayoutDashboard size={20}/><span className="font-bold">Dashboard</span></button>
          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><BarChart3 size={20}/><span className="font-bold">Analytics</span></button>
          <button onClick={() => setActiveTab('ledger')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><BookOpen size={20}/><span className="font-bold">Ledger</span></button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><Package size={20}/><span className="font-bold">Inventory</span></button>

          <div className="pt-6 pb-2"><p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transactions</p></div>
          <button onClick={() => setActiveTab('quotes')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'quotes' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><Quote size={20}/><span className="font-bold text-sm">Quotations</span></button>
          <button onClick={() => setActiveTab('delivery')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'delivery' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><Truck size={20}/><span className="font-bold text-sm">Delivery Notes</span></button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18}/>
              <input type="text" placeholder="Global search documents..." className="bg-slate-100 border-none rounded-2xl pl-12 pr-6 py-3 w-80 text-sm focus:ring-2 focus:ring-indigo-500/10 transition-all"/>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setActiveTab('inventory')}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100 animate-pulse"
              >
                <ShoppingCart size={14} /> {cart.length} items in cart
              </button>
            )}
          </div>
          <div className="flex items-center gap-8">
            <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-white border border-slate-200 rounded-xl relative"><Bell size={20}/><span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span></button>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <div className="text-right hidden sm:block"><p className="text-sm font-bold text-slate-900 leading-tight">Alex Johnson</p><p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Premium Customer</p></div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black border-2 border-white shadow-inner">AJ</div>
            </div>
          </div>
        </header>

        <div className="p-10">{renderContent()}</div>
      </main>
    </div>
  );
};

export default CustomerPortal;

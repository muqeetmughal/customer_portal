import React from 'react';
import { Flame } from 'lucide-react';
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

const Analytics = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-800">Sales Velocity</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SALES_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Top Items</h3>
          <Flame size={18} className="text-orange-500" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TOP_ITEMS.map(i => ({name: i.name.split(' ')[0], sales: i.sales}))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-800">Collections Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={INVOICE_STATUS_DATA} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {INVOICE_STATUS_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-800">Delivery Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PURCHASE_HISTORY_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

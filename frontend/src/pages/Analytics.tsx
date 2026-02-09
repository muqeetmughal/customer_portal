import React from 'react';
import { Flame } from 'lucide-react';
import { useFrappeGetCall } from "frappe-react-sdk";
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

const Analytics = () => {

  const salesVelocityQuery = useFrappeGetCall(
    "customer_portal.api.v1.get_sales_velocity_monthly"
  );

  const topItemsQuery = useFrappeGetCall(
    "customer_portal.api.v1.get_top_selling_items"
  );

  const invoiceStatusQuery = useFrappeGetCall(
    "customer_portal.api.v1.get_sales_invoice_status_count"
  );

  if (salesVelocityQuery.isLoading || topItemsQuery.isLoading || invoiceStatusQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Loading analytics...
      </div>
    );
  }

  
  const salesChartData =
    salesVelocityQuery.data?.message?.labels?.map(
      (label: string, index: number) => ({
        month: label,
        orders: salesVelocityQuery.data.message.orders[index],
        sales: salesVelocityQuery.data.message.sales[index],
      })
    ) || [];

  
  const topItemsChartData =
    topItemsQuery.data?.message?.map((item: any) => ({
      name: item.name.split(' ')[0], 
      sales: item.sales_count
    })) || [];

  const invoiceStatusData = [
    { name: 'Paid', value: invoiceStatusQuery.data?.message?.Paid || 0, color: '#10b981' },
    { name: 'Draft', value: invoiceStatusQuery.data?.message?.Draft || 0, color: '#f59e0b' },
    { name: 'Overdue', value: invoiceStatusQuery.data?.message?.Overdue || 0, color: '#ef4444' },
  ];

  const PURCHASE_HISTORY_DATA = [
    { name: 'Electronics', value: 4500 },
    { name: 'Office Supplies', value: 1200 },
    { name: 'Services', value: 3000 },
    { name: 'Hardware', value: 2100 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">

      {/* ================= Sales Velocity ================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-800">Sales Velocity</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= Top Items ================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Top Items</h3>
          <Flame size={18} className="text-orange-500" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topItemsChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip />
              <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= Collections Overview ================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-800">Collections Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={invoiceStatusData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {invoiceStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= Delivery Distribution ================= */}
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

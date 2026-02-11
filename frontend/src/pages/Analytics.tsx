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

  {/* backend query */}
  const analyticsQuery = useFrappeGetCall(
    "customer_portal.api.v1.get_dashboard_analytics"
  );

  if (analyticsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Loading analytics...
      </div>
    );
  }

  const data = analyticsQuery.data?.message || {};

  {/* ================= SALES VELOCITY ================= */}
  const salesChartData =
    data.sales_velocity?.labels?.map(
      (label: string, index: number) => ({
        month: label,
        orders: data.sales_velocity.orders[index],
        sales: data.sales_velocity.sales[index],
      })
    ) || [];

  {/* ================= TOP ITEMS ================= */}
  const topItemsChartData =
    (data.top_items || []).map((item: any) => ({
      name: item.name ? item.name.split(' ')[0] : 'Unknown',
      sales: item.sales_count || 0
    }));

  {/* ================= INVOICE STATUS ================= */}
  const invoiceStatusData = [
    { name: 'Paid', value: data.invoice_status?.Paid || 0, color: '#10b981' },
    { name: 'Draft', value: data.invoice_status?.Draft || 0, color: '#f59e0b' },
    { name: 'Overdue', value: data.invoice_status?.Overdue || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  {/* ================= DELIVERY DISTRIBUTION ================= */}
  const deliveryDistributionData =
    (data.delivery_distribution || []).map((item: any) => ({
      name: item.name || 'Unknown',
      value: item.value || 0
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">

      {/* ================= Sales Velocity ================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-800">Sales Velocity</h3>
        <div className="h-80 w-full">
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
        <div className="h-80 w-full">
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
        <div className="h-80 w-full">
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
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deliveryDistributionData} layout="vertical">
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

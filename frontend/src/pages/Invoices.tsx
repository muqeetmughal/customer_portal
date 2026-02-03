import { BookOpen, Clock, CreditCard, DollarSign, Flame, Wallet } from "lucide-react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useFrappeGetCall } from "frappe-react-sdk";

const RECENT_ACTIVITIES = [
    { id: 1, type: 'Invoice', desc: 'Invoice #INV-2024-001 paid', date: '2 hours ago', status: 'Completed', amount: '$1,200.00' },
    { id: 2, type: 'Order', desc: 'Sales Order #SO-992 confirmed', date: '5 hours ago', status: 'Pending', amount: '$3,450.00' },
    { id: 3, type: 'Quote', desc: 'Quote #QT-441 expired', date: '1 day ago', status: 'Expired', amount: '$850.00' },
];

const TOP_ITEMS = [
    { name: 'UltraWide Monitor 34"', sales: 124, revenue: '$43,400', growth: '+12%' },
    { name: 'Ergonomic Desk Chair', sales: 98, revenue: '$28,900', growth: '+8%' },
    { name: 'Wireless Mechanical KB', sales: 82, revenue: '$12,300', growth: '+15%' },
    { name: 'USB-C Docking Station', sales: 75, revenue: '$11,250', growth: '-2%' },
];

const Dashboard = () => {

    const metrics_query = useFrappeGetCall("customer_portal.api.v1.get_customer_dashboard_data" );

    if (metrics_query.isLoading) {
        return <div>Loading dashboard metrics...</div>
    }

    console.log("Metrics Query:", metrics_query.data);
    
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
            <StatCard
                title="Total Sales"
                value={`$${metrics_query.data?.message?.total_sales?.amount?.toLocaleString() || '0'}`}
                icon={DollarSign}
                trend={metrics_query.data?.message?.total_sales?.change_percentage >= 0 ? "up" : "down"}
                trendValue={`${metrics_query.data?.message?.total_sales?.change_percentage >= 0 ? '+' : ''}${metrics_query.data?.message?.total_sales?.change_percentage || 0}%`}
                colorClass="bg-slate-800"
                isCurrency
            />
            <StatCard
                title="Outstanding"
                value={`$${metrics_query.data?.message?.outstanding?.amount?.toLocaleString() || '0'}`}
                icon={Wallet}
                trend={metrics_query.data?.message?.outstanding?.change_percentage >= 0 ? "up" : "down"}
                trendValue={`${metrics_query.data?.message?.outstanding?.change_percentage >= 0 ? '+' : ''}${metrics_query.data?.message?.outstanding?.change_percentage || 0}%`}
                colorClass="bg-rose-600"
                isCurrency
            />
            <StatCard
                title="Paid to Date"
                value={`$${metrics_query.data?.message?.paid_to_date?.amount?.toLocaleString() || '0'}`}
                icon={CreditCard}
                trend={metrics_query.data?.message?.paid_to_date?.change_percentage >= 0 ? "up" : "down"}
                trendValue={`${metrics_query.data?.message?.paid_to_date?.change_percentage >= 0 ? '+' : ''}${metrics_query.data?.message?.paid_to_date?.change_percentage || 0}%`}
                colorClass="bg-emerald-600"
                isCurrency
            />
            <StatCard
                title="Ledger Balance"
                value={`$${metrics_query.data?.message?.ledger_balance?.amount?.toLocaleString() || '0'}`}
                icon={BookOpen}
                colorClass="bg-indigo-600"
                isCurrency
            />
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
                        <th className="px-6 py-4">Event</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {RECENT_ACTIVITIES.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg"><Clock size={16} /></div>
                            <div><p className="text-sm font-medium text-slate-900">{item.desc}</p><p className="text-xs text-slate-400">{item.date}</p></div>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                            <td className="px-6 py-4 text-sm font-bold">{item.amount}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-6"><Flame className="text-orange-500 fill-orange-500" size={20} /><h2 className="text-lg font-bold text-slate-800">Hot Items</h2></div>
                <div className="space-y-6">
                {TOP_ITEMS.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center group cursor-pointer">
                    <div><p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">{item.name}</p><p className="text-xs text-slate-400">{item.sales} units • <span className="text-emerald-500 font-bold">{item.growth}</span></p></div>
                    <p className="font-mono text-sm font-bold text-slate-600">{item.revenue}</p>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
    )
};

export default Dashboard

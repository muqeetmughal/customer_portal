import { BookOpen, Clock, CreditCard, DollarSign, Flame, Wallet } from "lucide-react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useFrappeGetCall } from "frappe-react-sdk";

const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
};

const Dashboard = () => {
    const metrics_query = useFrappeGetCall("customer_portal.api.v1.get_customer_dashboard_data");
    const activities_query = useFrappeGetCall("customer_portal.api.v1.get_recent_activities");
    const hotItemsQuery = useFrappeGetCall("customer_portal.api.v1.get_hot_items");

    if (metrics_query.isLoading || activities_query.isLoading || hotItemsQuery.isLoading) {
        return <div className="flex items-center justify-center h-screen text-slate-500 font-medium">Loading dashboard data...</div>
    }

    const recentActivities = activities_query.data?.message || [];
    const metrics = metrics_query.data?.message || [];
    const hotItems = hotItemsQuery.data?.message || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Sales"
                    value={`$${metrics.total_sales?.amount?.toLocaleString() || '0'}`}
                    icon={DollarSign}
                    trend={metrics.total_sales?.change_percentage >= 0 ? "up" : "down"}
                    trendValue={`${metrics.total_sales?.change_percentage >= 0 ? '+' : ''}${metrics.total_sales?.change_percentage || 0}%`}
                    colorClass="bg-slate-800"
                    isCurrency
                />
                <StatCard
                    title="Outstanding"
                    value={`$${metrics.outstanding?.amount?.toLocaleString() || '0'}`}
                    icon={Wallet}
                    trend={metrics.outstanding?.change_percentage >= 0 ? "up" : "down"}
                    trendValue={`${metrics.outstanding?.change_percentage >= 0 ? '+' : ''}${metrics.outstanding?.change_percentage || 0}%`}
                    colorClass="bg-rose-600"
                    isCurrency
                />
                <StatCard
                    title="Paid to Date"
                    value={`$${metrics.paid_to_date?.amount?.toLocaleString() || '0'}`}
                    icon={CreditCard}
                    trend={metrics.paid_to_date?.change_percentage >= 0 ? "up" : "down"}
                    trendValue={`${metrics.paid_to_date?.change_percentage >= 0 ? '+' : ''}${metrics.paid_to_date?.change_percentage || 0}%`}
                    colorClass="bg-emerald-600"
                    isCurrency
                />
                <StatCard
                    title="Ledger Balance"
                    value={`$${metrics.ledger_balance?.amount?.toLocaleString() || '0'}`}
                    icon={BookOpen}
                    colorClass="bg-indigo-600"
                    isCurrency
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
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
                                    {recentActivities.length > 0 ? (
                                        recentActivities.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg"><Clock size={16} /></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{item.desc}</p>
                                                        <p className="text-xs text-slate-400">{getRelativeTime(item.date)}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold">
                                                    ${item.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">
                                                No recent activities found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Hot Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Flame className="text-orange-500 fill-orange-500" size={20} />
                        <h2 className="text-lg font-bold text-slate-800">Hot Items</h2>
                    </div>
                    <div className="space-y-6">
                        {hotItems.length > 0 ? (
                            hotItems.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center group cursor-pointer">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.sales} units • <span className={`font-bold ${item.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{item.growth}</span></p>
                                    </div>
                                    <p className="font-mono text-sm font-bold text-slate-600">{item.revenue}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 text-sm">No hot items found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

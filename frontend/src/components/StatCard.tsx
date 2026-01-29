import { ArrowUpRight, ArrowDownRight, MoreVertical } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  colorClass: string;
  isCurrency?: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, isCurrency }: StatCardProps) => (
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
export default StatCard;

import React from 'react';
import { Truck } from 'lucide-react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import ActionButtons from '../components/Download';
import DataToolbar from '../components/DataToolbar';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
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

interface Column {
  label: string;
  key: string;
  align?: 'right' | 'left';
}

interface DocumentListViewProps {
  title: string;
  data: any[];
  columns: Column[];
  icon: React.ElementType;
}

const DocumentListView = ({ title, data, columns, icon: Icon }: DocumentListViewProps) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
          <Icon className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">Manage your {title.toLowerCase()} records</p>
        </div>
      </div>

      {/* Use the reusable DataToolbar */}
      <DataToolbar
        onFilter={() => console.log('Filter clicked')}
        onExport={() => console.log('Export clicked')}
      />
    </div>

    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-5 ${col.align === 'right' ? 'text-right' : ''}`}>
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                {columns.map((col, i) => (
                  <td key={i} className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''}`}>
                    {col.key === 'status' ? (
                      <StatusBadge status={item[col.key]} />
                    ) : (
                      <span className="text-sm text-slate-600">{item[col.key]}</span>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <ActionButtons
                    onView={() => console.log("View clicked for", item.id)}
                    onDownload={() => console.log("Download clicked for", item.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const DeliveryNotesPage = () => {
  const { data, isLoading, error } = useFrappeGetCall("customer_portal.api.v1.get_delivery_note_data");

  if (isLoading) {
    return <div className="p-10">Loading Delivery Notes...</div>;
  }

  if (error) {
    return <div className="p-10 text-rose-500">Error loading Delivery Notes</div>;
  }

  const deliveryNotes = (data?.message || []).map((dn: any) => ({
    id: dn.delivery_note,
    order: dn.sales_order,
    date: dn.posting_date,
    tracking: `TRK-${Math.floor(Math.random() * 90000) + 10000}`,
    status: dn.status,
  }));

  const columns: Column[] = [
    { label: 'Delivery ID', key: 'id' },
    { label: 'Order Ref', key: 'order' },
    { label: 'Dispatch Date', key: 'date' },
    { label: 'Tracking #', key: 'tracking' },
    { label: 'Status', key: 'status' },
  ];

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <DocumentListView
        title="Delivery Notes"
        data={deliveryNotes}
        columns={columns}
        icon={Truck}
      />
    </div>
  );
};

export default DeliveryNotesPage;

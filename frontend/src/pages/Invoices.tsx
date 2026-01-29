import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useFrappeGetCall } from "frappe-react-sdk";
import ActionButtons from '../components/Download';
import DataToolbar from '../components/DataToolbar';
import Modal from '../components/ViewRecords'; // import your modal

// Status Badge component
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

// Column & DocumentListView types
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
  onView?: (item: any) => void; // pass down view handler
}

const DocumentListView = ({ title, data, columns, icon: Icon, onView }: DocumentListViewProps) => (
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

      <DataToolbar
        onFilter={() => console.log("Filter clicked")}
        onExport={() => console.log("Export clicked")}
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
                    onView={() => onView && onView(item)} // call onView from parent
                    onDownload={() => console.log("Download clicked for", item.name)}
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

const InvoicesPage = () => {
  const { data, isLoading, error } = useFrappeGetCall("customer_portal.api.v1.get_sales_invoice_data");

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedInvoice(null);
    setIsModalOpen(false);
  };

  const columns: Column[] = [
    { label: 'Invoice ID', key: 'name' },
    { label: 'Date', key: 'posting_date' },
    { label: 'Due Date', key: 'due_date' },
    { label: 'Total', key: 'total' },
    { label: 'Status', key: 'status' },
  ];

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-500 font-medium animate-pulse">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-rose-500 font-bold">Error loading invoices: {error.message}</div>
      </div>
    );
  }

  const invoices = data?.message || [];

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <DocumentListView 
        title="Invoices" 
        data={invoices} 
        columns={columns} 
        icon={FileText} 
        onView={handleViewInvoice} // pass the handler
      />

      {/* Modal to view invoice details */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Invoice Details">
        {selectedInvoice ? (
          <div className="space-y-2 text-sm">
            <p><strong>Invoice ID:</strong> {selectedInvoice.name}</p>
            <p><strong>Date:</strong> {selectedInvoice.posting_date}</p>
            <p><strong>Due Date:</strong> {selectedInvoice.due_date}</p>
            <p><strong>Total:</strong> {selectedInvoice.total}</p>
            <p><strong>Status:</strong> {selectedInvoice.status}</p>
            {/* Add more fields as needed */}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesPage;

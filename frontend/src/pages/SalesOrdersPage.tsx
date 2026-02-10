import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingBag, X, Search, Check } from 'lucide-react';
import { useFrappeGetCall } from "frappe-react-sdk";
import ActionButtons from '../components/Download';
import DataToolbar from '../components/DataToolbar';
import ViewRecords from '../components/ViewRecords';
import FilterPanel from '../components/FilterPanel';
import ExportSelection from '../components/ExportSelection';

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
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
        styles[status] || 'bg-slate-100 text-slate-600'
      }`}
    >
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
  onView: (item: any) => void;
  onDownload: (item: any) => void;
  // Added rawData prop to allow exporting all fields
  rawData?: any[];
}

const DocumentListView = ({
  title,
  data,
  columns,
  icon: Icon,
  onView,
  onDownload,
  rawData,
}: DocumentListViewProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value) {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = String(item[key] || '').toLowerCase();
        return itemValue.includes(value.toLowerCase());
      });
    });
  }, [data, activeFilters]);

  const activeFilterCount = Object.keys(activeFilters).length;

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(item => item.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  // Prepare data for export by merging visible data with raw API data
  const selectedExportData = useMemo(() => {
    if (!rawData) return filteredData.filter(item => selectedIds.has(item.id));
    
    return rawData
      .filter(rawItem => selectedIds.has(rawItem.name))
      .map(rawItem => ({
        ...rawItem,
        id: rawItem.name // Ensure ID consistency for export
      }));
  }, [rawData, filteredData, selectedIds]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
            <Icon className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">
              Manage your {title.toLowerCase()} records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative" ref={toolbarRef}>
          {isSelectionMode ? (
            <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
              <button 
                onClick={toggleSelectionMode}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              
              <ExportSelection 
                title={title}
                data={selectedExportData}
                selectedCount={selectedIds.size}
              />
            </div>
          ) : (
            <DataToolbar
              onFilter={() => setIsFilterOpen(!isFilterOpen)}
              onExport={toggleSelectionMode}
              activeFilterCount={activeFilterCount}
            />
          )}

          <FilterPanel 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            title={title}
            columns={columns}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={clearFilters}
          />
        </div>
      </div>

      {isSelectionMode && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Check size={16} />
            </div>
            <p className="text-sm font-bold text-indigo-900">
              Selection Mode Active: <span className="font-normal">Please select the records you want to export.</span>
            </p>
          </div>
          <button 
            onClick={toggleSelectAll}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
          >
            {selectedIds.size === filteredData.length ? 'Deselect All' : 'Select All Visible'}
          </button>
        </div>
      )}

      {!isSelectionMode && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const column = columns.find(c => c.key === key);
            return (
              <div key={key} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 text-xs font-medium">
                <span className="opacity-60">{column?.label}:</span>
                <span>{value}</span>
                <button onClick={() => handleFilterChange(key, '')} className="hover:text-indigo-900">
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                {isSelectionMode && (
                  <th className="px-6 py-5 w-10">
                    <div 
                      onClick={toggleSelectAll}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                        selectedIds.size === filteredData.length && filteredData.length > 0
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'bg-white border-slate-300'
                      }`}
                    >
                      {selectedIds.size === filteredData.length && filteredData.length > 0 && <Check size={12} className="text-white" />}
                    </div>
                  </th>
                )}
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`px-6 py-5 ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr
                      key={idx}
                      onClick={() => isSelectionMode && toggleSelectItem(item.id)}
                      className={`transition-colors group ${
                        isSelectionMode ? 'cursor-pointer' : ''
                      } ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'}`}
                    >
                      {isSelectionMode && (
                        <td className="px-6 py-4">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
                          }`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                        </td>
                      )}
                      {columns.map((col, i) => (
                        <td
                          key={i}
                          className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''}`}
                        >
                          {col.key === 'status' ? (
                            <StatusBadge status={item[col.key]} />
                          ) : (
                            <span className={`text-sm ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>
                              {item[col.key]}
                            </span>
                          )}
                        </td>
                      ))}

                      <td className="px-6 py-4 text-right">
                        {!isSelectionMode && (
                          <ActionButtons
                            onView={() => onView(item)}
                            onDownload={() => onDownload(item)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + (isSelectionMode ? 2 : 1)} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Search className="h-8 w-8 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold">No matching records</p>
                        <p className="text-slate-500 text-sm">Try adjusting your filters to find what you're looking for.</p>
                      </div>
                      <button 
                        onClick={clearFilters}
                        className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SalesOrdersPage = () => {
  const { data, isLoading } = useFrappeGetCall(
    "customer_portal.api.v1.get_sales_order_data"
  );

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const handleDownloadOrder = (order: any) => {
    if (!order) return;
    const printUrl = `/app/print/Sales Order/${order.id}`;
    window.open(printUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-500 font-medium animate-pulse">
          Loading Sales Orders...
        </div>
      </div>
    );
  }

  const rawApiData = data?.message || [];

  const salesOrders = rawApiData.map((so: any) => ({
    id: so.name,
    ref: so.po_no || "-",
    date: so.transaction_date,
    amount: `$${Number(so.grand_total).toLocaleString()}`,
    status: so.status,
  }));

  const columns: Column[] = [
    { label: 'Order ID', key: 'id' },
    { label: 'PO Ref', key: 'ref' },
    { label: 'Date', key: 'date' },
    { label: 'Amount', key: 'amount', align: 'right' },
    { label: 'Status', key: 'status' },
  ];

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <DocumentListView
        title="Sales Orders"
        data={salesOrders}
        rawData={rawApiData} // Pass the raw data to enable full export
        columns={columns}
        icon={ShoppingBag}
        onView={handleViewOrder}
        onDownload={handleDownloadOrder}
      />

      <ViewRecords
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Sales Order Details"
      >
        {selectedOrder ? (
          <div className="space-y-2 text-sm">
            <p><strong>Order ID:</strong> {selectedOrder.id}</p>
            <p><strong>PO Ref:</strong> {selectedOrder.ref}</p>
            <p><strong>Date:</strong> {selectedOrder.date}</p>
            <p><strong>Amount:</strong> {selectedOrder.amount}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </ViewRecords>
    </div>
  );
};

export default SalesOrdersPage;

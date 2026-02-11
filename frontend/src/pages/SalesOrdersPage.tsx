import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingBag, X, Search, Check, Trash2 } from 'lucide-react';
import { useFrappeGetCall, useFrappeDeleteDoc } from "frappe-react-sdk";
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
    Draft: 'bg-slate-100 text-slate-600',
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
  onView: (item: any) => void;
  onDownload: (item: any) => void;
  onDelete?: (item: any) => void;
  rawData?: any[];
}

const DocumentListView = ({ title, data, columns, icon: Icon, onView, onDownload, onDelete, rawData }: DocumentListViewProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string>>({});
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (isFilterOpen && toolbarRef.current && !toolbarRef.current.contains(target)) {
        setIsFilterOpen(false);
      }
      
      if (isSelectionMode && containerRef.current && !containerRef.current.contains(target)) {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
      }
    };

    if (isFilterOpen || isSelectionMode) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen, isSelectionMode]);

  //  Filter Debounce 
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(activeFilters);
    }, 2000); 

    return () => clearTimeout(timer);
  }, [activeFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value) newFilters[key] = value;
      else delete newFilters[key];
      return newFilters;
    });
  };

  const clearFilters = () => setActiveFilters({});

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(debouncedFilters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = String(item[key] || '').toLowerCase();
        return itemValue.includes(value.toLowerCase());
      });
    });
  }, [data, debouncedFilters]);

  const activeFilterCount = Object.keys(activeFilters).length;

  //  Selection Mode 
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(item => item.name || item.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const selectedExportData = useMemo(() => {
    const sourceData = rawData || filteredData;
    return sourceData.filter(item => selectedIds.has(item.name || item.id));
  }, [rawData, filteredData, selectedIds]);

  return (
    <div ref={containerRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
            <DataToolbar onFilter={() => setIsFilterOpen(!isFilterOpen)} onExport={toggleSelectionMode} activeFilterCount={activeFilterCount} />
          )}
          <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title={title} columns={columns} activeFilters={activeFilters} onFilterChange={handleFilterChange} onClearAll={clearFilters} />
        </div>
      </div>

      {/*  Selection Mode Banner  */}
      {isSelectionMode && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white"><Check size={16} /></div>
            <p className="text-sm font-bold text-indigo-900">Selection Mode Active: <span className="font-normal">Please select the records you want to export.</span></p>
          </div>
          <button onClick={toggleSelectAll} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4">{selectedIds.size === filteredData.length ? 'Deselect All' : 'Select All Visible'}</button>
        </div>
      )}

      {/*  Active Filters  */}
      {!isSelectionMode && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const column = columns.find(c => c.key === key);
            return (
              <div key={key} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 text-xs font-medium">
                <span className="opacity-60">{column?.label || key}:</span>
                <span>{value}</span>
                <button onClick={() => handleFilterChange(key, '')} className="hover:text-indigo-900"><X size={12} /></button>
              </div>
            );
          })}
        </div>
      )}

      {/*  Table  */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                {isSelectionMode && (
                  <th className="px-6 py-5 w-10">
                    <div onClick={toggleSelectAll} className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.size === filteredData.length && filteredData.length > 0 ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                      {selectedIds.size === filteredData.length && filteredData.length > 0 && <Check size={12} className="text-white" />}
                    </div>
                  </th>
                )}
                {columns.map((col, i) => <th key={i} className={`px-6 py-5 ${col.align === 'right' ? 'text-right' : ''}`}>{col.label}</th>)}
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => {
                  const itemId = item.name || item.id;
                  const isSelected = selectedIds.has(itemId);
                  return (
                    <tr key={idx} onClick={() => isSelectionMode && toggleSelectItem(itemId)} className={`transition-colors group ${isSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'}`}>
                      {isSelectionMode && (
                        <td className="px-6 py-4">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                        </td>
                      )}
                      {columns.map((col, i) => (
                        <td key={i} className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''}`}>
                          {col.key === 'status' ? <StatusBadge status={item[col.key]} /> : <span className={`text-sm ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>{item[col.key]}</span>}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right">
                        {!isSelectionMode && (
                          <div className="flex items-center justify-end gap-2">
                            {item.status === 'Draft' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this draft sales order?')) {
                                    onDelete?.(item);
                                  }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                                title="Cancel/Delete Draft"
                              >
                                <Trash2 size={14} />
                                <span>Cancel</span>
                              </button>
                            )}
                            <ActionButtons onView={() => onView(item)} onDownload={() => onDownload(item)} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + (isSelectionMode ? 2 : 1)} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full"><Search className="h-8 w-8 text-slate-300" /></div>
                      <div><p className="text-slate-900 font-bold">No matching records</p><p className="text-slate-500 text-sm">Try adjusting your filters to find what you're looking for.</p></div>
                      <button onClick={clearFilters} className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Clear all filters</button>
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

//  Sales Orders Page 
const SalesOrdersPage = () => {
  const { data, isLoading, error, mutate } = useFrappeGetCall('customer_portal.api.v1.get_sales_order_data');
  const { deleteDoc } = useFrappeDeleteDoc();

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
    const docName = order.name || order.id;
    const params = new URLSearchParams({
      doctype: 'Sales Order',
      name: docName,
      format: 'Standard',
      no_letterhead: '1',
      letterhead: 'No Letterhead',
      settings: JSON.stringify({}),
      _lang: 'en'
    });
    const pdfUrl = `/api/method/frappe.utils.print_format.download_pdf?${params.toString()}`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `SalesOrder_${docName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteOrder = async (order: any) => {
    try {
      const docName = order.name || order.id;
      await deleteDoc('Sales Order', docName);
      mutate();
    } catch (error) {
      console.error("Failed to delete sales order:", error);
      alert("Failed to delete the sales order. Please try again.");
    }
  };

  const columns: Column[] = [
    { label: 'Order ID', key: 'name' },
    { label: 'Date', key: 'transaction_date' },
    { label: 'Total Amount', key: 'grand_total' },
    { label: 'Status', key: 'status' },
  ];

  if (isLoading) return <div className="p-10 flex items-center justify-center min-h-screen bg-slate-50"><div className="text-slate-500 font-medium animate-pulse">Loading sales orders...</div></div>;
  if (error) return <div className="p-10 flex items-center justify-center min-h-screen bg-slate-50"><div className="text-rose-500 font-bold">Error loading sales orders: {error.message}</div></div>;

  const orders = data?.message || [];

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <DocumentListView 
        title="Sales Orders" 
        data={orders}   
        columns={columns} 
        icon={ShoppingBag} 
        onView={handleViewOrder}
        onDownload={handleDownloadOrder}
        onDelete={handleDeleteOrder}
        rawData={orders}
      />

      <ViewRecords isOpen={isModalOpen} onClose={handleCloseModal} title="Sales Order Details">
        {selectedOrder ? (
          <div className="space-y-2 text-sm">
            <p><strong>Order ID:</strong> {selectedOrder.name}</p>
            <p><strong>Date:</strong> {selectedOrder.transaction_date}</p>
            <p><strong>Total Amount:</strong> {selectedOrder.grand_total}</p>
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

import React, { useState, useMemo } from 'react';
import { BookOpen, Eye, Download, Search, X, Check } from 'lucide-react';
import FilterPanel from '../components/FilterPanel';
import ExportSelection from '../components/ExportSelection';

type LedgerEntry = {
  id: string;
  date: string;
  type: string;
  ref: string;
  debit: string;
  credit: string;
  balance: string;
};

const LEDGER_ENTRIES: LedgerEntry[] = [
  { id: '1', date: 'Oct 01, 2024', type: 'Opening Balance', ref: '-', debit: '0.00', credit: '0.00', balance: '$2,500.00' },
  { id: '2', date: 'Oct 05, 2024', type: 'Invoice', ref: 'INV-2024-001', debit: '1,200.00', credit: '0.00', balance: '$3,700.00' },
  { id: '3', date: 'Oct 08, 2024', type: 'Payment', ref: 'PAY-8821', debit: '0.00', credit: '1,200.00', balance: '$2,500.00' },
  { id: '4', date: 'Oct 12, 2024', type: 'Invoice', ref: 'INV-2024-002', debit: '3,450.00', credit: '0.00', balance: '$5,950.00' },
  { id: '5', date: 'Oct 15, 2024', type: 'Credit Note', ref: 'CRN-002', debit: '0.00', credit: '500.00', balance: '$5,450.00' },
  { id: '6', date: 'Oct 20, 2024', type: 'Payment', ref: 'PAY-8910', debit: '0.00', credit: '2,000.00', balance: '$3,450.00' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Opening Balance': 'bg-slate-100 text-slate-700', 
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

const Ledger = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const columns: { label: string; key: keyof LedgerEntry; align?: 'right' }[] = [
    { label: 'Posting Date', key: 'date' },
    { label: 'Type', key: 'type' },
    { label: 'Reference', key: 'ref' },
    { label: 'Debit (+)', key: 'debit', align: 'right' },
    { label: 'Credit (-)', key: 'credit', align: 'right' },
    { label: 'Balance', key: 'balance', align: 'right' }
  ];

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value) newFilters[key] = value;
      else delete newFilters[key];
      return newFilters;
    });
  };

  const filteredData = useMemo(() => {
    return LEDGER_ENTRIES.filter((item) => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        return String(item[key as keyof LedgerEntry] || '').toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [activeFilters]);

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

  const selectedData = useMemo(() => {
    return filteredData.filter(item => selectedIds.has(item.id));
  }, [filteredData, selectedIds]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
            <BookOpen className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Customer Ledger</h2>
            <p className="text-sm text-slate-500">Manage your ledger records</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {isSelectionMode ? (
            <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
              <button 
                onClick={toggleSelectionMode}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              
              <ExportSelection 
                title="Ledger"
                data={selectedData}
                columns={columns}
                selectedCount={selectedIds.size}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors relative"
              >
                <X size={16} className={isFilterOpen ? 'rotate-0' : 'hidden'} />
                {!isFilterOpen && <Search size={16} />}
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button 
                onClick={toggleSelectionMode}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
              >
                <Download size={16} /> Export All
              </button>
            </div>
          )}

          <FilterPanel 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            title="Ledger"
            columns={columns}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={() => setActiveFilters({})}
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
          {Object.entries(activeFilters).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 text-xs font-medium">
              <span className="opacity-60">{columns.find(c => c.key === key)?.label}:</span>
              <span>{value}</span>
              <button onClick={() => handleFilterChange(key, '')} className="hover:text-indigo-900"><X size={12} /></button>
            </div>
          ))}
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
                {columns.map((col, i) => <th key={i} className={`px-6 py-5 ${col.align === 'right' ? 'text-right' : ''}`}>{col.label}</th>)}
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? filteredData.map((item, idx) => {
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
                      <td key={i} className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''}`}>
                        {col.key === 'type' ? <StatusBadge status={item[col.key]} /> :
                         col.key === 'balance' ? <span className="font-bold text-slate-900">{item[col.key]}</span> :
                         col.key === 'debit' ? <span className="text-sm font-semibold text-rose-600">{item[col.key] !== '0.00' ? `+ ${item[col.key]}` : '-'}</span> :
                         col.key === 'credit' ? <span className="text-sm font-semibold text-emerald-600">{item[col.key] !== '0.00' ? `- ${item[col.key]}` : '-'}</span> :
                         <span className={`text-sm ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>{item[col.key]}</span>}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      {!isSelectionMode && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye size={18}/></button>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Download size={18}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={columns.length + (isSelectionMode ? 2 : 1)} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full"><Search className="h-8 w-8 text-slate-300" /></div>
                      <p className="text-slate-900 font-bold">No matching records</p>
                      <button onClick={() => setActiveFilters({})} className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Clear all filters</button>
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

export default Ledger;

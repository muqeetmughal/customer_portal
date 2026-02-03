import React from 'react';
import { X } from 'lucide-react';

interface Column {
  label: string;
  key: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  columns: Column[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
}

const FilterPanel = ({
  isOpen,
  onClose,
  title,
  columns,
  activeFilters,
  onFilterChange,
  onClearAll
}: FilterPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Filter {title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {columns.map((col) => (
          <div key={col.key} className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {col.label}
            </label>
            <input
              type="text"
              value={activeFilters[col.key] || ''}
              onChange={(e) => onFilterChange(col.key, e.target.value)}
              placeholder={`Filter by ${col.label.toLowerCase()}...`}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-50/50 rounded-b-2xl flex items-center gap-3">
        <button
          onClick={onClearAll}
          className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;

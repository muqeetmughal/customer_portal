import React from 'react';
import { Filter, Download } from 'lucide-react';

interface DataToolbarProps {
  onFilter: () => void;
  onExport: () => void;
  activeFilterCount?: number;
}

const DataToolbar = ({ onFilter, onExport, activeFilterCount = 0 }: DataToolbarProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={onFilter}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Filter size={16} />
          Filter
        </button>
        
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
            {activeFilterCount}
          </span>
        )}
      </div>

      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
      >
        <Download size={16} />
        Export All
      </button>
    </div>
  );
};

export default DataToolbar;

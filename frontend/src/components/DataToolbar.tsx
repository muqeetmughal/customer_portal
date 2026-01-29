import React from 'react';
import { Filter, Download } from 'lucide-react';

interface DataToolbarProps {
  onFilter?: () => void;
  onExport?: () => void;
}

const DataToolbar: React.FC<DataToolbarProps> = ({ onFilter, onExport }) => {
  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <button
        onClick={onFilter}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Filter size={16} /> Filter
      </button>
      <button
        onClick={onExport}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
      >
        <Download size={16} /> Export All
      </button>
    </div>
  );
};

export default DataToolbar;

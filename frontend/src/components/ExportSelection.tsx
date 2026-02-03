import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File as FileIcon } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

interface Column {
  label: string;
  key: string;
  align?: 'right' | 'left';
}

interface ExportButtonProps {
  title: string;
  data: any[];
  columns: Column[];
  selectedCount: number;
  disabled?: boolean;
}

const ExportButton = ({ title, data, columns, selectedCount, disabled }: ExportButtonProps) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const exportToCSV = () => {
    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(item => 
      columns.map(col => `"${item[col.key] || ''}"`).join(',')
    ).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase()}_export.csv`);
    document.body.appendChild(link);
    link.click();
    setIsExportMenuOpen(false);
  };

  const exportToExcel = () => {
    let html = `<table><thead><tr>${columns.map(col => `<th>${col.label}</th>`).join('')}</tr></thead><tbody>`;
    data.forEach(item => {
      html += `<tr>${columns.map(col => `<td>${item[col.key] || ''}</td>`).join('')}</tr>`;
    });
    html += '</tbody></table>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase()}_export.xls`;
    link.click();
    setIsExportMenuOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${title} Export`, 14, 15);
    
    const tableColumn = columns.map(col => col.label);
    const tableRows = data.map(item => 
      columns.map(col => item[col.key] || '')
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`${title.toLowerCase()}_export.pdf`);
    setIsExportMenuOpen(false);
  };

  return (
    <div className="relative">
      <button 
        disabled={disabled || selectedCount === 0}
        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${
          selectedCount > 0 
          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Download size={16} />
        Export ({selectedCount})
      </button>

      {isExportMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          <button onClick={exportToCSV} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <FileIcon size={16} className="text-blue-500" /> Export as CSV
          </button>
          <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <FileSpreadsheet size={16} className="text-emerald-500" /> Export as Excel
          </button>
          <button onClick={exportToPDF} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <FileText size={16} className="text-rose-500" /> Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;

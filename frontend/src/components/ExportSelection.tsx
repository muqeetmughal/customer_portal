import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportButtonProps {
  title: string;
  data: any[];
  selectedCount: number;
  disabled?: boolean;
}

const ExportButton = ({ title, data, selectedCount, disabled }: ExportButtonProps) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const getExportColumns = () => {
    if (!data || data.length === 0) return [];

    const allKeys = new Set<string>();

    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    const filteredKeys = Array.from(allKeys).filter(
      key =>
        !key.startsWith('_') &&
        key !== 'idx' &&
        key !== 'doctype' &&
        key !== 'owner' &&
        key !== 'modified_by' &&
        key !== 'creation' &&
        key !== 'modified'
    );

    return filteredKeys.map(key => ({
      label: key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
      key: key
    }));
  };

  const exportToExcel = () => {
    const exportColumns = getExportColumns();

    let html = `<table><thead><tr>${
      exportColumns.map(col => `<th>${col.label}</th>`).join('')
    }</tr></thead><tbody>`;

    data.forEach(item => {
      html += `<tr>${
        exportColumns.map(col => `<td>${item[col.key] || ''}</td>`).join('')
      }</tr>`;
    });

    html += '</tbody></table>';

    const blob = new Blob([html], {
      type: 'application/vnd.ms-excel'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase()}_export.xls`;
    link.click();

    setIsExportMenuOpen(false);
  };

  const getDoctype = () => {
    const doctypeMap: Record<string, string> = {
      'Invoices': 'Sales Invoice',
      'Quotations': 'Quotation',
      'Sales Orders': 'Sales Order',
      'Delivery Notes': 'Delivery Note',
    };
    return doctypeMap[title] || title;
  };

  const exportToPDF = () => {
    const doctype = getDoctype();
    
    data.forEach((item, index) => {
      const docName = item.name || item.id;
      
      const params = new URLSearchParams({
        doctype: doctype,
        name: docName,
        format: 'Standard',
        no_letterhead: '1',
        settings: JSON.stringify({}),
        _lang: 'en'
      });
      
      const pdfUrl = `/api/method/frappe.utils.print_format.download_pdf?${params.toString()}`;
      
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${doctype}_${docName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 300);
    });

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
          <button
            onClick={exportToExcel}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet size={16} className="text-emerald-500" />
            Export as Excel
          </button>

          <button
            onClick={exportToPDF}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FileText size={16} className="text-rose-500" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;

import React from "react";
import { Eye, Download } from "lucide-react";

interface ActionButtonsProps {
  onView?: () => void;
  onDownload?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onView, onDownload }) => {
  return (
    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
        onClick={onView}
      >
        <Eye size={18} />
      </button>
      <button
        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
        onClick={onDownload}
      >
        <Download size={18} />
      </button>
    </div>
  );
};

export default ActionButtons;

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const ViewRecords: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div
        className="
          relative w-full max-w-2xl mx-4
          bg-white rounded-3xl shadow-2xl
          animate-modal-in
        "
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            {title && (
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed information
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-9 h-9 flex items-center justify-center
              rounded-full
              text-slate-400
              hover:text-slate-700
              hover:bg-slate-100
              transition
            "
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3 text-sm text-slate-700">
            {children}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-3xl">
          <button
            onClick={onClose}
            className="
              px-4 py-2 text-sm font-medium
              rounded-xl
              bg-slate-900 text-white
              hover:bg-slate-800
              transition
            "
          >
            Close
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes modal-in {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-modal-in {
            animation: modal-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .animate-fade-in {
            animation: fade-in 0.25s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default ViewRecords;

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      {/* 弹窗 */}
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-80 p-5 animate-slide-in"
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-3 mb-4">
          {danger && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
              <AlertTriangle size={16} className={danger ? 'text-red-500' : 'text-blue-500'} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-xs px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-colors ${
              danger
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#3B5998] text-white hover:bg-[#2A4A7F]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

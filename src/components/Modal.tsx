'use client';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--background)] rounded-[14px] shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
          <button onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--muted-light)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Fermer">
            <X size={14} />
          </button>
        </div>
        {/* Body scrollable */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

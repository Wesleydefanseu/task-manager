'use client';
import { ReactNode, useEffect } from 'react';

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
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

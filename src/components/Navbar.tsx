'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import type { AuthUser } from '@/lib/types';
import { useTheme } from './ThemeProvider';

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-[#d8f3e3] text-[#1e4d38] text-xs font-bold flex items-center justify-center ring-2 ring-[#b2e8c8] shrink-0">
      {initials}
    </div>
  );
}

export default function Navbar({ user }: { user: AuthUser | null }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { dark, toggle } = useTheme();

  async function handleLogout() {
    setLoggingOut(true);
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    finally { router.replace('/login'); }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-[#2d9e63] flex items-center justify-center shadow-sm group-hover:bg-[#2d6a4f] transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className="font-bold text-[var(--foreground)] text-base">AgileTask</span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-[var(--foreground)]">{user.name}</span>
              <span className="text-xs text-[var(--muted-light)]">{user.email}</span>
            </div>
          )}
          {user && <Avatar name={user.name ?? '?'} />}

          {/* Dark mode toggle */}
          <button onClick={toggle} className="btn-ghost px-2.5 py-2 border border-[var(--border)] rounded-lg" title={dark ? 'Mode clair' : 'Mode sombre'}>
            {dark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <button onClick={handleLogout} disabled={loggingOut} className="btn-ghost text-sm px-3 py-1.5 border border-[var(--border)] rounded-lg">
            {loggingOut ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--muted)] border-t-transparent" />
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Déconnexion
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

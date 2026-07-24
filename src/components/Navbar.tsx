'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, Sun, Moon, LogOut } from 'lucide-react';
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
            <LayoutGrid size={15} color="white" />
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
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button onClick={handleLogout} disabled={loggingOut} className="btn-ghost text-sm px-3 py-1.5 border border-[var(--border)] rounded-lg">
            {loggingOut ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--muted)] border-t-transparent" />
            ) : (
              <>
                <LogOut size={14} />
                Déconnexion
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

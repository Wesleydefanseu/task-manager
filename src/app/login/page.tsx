'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) { router.replace('/dashboard'); return; }
    const data = await res.json().catch(() => null);
    setError(data?.error || 'Email ou mot de passe incorrect.');
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)]">

      {/* ── Panneau gauche (branding) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0e2419] flex-col justify-between p-12 relative overflow-hidden">
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2d9e63] blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#40916c] blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <Link href="/" className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#2d9e63] flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg">AgileTask</span>
        </Link>

        <div className="relative space-y-8">
          <blockquote className="text-white/90 text-2xl font-light leading-relaxed">
            "Organisez, priorisez, livrez.<br />Votre équipe mérite les meilleurs outils."
          </blockquote>
          <div className="space-y-3">
            {['Tableaux Kanban visuels et intuitifs', 'Diagrammes Gantt & PERT automatiques', 'Collaboration en équipe simplifiée'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/70 text-sm">
                <div className="h-5 w-5 rounded-full bg-[#2d9e63]/30 border border-[#2d9e63]/50 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#2d9e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3"/>
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/30 text-xs">Projet Tutoré M1 — Gestion Agile</p>
      </div>

      {/* ── Panneau droit (formulaire) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--surface)]">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-[#2d9e63] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <span className="font-bold text-[var(--foreground)]">AgileTask</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Bon retour 👋</h1>
            <p className="text-sm text-[var(--muted)]">Connectez-vous à votre espace de travail</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Adresse email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Mot de passe</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="input-field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Connexion...</>
              ) : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-semibold text-[#2d9e63] hover:text-[#2d6a4f] transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

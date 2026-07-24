'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) return setError('Les mots de passe ne correspondent pas.');
    if (password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Une erreur est survenue.');
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => router.replace('/login'), 1200);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">

      {/* ── Panneau gauche (branding) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0e2419] flex-col justify-between p-12 relative overflow-hidden">
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

        <div className="relative space-y-6">
          <div>
            <p className="text-[#2d9e63] text-xs font-semibold uppercase tracking-widest mb-3">Pourquoi AgileTask ?</p>
            <h2 className="text-white text-2xl font-light leading-relaxed">
              Tout ce dont votre équipe a besoin pour livrer des projets de qualité.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📋', label: 'Kanban' },
              { icon: '📅', label: 'Gantt' },
              { icon: '🔗', label: 'PERT / CPM' },
              { icon: '👥', label: 'Équipe' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                <span className="text-lg">{item.icon}</span>
                <span className="text-white/80 text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/30 text-xs">Projet Tutoré M1 — Gestion Agile</p>
      </div>

      {/* ── Panneau droit (formulaire) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--surface)]">
        <div className="w-full max-w-sm">

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
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Créer un compte</h1>
            <p className="text-sm text-[var(--muted)]">Rejoignez AgileTask et gérez vos projets</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-[#f0faf4] border border-[#b2e8c8] px-4 py-3 text-sm text-[#1e4d38]">
              <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="9,12 11,14 15,10"/>
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nom complet</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont" className="input-field" />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Confirmer le mot de passe</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" className="input-field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Création...</>
              ) : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-[#2d9e63] hover:text-[#2d6a4f] transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

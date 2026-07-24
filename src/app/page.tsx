import { LayoutGrid, Calendar, User, Check } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#2d9e63] flex items-center justify-center shadow-sm">
              <LayoutGrid size={18} color="white" />
            </div>
            <span className="text-base font-bold tracking-tight">AgileTask</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm">Se connecter</Link>
            <Link href="/register" className="btn-primary text-sm">Commencer gratuitement</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b2e8c8] bg-[#f0faf4] px-4 py-1.5 text-sm text-[#2d6a4f] font-medium mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2d9e63] animate-pulse" />
            Gestion de projets Agile &amp; Kanban
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto mb-6">
            Gérez vos projets avec{' '}
            <span className="text-[#2d9e63]">clarté</span>
          </h1>

          <p className="text-lg text-[var(--muted)] max-w-xl mx-auto leading-relaxed mb-10">
            Tableaux Kanban, diagrammes Gantt &amp; PERT, gestion d&apos;équipe — tout ce qu&apos;il faut pour livrer vos projets à temps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-8 py-3 text-base">
              Créer un compte gratuit
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3 text-base">
              Se connecter
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: 'Kanban', label: 'Tableaux visuels' },
              { value: 'Gantt', label: 'Diagrammes auto' },
              { value: 'PERT', label: 'Chemin critique' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-[#2d9e63]">{s.value}</p>
                <p className="text-xs text-[var(--muted-light)] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-[var(--border)]" />

        {/* ── Features ── */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="section-label text-center mb-12">Fonctionnalités</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
              icon: <LayoutGrid size={22} />,
                title: 'Tableau Kanban',
                desc: 'Glissez-déposez vos tâches entre les colonnes À faire, En cours et Terminé.',
              },
              {
              icon: <Calendar size={22} />,
                title: 'Gantt &amp; PERT',
                desc: 'Générez automatiquement vos diagrammes de planification avec calcul du chemin critique.',
              },
              {
              icon: <User size={22} />,
                title: 'Gestion d&apos;équipe',
                desc: 'Invitez des membres, assignez des rôles et suivez qui fait quoi sur chaque tâche.',
              },
            ].map((f) => (
              <div key={f.title} className="card p-6 hover:border-[#b2e8c8] hover:shadow-md transition-all duration-200">
                <div className="h-10 w-10 rounded-xl bg-[var(--surface-2)] text-[#2d9e63] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à organiser vos projets ?</h2>
            <p className="text-[var(--muted)] mb-8">Créez votre compte en 30 secondes, aucune carte bancaire requise.</p>
            <Link href="/register" className="btn-primary px-10 py-3 text-base">
              Démarrer maintenant →
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] py-6">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-sm text-[var(--muted-light)]">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#2d9e63] flex items-center justify-center">
              <LayoutGrid size={12} color="white" />
            </div>
            <span className="font-medium text-[var(--foreground)]">AgileTask</span>
          </div>
          <span>© 2025 — Projet Tutoré M1</span>
        </div>
      </footer>
    </div>
  );
}

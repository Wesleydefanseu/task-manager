import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] flex flex-col">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 border-b border-[#e2ece7] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#2d9e63] flex items-center justify-center shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
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
            Gestion de projets Agile & Kanban
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto mb-6">
            Gérez vos projets avec{' '}
            <span className="text-[#2d9e63]">clarté</span>
          </h1>

          <p className="text-lg text-[#6b7c74] max-w-xl mx-auto leading-relaxed mb-10">
            Tableaux Kanban, diagrammes Gantt & PERT, gestion d'équipe — tout ce qu'il faut pour livrer vos projets à temps.
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
                <p className="text-xs text-[#9ab0a6] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-[#e2ece7]" />

        {/* ── Features ── */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="section-label text-center mb-12">Fonctionnalités</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                ),
                title: 'Tableau Kanban',
                desc: 'Glissez-déposez vos tâches entre les colonnes À faire, En cours et Terminé.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>
                  </svg>
                ),
                title: 'Gantt & PERT',
                desc: 'Générez automatiquement vos diagrammes de planification avec calcul du chemin critique.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                ),
                title: 'Gestion d\'équipe',
                desc: 'Invitez des membres, assignez des rôles et suivez qui fait quoi sur chaque tâche.',
              },
            ].map((f) => (
              <div key={f.title} className="card p-6 hover:border-[#b2e8c8] hover:shadow-md transition-all duration-200">
                <div className="h-10 w-10 rounded-xl bg-[#f0faf4] text-[#2d9e63] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#0a0a0a] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6b7c74] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-[#e2ece7] bg-[#f8faf9]">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à organiser vos projets ?</h2>
            <p className="text-[#6b7c74] mb-8">Créez votre compte en 30 secondes, aucune carte bancaire requise.</p>
            <Link href="/register" className="btn-primary px-10 py-3 text-base">
              Démarrer maintenant →
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e2ece7] py-6">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-sm text-[#9ab0a6]">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#2d9e63] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <span className="font-medium text-[#0a0a0a]">AgileTask</span>
          </div>
          <span>© 2025 — Projet Tutoré M1</span>
        </div>
      </footer>
    </div>
  );
}

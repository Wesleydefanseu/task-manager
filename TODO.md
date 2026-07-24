# Liste des tâches — TERMINÉ ✅

## Phase 1 — Mode sombre (remplacer couleurs hardcodées → CSS variables)

- [x] TODO.md créé
- [x] 1. `src/app/dashboard/layout.tsx` — `bg-[#f8faf9]` → `bg-[var(--surface)]`
- [x] 2. `src/app/dashboard/page.tsx` — Couleurs text/bg/border → variables CSS
- [x] 3. `src/app/dashboard/project/[id]/page.tsx` — Couleurs → variables CSS
- [x] 4. `src/app/page.tsx` (Landing page) — Couleurs → variables CSS
- [x] 5. `src/app/login/page.tsx` — Couleurs → variables CSS
- [x] 6. `src/app/register/page.tsx` — Couleurs → variables CSS
- [x] 7. `src/components/ProjectCard.tsx` — Couleurs → variables CSS
- [x] 8. `src/components/KanbanColumn.tsx` — Couleurs → variables CSS
- [x] 9. `src/components/TaskCard.tsx` — Couleurs → variables CSS
- [x] 10. `src/components/TaskDetailModal.tsx` — Couleurs → variables CSS
- [x] 11. `src/components/Modal.tsx` — Couleurs → variables CSS
- [x] 12. `src/components/MembersPanel.tsx` — Couleurs → variables CSS
- [x] 13. `src/components/GanttView.tsx` — Couleurs → variables CSS + syntaxe Mermaid robuste
- [x] 14. `src/components/PertView.tsx` — Couleurs → variables CSS

## Phase 1b — Fix mode sombre (FOUC + cascade)

- [x] `src/app/globals.css` — ajout `html.dark` + `.dark` pour double sélecteur
- [x] `src/app/layout.tsx` — inline script pour appliquer classe `dark` avant hydratation
- [x] `src/components/MermaidChart.tsx` — meilleure gestion d'erreur + variables CSS

## Phase 2 — Remplir la base de données

- [x] 15. `npm run seed` exécuté avec succès (4 users, 3 projets, tâches + dépendances)

## Phase 3 — Vérification

- [ ] 16. Tester en navigation : basculer mode sombre + onglets Gantt/PERT

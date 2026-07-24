import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding...');

  // Clean up
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const hash = (p: string) => bcrypt.hash(p, 10);

  // Users
  const [alice, bob, carol, dave] = await Promise.all([
    prisma.user.create({ data: { name: 'Alice Martin', email: 'alice@demo.com', password: await hash('password123') } }),
    prisma.user.create({ data: { name: 'Bob Dupont',   email: 'bob@demo.com',   password: await hash('password123') } }),
    prisma.user.create({ data: { name: 'Carol Leroy',  email: 'carol@demo.com', password: await hash('password123') } }),
    prisma.user.create({ data: { name: 'Dave Moreau',  email: 'dave@demo.com',  password: await hash('password123') } }),
  ]);

  // Project 1 — Refonte Site Web
  const p1 = await prisma.project.create({
    data: { name: 'Refonte Site Web', description: 'Refonte complète du site vitrine avec Next.js et Tailwind CSS' },
  });
  await prisma.projectMember.createMany({
    data: [
      { projectId: p1.id, userId: alice.id, role: 'ADMIN' },
      { projectId: p1.id, userId: bob.id,   role: 'MEMBER' },
      { projectId: p1.id, userId: carol.id, role: 'MEMBER' },
    ],
  });

  const p1tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Maquettes Figma', description: 'Créer les maquettes desktop et mobile', status: 'DONE', priority: 'HIGH', projectId: p1.id, startDate: new Date('2025-01-06'), dueDate: new Date('2025-01-10'), duration: 5 } }),
    prisma.task.create({ data: { title: 'Intégration HTML/CSS', description: 'Intégrer les maquettes validées', status: 'DONE', priority: 'HIGH', projectId: p1.id, startDate: new Date('2025-01-13'), dueDate: new Date('2025-01-17'), duration: 5 } }),
    prisma.task.create({ data: { title: 'Développement composants React', description: 'Créer les composants réutilisables', status: 'IN_PROGRESS', priority: 'HIGH', projectId: p1.id, startDate: new Date('2025-01-20'), dueDate: new Date('2025-01-31'), duration: 10 } }),
    prisma.task.create({ data: { title: 'Intégration API REST', description: 'Connecter le front aux endpoints backend', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: p1.id, startDate: new Date('2025-01-27'), dueDate: new Date('2025-02-07'), duration: 10 } }),
    prisma.task.create({ data: { title: 'Tests E2E Playwright', description: 'Écrire et exécuter les tests end-to-end', status: 'TODO', priority: 'MEDIUM', projectId: p1.id, startDate: new Date('2025-02-10'), dueDate: new Date('2025-02-14'), duration: 5 } }),
    prisma.task.create({ data: { title: 'Déploiement Vercel', description: 'Configurer CI/CD et déployer en production', status: 'TODO', priority: 'LOW', projectId: p1.id, startDate: new Date('2025-02-17'), dueDate: new Date('2025-02-18'), duration: 2 } }),
  ]);

  // Set dependencies
  await prisma.task.update({ where: { id: p1tasks[1].id }, data: { dependencies: { connect: [{ id: p1tasks[0].id }] } } });
  await prisma.task.update({ where: { id: p1tasks[2].id }, data: { dependencies: { connect: [{ id: p1tasks[1].id }] } } });
  await prisma.task.update({ where: { id: p1tasks[3].id }, data: { dependencies: { connect: [{ id: p1tasks[2].id }] } } });
  await prisma.task.update({ where: { id: p1tasks[4].id }, data: { dependencies: { connect: [{ id: p1tasks[3].id }] } } });
  await prisma.task.update({ where: { id: p1tasks[5].id }, data: { dependencies: { connect: [{ id: p1tasks[4].id }] } } });

  // Assignees
  await prisma.taskAssignee.createMany({ data: [
    { taskId: p1tasks[0].id, userId: alice.id },
    { taskId: p1tasks[1].id, userId: bob.id },
    { taskId: p1tasks[2].id, userId: bob.id },
    { taskId: p1tasks[2].id, userId: carol.id },
    { taskId: p1tasks[3].id, userId: carol.id },
    { taskId: p1tasks[4].id, userId: alice.id },
    { taskId: p1tasks[4].id, userId: bob.id },
    { taskId: p1tasks[5].id, userId: alice.id },
  ]});

  // Project 2 — App Mobile
  const p2 = await prisma.project.create({
    data: { name: 'App Mobile RH', description: 'Application mobile de gestion des congés et absences' },
  });
  await prisma.projectMember.createMany({
    data: [
      { projectId: p2.id, userId: bob.id,   role: 'ADMIN' },
      { projectId: p2.id, userId: dave.id,  role: 'MEMBER' },
      { projectId: p2.id, userId: alice.id, role: 'MEMBER' },
    ],
  });

  const p2tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Cahier des charges', description: 'Rédiger le cahier des charges fonctionnel', status: 'DONE', priority: 'HIGH', projectId: p2.id, startDate: new Date('2025-01-06'), dueDate: new Date('2025-01-08'), duration: 3 } }),
    prisma.task.create({ data: { title: 'Architecture technique', description: 'Définir la stack et l\'architecture', status: 'DONE', priority: 'HIGH', projectId: p2.id, startDate: new Date('2025-01-09'), dueDate: new Date('2025-01-10'), duration: 2 } }),
    prisma.task.create({ data: { title: 'Écrans authentification', description: 'Login, register, forgot password', status: 'IN_PROGRESS', priority: 'HIGH', projectId: p2.id, startDate: new Date('2025-01-13'), dueDate: new Date('2025-01-17'), duration: 5 } }),
    prisma.task.create({ data: { title: 'Module demande de congés', description: 'Formulaire et workflow de validation', status: 'TODO', priority: 'HIGH', projectId: p2.id, startDate: new Date('2025-01-20'), dueDate: new Date('2025-01-31'), duration: 10 } }),
    prisma.task.create({ data: { title: 'Notifications push', description: 'Intégrer Firebase Cloud Messaging', status: 'TODO', priority: 'MEDIUM', projectId: p2.id, startDate: new Date('2025-02-03'), dueDate: new Date('2025-02-07'), duration: 5 } }),
  ]);

  await prisma.task.update({ where: { id: p2tasks[2].id }, data: { dependencies: { connect: [{ id: p2tasks[1].id }] } } });
  await prisma.task.update({ where: { id: p2tasks[3].id }, data: { dependencies: { connect: [{ id: p2tasks[2].id }] } } });
  await prisma.task.update({ where: { id: p2tasks[4].id }, data: { dependencies: { connect: [{ id: p2tasks[3].id }] } } });

  await prisma.taskAssignee.createMany({ data: [
    { taskId: p2tasks[0].id, userId: bob.id },
    { taskId: p2tasks[1].id, userId: bob.id },
    { taskId: p2tasks[1].id, userId: dave.id },
    { taskId: p2tasks[2].id, userId: dave.id },
    { taskId: p2tasks[3].id, userId: dave.id },
    { taskId: p2tasks[3].id, userId: alice.id },
    { taskId: p2tasks[4].id, userId: alice.id },
  ]});

  // Project 3 — Dashboard Analytics
  const p3 = await prisma.project.create({
    data: { name: 'Dashboard Analytics', description: 'Tableau de bord de suivi des KPIs métier en temps réel' },
  });
  await prisma.projectMember.createMany({
    data: [
      { projectId: p3.id, userId: carol.id, role: 'ADMIN' },
      { projectId: p3.id, userId: alice.id, role: 'MEMBER' },
      { projectId: p3.id, userId: dave.id,  role: 'MEMBER' },
    ],
  });

  const p3tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Modélisation données', description: 'Schéma de la base de données analytique', status: 'DONE', priority: 'HIGH', projectId: p3.id, duration: 3 } }),
    prisma.task.create({ data: { title: 'Pipeline ETL', description: 'Extraction et transformation des données sources', status: 'IN_PROGRESS', priority: 'HIGH', projectId: p3.id, dueDate: new Date('2025-02-14'), duration: 8 } }),
    prisma.task.create({ data: { title: 'Graphiques Chart.js', description: 'Intégrer les visualisations interactives', status: 'TODO', priority: 'MEDIUM', projectId: p3.id, dueDate: new Date('2025-02-21'), duration: 5 } }),
    prisma.task.create({ data: { title: 'Export PDF/Excel', description: 'Générer des rapports exportables', status: 'TODO', priority: 'LOW', projectId: p3.id, dueDate: new Date('2025-02-28'), duration: 3 } }),
  ]);

  await prisma.task.update({ where: { id: p3tasks[1].id }, data: { dependencies: { connect: [{ id: p3tasks[0].id }] } } });
  await prisma.task.update({ where: { id: p3tasks[2].id }, data: { dependencies: { connect: [{ id: p3tasks[1].id }] } } });
  await prisma.task.update({ where: { id: p3tasks[3].id }, data: { dependencies: { connect: [{ id: p3tasks[2].id }] } } });

  await prisma.taskAssignee.createMany({ data: [
    { taskId: p3tasks[0].id, userId: carol.id },
    { taskId: p3tasks[1].id, userId: carol.id },
    { taskId: p3tasks[1].id, userId: dave.id },
    { taskId: p3tasks[2].id, userId: alice.id },
    { taskId: p3tasks[2].id, userId: dave.id },
    { taskId: p3tasks[3].id, userId: alice.id },
  ]});

  console.log('✅ Done!');
  console.log('');
  console.log('Comptes de test:');
  console.log('  alice@demo.com / password123  (admin: Refonte Site Web, Dashboard Analytics)');
  console.log('  bob@demo.com   / password123  (admin: App Mobile RH)');
  console.log('  carol@demo.com / password123  (admin: Dashboard Analytics)');
  console.log('  dave@demo.com  / password123  (membre sur 2 projets)');
}

main().catch(console.error).finally(() => prisma.$disconnect());

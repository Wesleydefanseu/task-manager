import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return verifyToken(token || '') as { userId: string } | null;
}

const projectInclude = {
  tasks: {
    include: {
      assignees: { include: { user: { select: { id: true, name: true, email: true } } } },
      dependencies: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  members: {
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  // Tous les projets auxquels l'user appartient (ADMIN ou MEMBER)
  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.userId },
    include: { project: { include: projectInclude } },
    orderBy: { createdAt: 'desc' },
  });

  const projects = memberships.map((m) => ({
    ...m.project,
    myRole: m.role as 'ADMIN' | 'MEMBER',
  }));

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  // Créer le projet + ajouter le créateur comme ADMIN dans une transaction
  const project = await prisma.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: { name, description },
    });
    await tx.projectMember.create({
      data: { projectId: p.id, userId: user.userId, role: 'ADMIN' },
    });
    return tx.project.findUnique({ where: { id: p.id }, include: projectInclude });
  });

  return NextResponse.json({ ...project, myRole: 'ADMIN' });
}

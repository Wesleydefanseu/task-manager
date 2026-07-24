import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  const payload = verifyToken(token) as { userId: string } | null;
  return payload?.userId ?? null;
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

async function getMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const membership = await getMembership(id, userId);
  if (!membership) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const project = await prisma.project.findUnique({ where: { id }, include: projectInclude });
  if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

  return NextResponse.json({ ...project, myRole: membership.role });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const membership = await getMembership(id, userId);
  if (!membership || membership.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
  }

  const { name, description } = await req.json();
  const project = await prisma.project.update({
    where: { id },
    data: { ...(name && { name }), ...(description !== undefined && { description }) },
    include: projectInclude,
  });
  return NextResponse.json({ ...project, myRole: 'ADMIN' });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const membership = await getMembership(id, userId);
  if (!membership || membership.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Seul un Admin peut supprimer ce projet' }, { status: 403 });
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

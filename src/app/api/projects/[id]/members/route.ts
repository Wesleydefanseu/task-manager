import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  const payload = verifyToken(token) as { userId: string } | null;
  return payload?.userId ?? null;
}

async function isAdmin(projectId: string, userId: string): Promise<boolean> {
  const m = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return m?.role === 'ADMIN';
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  // Vérifier que l'user est membre du projet
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!membership) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  if (!(await isAdmin(projectId, userId))) {
    return NextResponse.json({ error: 'Seul un Admin peut inviter des membres' }, { status: 403 });
  }

  const { email, role } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return NextResponse.json({ error: 'Aucun compte trouvé avec cet email' }, { status: 404 });

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUser.id } },
  });
  if (existing) return NextResponse.json({ error: 'Cet utilisateur est déjà membre du projet' }, { status: 400 });

  const member = await prisma.projectMember.create({
    data: { projectId, userId: targetUser.id, role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(member);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  if (!(await isAdmin(projectId, userId))) {
    return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
  }

  const { memberId, role } = await req.json();
  if (!['ADMIN', 'MEMBER'].includes(role)) {
    return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
  }

  // Empêcher de rétrograder le dernier ADMIN
  if (role === 'MEMBER') {
    const target = await prisma.projectMember.findUnique({ where: { id: memberId } });
    if (target?.role === 'ADMIN') {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Impossible : le projet doit avoir au moins un Admin' }, { status: 400 });
      }
    }
  }

  const member = await prisma.projectMember.update({
    where: { id: memberId },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  if (!(await isAdmin(projectId, userId))) {
    return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
  }

  const { memberId } = await req.json();

  // Empêcher de supprimer le dernier ADMIN
  const target = await prisma.projectMember.findUnique({ where: { id: memberId } });
  if (target?.role === 'ADMIN') {
    const adminCount = await prisma.projectMember.count({ where: { projectId, role: 'ADMIN' } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Impossible : le projet doit avoir au moins un Admin' }, { status: 400 });
    }
  }

  await prisma.projectMember.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
}

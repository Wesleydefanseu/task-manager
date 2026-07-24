import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return verifyToken(token || '') as { userId: string } | null;
}

async function getMemberRole(projectId: string, userId: string): Promise<string | null> {
  const m = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return m?.role ?? null;
}

// GET /api/automation?projectId=xxx
export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  if (!projectId) return NextResponse.json({ error: 'projectId requis' }, { status: 400 });

  const role = await getMemberRole(projectId, user.userId);
  if (!role) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const rules = await prisma.automationRule.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(rules);
}

// POST /api/automation
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { name, triggerType, triggerValue, actionType, actionValue, projectId } = await req.json();
  if (!name || !triggerType || !actionType || !projectId) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const role = await getMemberRole(projectId, user.userId);
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Seul un Admin peut créer des règles' }, { status: 403 });

  const rule = await prisma.automationRule.create({
    data: { name, triggerType, triggerValue, actionType, actionValue, projectId },
  });

  return NextResponse.json(rule);
}

// PUT /api/automation
export async function PUT(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id, name, triggerType, triggerValue, actionType, actionValue, isActive } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const existing = await prisma.automationRule.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Règle introuvable' }, { status: 404 });

  const role = await getMemberRole(existing.projectId, user.userId);
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const updated = await prisma.automationRule.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(triggerType !== undefined && { triggerType }),
      ...(triggerValue !== undefined && { triggerValue }),
      ...(actionType !== undefined && { actionType }),
      ...(actionValue !== undefined && { actionValue }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/automation?id=xxx
export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const existing = await prisma.automationRule.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Règle introuvable' }, { status: 404 });

  const role = await getMemberRole(existing.projectId, user.userId);
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  await prisma.automationRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}


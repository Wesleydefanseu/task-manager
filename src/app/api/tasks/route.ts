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

const taskInclude = {
  assignees: { include: { user: { select: { id: true, name: true, email: true } } } },
  dependencies: { select: { id: true, title: true } },
};

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  if (!projectId) return NextResponse.json({ error: 'projectId requis' }, { status: 400 });

  const role = await getMemberRole(projectId, user.userId);
  if (!role) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: taskInclude,
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(tasks.map(normalizeTask));
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { title, description, priority, status, projectId, assigneeIds, startDate, dueDate, duration, dependencyIds } = await req.json();
  if (!title || !projectId) return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });

  const role = await getMemberRole(projectId, user.userId);
  if (!role) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const task = await prisma.task.create({
    data: {
      title, description,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      projectId,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      duration: duration ? parseInt(duration) : null,
      assignees: assigneeIds?.length ? { create: assigneeIds.map((id: string) => ({ userId: id })) } : undefined,
      dependencies: dependencyIds?.length ? { connect: dependencyIds.map((id: string) => ({ id })) } : undefined,
    },
    include: taskInclude,
  });
  return NextResponse.json(normalizeTask(task));
}

export async function PUT(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id, status, title, description, priority, assigneeIds, startDate, dueDate, duration, dependencyIds } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 });

  const role = await getMemberRole(task.projectId, user.userId);
  if (!role) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(duration !== undefined && { duration: duration ? parseInt(duration) : null }),
      ...(dependencyIds !== undefined && { dependencies: { set: dependencyIds.map((depId: string) => ({ id: depId })) } }),
      ...(assigneeIds !== undefined && {
        assignees: {
          deleteMany: {},
          create: assigneeIds.map((uid: string) => ({ userId: uid })),
        },
      }),
    },
    include: taskInclude,
  });
  return NextResponse.json(normalizeTask(updated));
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 });

  const role = await getMemberRole(task.projectId, user.userId);
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Seul un Admin peut supprimer des tâches' }, { status: 403 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

function normalizeTask(task: any) {
  return {
    ...task,
    assignees: task.assignees.map((a: any) => a.user),
  };
}

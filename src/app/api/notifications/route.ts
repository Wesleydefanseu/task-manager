import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return verifyToken(token || '') as { userId: string } | null;
}

// GET /api/notifications — Get notifications for current user
export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  const where: any = { userId: user.userId };
  if (unreadOnly) where.isRead = false;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(notifications);
}

// PUT /api/notifications — Mark as read
export async function PUT(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || notif.userId !== user.userId) {
    return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 });
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json(updated);
}

// PUT /api/notifications/read-all — Mark all as read
export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: user.userId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}


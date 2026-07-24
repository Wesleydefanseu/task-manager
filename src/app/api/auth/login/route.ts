import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const cookieOptions = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const token = generateToken({ userId: user.id, email: user.email, name: user.name });
    const response = NextResponse.json({ message: 'Connexion réussie' });

    response.cookies.set('token', token, cookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
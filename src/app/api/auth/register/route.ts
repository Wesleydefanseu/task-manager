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
    const { email, password, name } = await req.json();
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    });

    const token = generateToken({ userId: user.id, email: user.email, name: user.name });
    const response = NextResponse.json({ message: 'Utilisateur créé', userId: user.id });
    response.cookies.set('token', token, cookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { verifyToken } from '@/lib/auth';
import type { AuthUser } from '@/lib/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  let user: AuthUser | null = null;
  if (token) {
    try { user = verifyToken(token) as AuthUser; } catch { user = null; }
  }
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <Navbar user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

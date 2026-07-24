import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: "Task Manager - Projet M1",
  description: "Gestionnaire de tâches Agile",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

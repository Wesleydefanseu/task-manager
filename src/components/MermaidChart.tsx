'use client';
import { useEffect, useRef, useState } from 'react';

export default function MermaidChart({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (!div || !chart.trim()) return;
    setError(null);

    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#d1fae5',
            primaryTextColor: '#064e3b',
            primaryBorderColor: '#10b981',
            lineColor: '#6b7280',
            secondaryColor: '#f0fdf4',
            tertiaryColor: '#fff',
            critBkgColor: '#fee2e2',
            critBorderColor: '#ef4444',
          },
          gantt: { axisFormat: '%d/%m', barHeight: 28, barGap: 6, topPadding: 50, fontSize: 13 },
        });

        if (cancelled) return;

        // Clear previous content safely
        if (div) {
          while (div.firstChild) {
            div.removeChild(div.firstChild);
          }
        }

        const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && div) {
          div.insertAdjacentHTML('beforeend', svg);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Erreur de rendu';
          setError(msg);
          console.error('Mermaid render error:', e);
          if (div) {
            div.innerHTML = `<p class="text-red-500 text-sm p-4">⚠ Erreur de rendu du diagramme.</p>`;
          }
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (!chart.trim()) return null;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 min-h-[180px] flex items-center justify-center"
    >
      {!error && <span className="text-sm text-[var(--muted-light)]">Chargement...</span>}
    </div>
  );
}

'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * Renders a Mermaid diagram.
 *
 * The `mermaid` package is large, so it is imported dynamically inside the
 * effect — it lands in its own chunk and is only fetched by pages that actually
 * contain a diagram.
 */
export function Mermaid({ chart }: { chart: string }) {
  // useId() returns something like «r0», which is not a valid DOM id for the
  // temporary node mermaid.render() mounts while measuring.
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // undefined until next-themes has mounted. Waiting avoids rendering the
    // light diagram first and flipping it to dark a frame later.
    if (!resolvedTheme) return;

    let cancelled = false;

    void (async () => {
      try {
        const { default: mermaid } = await import('mermaid');

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          fontFamily: 'inherit',
        });

        const { svg } = await mermaid.render(`mermaid-${id}`, chart.trim());
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
        <p className="mb-2 text-sm font-medium text-red-600 dark:text-red-400">
          Failed to render diagram: {error}
        </p>
        <pre className="overflow-x-auto text-xs">{chart.trim()}</pre>
      </div>
    );
  }

  return (
    <div
      className="my-6 flex min-h-24 justify-center overflow-x-auto rounded-lg border bg-fd-card p-4 [&>svg]:h-auto [&>svg]:max-w-full"
      // Sanitized by mermaid's own DOMPurify pass (securityLevel: 'strict'),
      // and the source is authored in this repo rather than user input.
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}

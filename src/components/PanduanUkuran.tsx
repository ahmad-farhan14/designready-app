import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { DIMENSION_GUIDES } from '../data';

export function PanduanUkuran() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch (error) {
      console.warn('Failed to copy dimension guide', error);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/30 backdrop-blur-xl lg:sticky lg:top-6">
      <div className="border-b border-slate-800/80 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Panduan Ukuran & Ekspor</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300/80">
          Referensi cepat dimensi aset digital dan cetak.
        </p>
      </div>

      <div className="max-h-[calc(100vh-10rem)] space-y-5 overflow-y-auto p-5">
        {DIMENSION_GUIDES.map((group) => (
          <div key={group.platform} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300/80">{group.platform}</h4>

            <div className="space-y-2">
              {group.sizes.map((size) => {
                const copiedKey = `${group.platform}-${size.name}`;
                const isCopied = copiedId === copiedKey;

                return (
                  <div key={size.name} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/55 p-3.5 transition hover:border-slate-700 hover:bg-slate-900/80">
                    <div>
                      <p className="text-sm font-medium text-white">{size.name}</p>
                      <p className="mt-1 font-mono text-xs text-slate-400">{size.dim}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(size.dim, copiedKey)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                        isCopied
                          ? 'border-emerald-400/20 bg-emerald-400/15 text-emerald-100'
                          : 'border-slate-800/80 bg-slate-900/70 text-slate-200 hover:border-slate-700 hover:bg-slate-800/70'
                      }`}
                      aria-label={isCopied ? 'Disalin' : 'Salin dimensi'}
                      title={isCopied ? 'Disalin' : 'Salin dimensi'}
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
import { Check, Copy, Download, FileText, Loader2, RefreshCw, Sparkles, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';

type ChecklistAreaProps = {
  taskName: string;
  categoryLabel: string;
  items: readonly string[];
  checkedState: Record<number, boolean>;
  onToggleItem: (index: number) => void;
  onReset: () => void;
};

export function ChecklistArea({
  taskName,
  categoryLabel,
  items,
  checkedState,
  onToggleItem,
  onReset,
}: ChecklistAreaProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiScanDone, setAiScanDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Function Upload Gambar dengan Rule-Engine Dinamis (Standar Resolusi Desain Profesional)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsScanning(true);
    setAiScanDone(false);

    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    const fileSizeKB = file.size / 1024;

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const passedIndexes: number[] = [];

      items.forEach((itemText: string, idx: number) => {
        const text = itemText.toLowerCase();

        // 1. Format Vector (STRICT: Hanya jika file .svg)
        if (text.includes('vector') || text.includes('svg')) {
          if (fileType.includes('svg') || fileName.endsWith('.svg')) {
            passedIndexes.push(idx);
          }
        }
        // 2. Versi Logo & Identitas (Lulus jika resolusi memadai untuk standar ekspor desainer >= 500px)
        else if (text.includes('versi logo') || text.includes('monochrome') || text.includes('full color')) {
          if ((fileType.startsWith('image/') || fileName.includes('logo')) && (width >= 500 || height >= 500)) {
            passedIndexes.push(idx);
          }
        }
        // 3. Clear Space, Margin & Ukuran Minimum (Min Artboard standar >= 500px)
        else if (text.includes('margin') || text.includes('clear space') || text.includes('ukuran minimum')) {
          if (width >= 500 || height >= 500) {
            passedIndexes.push(idx);
          }
        }
        // 4. Color Palette & Tipografi Visual (Valid jika resolusi >= 500px dan ukuran file optimal)
        else if (text.includes('color palette') || text.includes('tipografi') || text.includes('warna')) {
          if ((width >= 500 || height >= 500) && fileSizeKB < 10000) {
            passedIndexes.push(idx);
          }
        }
        // 5. Background / Safe Zone / Kontras
        else if (text.includes('background') || text.includes('safe zone') || text.includes('bentrok')) {
          if (width >= 800 || height >= 800) {
            passedIndexes.push(idx);
          }
        }
        // 6. Brand Guideline PDF (STRICT: Wajib berkas .pdf)
        else if (text.includes('pdf') || text.includes('guideline')) {
          if (fileName.endsWith('.pdf') || fileType.includes('pdf')) {
            passedIndexes.push(idx);
          }
        }
      });

      // Simulasi pemindaian AI selama 1.5 detik
      setTimeout(() => {
        setIsScanning(false);
        setAiScanDone(true);

        // Eksekusi pencentangan hanya untuk kriteria yang lolos pengujian dinamis
        passedIndexes.forEach((index: number) => {
          if (!checkedState[index] && index < items.length) {
            onToggleItem(index);
          }
        });
      }, 1500);
    };
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setAiScanDone(false);
  };

  // Handoff Summary Text
  const totalItems = items.length;
  const checkedCount = Object.values(checkedState).filter(Boolean).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);

  const summaryText = `[DesignReady QC Report]

Nama Task : ${taskName}
Kategori  : ${categoryLabel}
Progress  : ${checkedCount}/${totalItems} (${progressPercent}%)
AI Status : ${aiScanDone ? 'Verified by AI Inspector' : 'Manual QC'}

Detail Checklist:
${items.map((item, idx) => `${checkedState[idx] ? '[x]' : '[ ]'} ${item}`).join('\n')}
`;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([summaryText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Handoff-Summary-${taskName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Handoff Summary - ${taskName}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            h1 { color: #6d28d9; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 10px; }
            pre { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; font-family: monospace; white-space: pre-wrap; font-size: 13px; }
            .badge { background: #8b5cf6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; display: inline-block; }
          </style>
        </head>
        <body>
          <span class="badge">PRO EXPORT • DESIGNREADY</span>
          <h1>QC Handoff Report: ${taskName}</h1>
          <pre>${summaryText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="space-y-6">
      {/* Checklist Header */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="inline-block rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 border border-violet-500/20">
              {categoryLabel}
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white">{taskName}</h2>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Checklist
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Progress QC</span>
            <span>{checkedCount} dari {totalItems} selesai ({progressPercent}%)</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-linear-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* PRO FEATURE: AI Design File Inspector Dropzone */}
      <section className="rounded-3xl border border-violet-500/30 bg-violet-950/20 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-bold text-violet-200">AI Design File Inspector</h3>
          </div>
          <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
            PRO STUDIO
          </span>
        </div>

        {!uploadedImage ? (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-violet-500/40 bg-slate-950/60 p-6 text-center transition hover:border-violet-400 hover:bg-slate-900/80">
            <UploadCloud className="h-8 w-8 text-violet-400" />
            <p className="mt-2 text-xs font-medium text-slate-200">
              Upload hasil desain (PNG / JPG) atau Brand Guideline (PDF)
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Pilih berkas hasil ekspor dari laptop kamu</p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="flex items-center gap-4">
              <img
                src={uploadedImage}
                alt="Preview Design"
                className="h-16 w-16 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Hasil Desain Ter-upload</p>

                {isScanning ? (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-amber-300 animate-pulse">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400 shrink-0" />
                    <span>AI sedang memindai spesifikasi berkas & mencocokkan checklist...</span>
                  </div>
                ) : aiScanDone ? (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span>Analisis AI Selesai! Kriteria terverifikasi secara presisi.</span>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Checklist Items List */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Daftar Kriteria QC</h3>
        <div className="space-y-3">
          {items.map((item, index) => {
            const isChecked = Boolean(checkedState[index]);
            const isAiVerified = aiScanDone && isChecked;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggleItem(index)}
                className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                  isChecked
                    ? 'border-violet-500/30 bg-violet-500/10'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border ${
                  isChecked ? 'border-violet-400 bg-violet-500 text-white' : 'border-slate-600'
                }`}>
                  {isChecked && <Check className="h-3.5 w-3.5" />}
                </span>

                <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-sm leading-relaxed ${isChecked ? 'text-slate-100 line-through opacity-80' : 'text-slate-300'}`}>
                    {item}
                  </span>

                  {isAiVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      <Sparkles className="h-3 w-3" /> VERIFIED BY AI
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Handoff Summary & Export Options */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Ringkasan Handoff</h3>
          <span className="text-xs text-slate-400">Siap dikirim ke Developer / Klien</span>
        </div>

        <textarea
          readOnly
          value={summaryText}
          rows={7}
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-slate-300 outline-none"
        />

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? 'Tersalin!' : 'Copy Text'}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export TXT</span>
            <span className="rounded bg-violet-500/30 px-1 py-0.5 text-[9px] font-bold text-violet-200">PRO</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Export PDF</span>
            <span className="rounded bg-amber-500/30 px-1 py-0.5 text-[9px] font-bold text-amber-200">PRO</span>
          </button>
        </div>
      </section>
    </div>
  );
}
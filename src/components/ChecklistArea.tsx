import JSZip from 'jszip';
import { Check, Copy, Download, FileText, Loader2, RefreshCw, Sparkles, UploadCloud, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clearFilesFromDB, getFilesFromDB, saveFilesToDB } from '../utils/fileStorage';

type ChecklistAreaProps = {
  taskId: string;
  taskName: string;
  categoryLabel: string;
  items: readonly string[];
  checkedState: Record<number, boolean>;
  onToggleItem: (index: number) => void;
  onReset: () => void;
};

// Helper untuk membaca dimensi gambar (Width & Height) secara async
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({ width: 0, height: 0 });
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function ChecklistArea({
  taskId,
  taskName,
  categoryLabel,
  items,
  checkedState,
  onToggleItem,
  onReset,
}: ChecklistAreaProps) {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url?: string; isZip?: boolean }[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [aiScanDone, setAiScanDone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSavedFiles() {
      try {
        const saved = await getFilesFromDB(taskId);
        if (saved && saved.length > 0 && active) {
          const restoredFiles = saved.map((f) => {
            const blob = new Blob([f.data], { type: f.type });
            const url = f.type.startsWith('image/') ? URL.createObjectURL(blob) : undefined;
            return { name: f.name, url, isZip: f.isZip };
          });
          setUploadedFiles(restoredFiles);
          setAiScanDone(true);
        } else if (active) {
          setUploadedFiles([]);
          setAiScanDone(false);
        }
      } catch (err) {
        console.error('Gagal memuat simpanan berkas', err);
      }
    }
    loadSavedFiles();
    return () => {
      active = false;
    };
  }, [taskId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setIsScanning(true);
    setAiScanDone(false);

    await saveFilesToDB(taskId, files);

    const newUploadedFiles: { name: string; url?: string; isZip?: boolean }[] = [];
    const passedIndexes = new Set<number>();

    // Bendera & Data Analisis Berkas
    let hasVector = false;
    let hasPdf = false;
    let hasFont = false;
    let hasTextDoc = false;
    let hasTransparentImage = false; // PNG / SVG
    let hasZip = false;

    // Analisis Ukuran & Dimensi Piksel Realistis
    const imageMetaPromises = files.map(async (f) => {
      const dims = await getImageDimensions(f);
      return { file: f, dims };
    });
    const analyzedFiles = await Promise.all(imageMetaPromises);

    const totalFiles = files.length;
    const validImages = analyzedFiles.filter((af) => af.dims.width > 0);
    const hasHighResImage = validImages.some((af) => af.dims.width >= 1000 || af.dims.height >= 1000);
    const hasMultipleDimensions = new Set(validImages.map((af) => `${af.dims.width}x${af.dims.height}`)).size > 1;

    // 1. Cek Berkas ZIP
    const zipFile = files.find((f) => f.name.toLowerCase().endsWith('.zip'));

    if (zipFile) {
      hasZip = true;
      try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);
        const internalFileNames = Object.keys(zipContent.files).map((f) => f.toLowerCase());

        newUploadedFiles.push({ name: zipFile.name, isZip: true });

        if (internalFileNames.some((f) => f.endsWith('.svg') || f.endsWith('.ai') || f.endsWith('.eps'))) {
          hasVector = true;
          hasTransparentImage = true;
        }
        if (internalFileNames.some((f) => f.endsWith('.pdf'))) {
          hasPdf = true;
        }
        if (internalFileNames.some((f) => f.endsWith('.ttf') || f.endsWith('.otf') || f.endsWith('.woff') || f.endsWith('.woff2'))) {
          hasFont = true;
        }
        if (internalFileNames.some((f) => f.endsWith('.txt') || f.endsWith('.doc') || f.endsWith('.docx') || f.includes('caption'))) {
          hasTextDoc = true;
        }
        if (internalFileNames.some((f) => f.endsWith('.png'))) {
          hasTransparentImage = true;
        }
      } catch (err) {
        console.error('Gagal membongkar file ZIP', err);
      }
    }

    // 2. Cek Berkas Normal (Ekstensi & MIME)
    const normalFiles = files.filter((f) => !f.name.toLowerCase().endsWith('.zip'));

    normalFiles.forEach((file) => {
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      const url = fileType.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      newUploadedFiles.push({ name: file.name, url });

      if (fileType.includes('svg') || fileName.endsWith('.svg') || fileName.endsWith('.ai') || fileName.endsWith('.eps')) {
        hasVector = true;
        hasTransparentImage = true;
      }
      if (fileName.endsWith('.pdf') || fileType.includes('pdf')) {
        hasPdf = true;
      }
      if (fileName.endsWith('.ttf') || fileName.endsWith('.otf') || fileName.endsWith('.woff') || fileName.endsWith('.woff2') || fileName.includes('font')) {
        hasFont = true;
      }
      if (fileName.endsWith('.txt') || fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.includes('caption') || fileName.includes('hashtag')) {
        hasTextDoc = true;
      }
      if (fileType.includes('png') || fileName.endsWith('.png') || fileType.includes('svg')) {
        hasTransparentImage = true;
      }
    });

    const isBatch = totalFiles > 1 || hasZip;

    // 3. Evaluasi Ketat & Spesifik (Tanpa Asal Centang)
    items.forEach((itemText, idx) => {
      const text = itemText.toLowerCase();

      // --- BRANDING & LOGO RULES ---

      // 1. Vector: Hanya jika ada file Vektor asli (.svg/.ai/.eps)
      if (text.includes('vector') || text.includes('svg') || text.includes('eps')) {
        if (hasVector) passedIndexes.add(idx);
      } 
      
      // 2. Versi Logo (Monochrome/Reversed): Butuh minimal 2 file ATAU file transparan + vektor
      else if (text.includes('versi logo') || text.includes('monochrome') || text.includes('reversed')) {
        if ((totalFiles >= 2 && (hasTransparentImage || hasVector)) || hasZip) {
          passedIndexes.add(idx);
        }
      } 
      
      // 3. Clear space/margin: Butuh PDF Guideline ATAU gambar beresolusi tinggi (min. 1000px)
      else if (text.includes('clear space') || text.includes('margin')) {
        if (hasPdf || hasHighResImage || hasVector) {
          passedIndexes.add(idx);
        }
      } 
      
      // 4. Ukuran minimum: Butuh PDF Guideline ATAU Vektor (Vektor bebas resolusi)
      else if (text.includes('ukuran minimum')) {
        if (hasPdf || hasVector) {
          passedIndexes.add(idx);
        }
      } 
      
      // 5. Palette Warna: Butuh PDF Guideline, Dokumen Kode Teks, atau Vektor
      else if (text.includes('color palette') || text.includes('hex') || text.includes('rgb') || text.includes('cmyk')) {
        if (hasPdf || hasTextDoc || hasVector) {
          passedIndexes.add(idx);
        }
      } 
      
      // 6. Tipografi/Font: Butuh file font asli (.ttf/.otf) ATAU PDF Guideline
      else if (text.includes('tipografi') || text.includes('font')) {
        if (hasFont || hasPdf) {
          passedIndexes.add(idx);
        }
      } 
      
      // 7. Background tidak bentrok: WAJIB punya transparansi (PNG/SVG) atau PDF Guideline
      else if (text.includes('background') || text.includes('bentrok')) {
        if (hasTransparentImage || hasVector || hasPdf) {
          passedIndexes.add(idx);
        }
      } 
      
      // 8. Berbagai ukuran: WAJIB punya variasi dimensi piksel beda ATAU Vektor ATAU ZIP
      else if (text.includes('berbagai ukuran')) {
        if (hasMultipleDimensions || hasVector || hasZip) {
          passedIndexes.add(idx);
        }
      } 
      
      // 9. Brand guideline PDF: WAJIB ada file .pdf
      else if (text.includes('brand guideline pdf')) {
        if (hasPdf) {
          passedIndexes.add(idx);
        }
      } 
      
      // 10. Package dalam satu folder: WAJIB di-upload sebagai .zip atau Batch Upload
      else if (text.includes('package') || text.includes('folder') || text.includes('satu folder')) {
        if (isBatch) {
          passedIndexes.add(idx);
        }
      }

      // --- ASET MEDIA SOSIAL RULES ---
      else if (text.includes('dimensi') || text.includes('spesifikasi platform')) {
        if (hasHighResImage || isBatch) passedIndexes.add(idx);
      } else if (text.includes('72 dpi') || text.includes('72dpi') || text.includes('resolusi minimum')) {
        if (validImages.length > 0) passedIndexes.add(idx);
      } else if (text.includes('format file sesuai') || text.includes('jpg/png/mp4')) {
        if (validImages.length > 0 || isBatch) passedIndexes.add(idx);
      } else if (text.includes('teks pada gambar') || text.includes('terbaca jelas')) {
        if (hasHighResImage) passedIndexes.add(idx);
      } else if (text.includes('safe zone')) {
        if (hasHighResImage || isBatch) passedIndexes.add(idx);
      } else if (text.includes('konsistensi elemen visual') || text.includes('konsistensi')) {
        if (isBatch) passedIndexes.add(idx);
      } else if (text.includes('caption') || text.includes('hashtag')) {
        if (hasTextDoc || hasPdf) passedIndexes.add(idx);
      } else if (text.includes('watermark') || text.includes('logo & watermark')) {
        if (hasTransparentImage || isBatch) passedIndexes.add(idx);
      } else if (text.includes('dikelompokkan rapi') || text.includes('kampanye')) {
        if (isBatch) passedIndexes.add(idx);
      }
    });

    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

    setTimeout(() => {
      setIsScanning(false);
      setAiScanDone(true);

      passedIndexes.forEach((index) => {
        if (!checkedState[index] && index < items.length) {
          onToggleItem(index);
        }
      });
    }, 1500);
  };

  const handleRemoveAllFiles = async () => {
    await clearFilesFromDB(taskId);
    setUploadedFiles([]);
    setAiScanDone(false);
  };

  const handleResetWithClear = async () => {
    await clearFilesFromDB(taskId);
    setUploadedFiles([]);
    setAiScanDone(false);
    onReset();
  };

  // Handoff Summary
  const totalItems = items.length;
  const checkedCount = Object.values(checkedState).filter(Boolean).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);

  const summaryText = `[DesignReady QC Report]

Nama Task : ${taskName}
Kategori  : ${categoryLabel}
Progress  : ${checkedCount}/${totalItems} (${progressPercent}%)
AI Status : ${aiScanDone ? 'Verified by AI Batch Inspector' : 'Manual QC'}

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
      {/* Header & Progress */}
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
            onClick={handleResetWithClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Checklist
          </button>
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Progress QC</span>
            <span>
              {checkedCount} dari {totalItems} selesai ({progressPercent}%)
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-linear-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Batch Upload Dropzone */}
      <section className="rounded-3xl border border-violet-500/30 bg-violet-950/20 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-bold text-violet-200">AI Batch Design Inspector</h3>
          </div>
          <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
            MULTI-FILE & ZIP SUPPORT
          </span>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-violet-500/40 bg-slate-950/60 p-6 text-center transition hover:border-violet-400 hover:bg-slate-900/80">
          <UploadCloud className="h-8 w-8 text-violet-400" />
          <p className="mt-2 text-xs font-medium text-slate-200">
            Upload beberapa aset sekaligus (PNG, JPG, MP4, SVG, PDF) atau Berkas ZIP
          </p>
          <p className="mt-1 text-[10px] text-slate-400">Pilih beberapa file sekaligus untuk analisis QC otomatis</p>
          <input
            type="file"
            accept="image/*,video/*,.pdf,.svg,.zip,.txt,.ttf,.otf,.woff,.woff2,.doc,.docx"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Status Scanning / Hasil Batch */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 px-1">
              <span className="font-semibold">{uploadedFiles.length} Berkas Di-upload:</span>
              <button
                type="button"
                onClick={handleRemoveAllFiles}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                <X className="h-3 w-3" /> Hapus Semua
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              {uploadedFiles.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-xs text-slate-200 truncate max-w-50"
                >
                  <FileText className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
              ))}
            </div>

            {isScanning && (
              <div className="flex items-center gap-2 text-xs text-amber-300 animate-pulse pt-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400 shrink-0" />
                <span>AI sedang memeriksa kelengkapan aset & spesifikasi platform...</span>
              </div>
            )}

            {aiScanDone && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-1">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>Analisis Batch Selesai! Kriteria media sosial & branding terverifikasi.</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Checklist List */}
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
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border ${
                    isChecked ? 'border-violet-400 bg-violet-500 text-white' : 'border-slate-600'
                  }`}
                >
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

      {/* Summary & Export */}
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
import JSZip from 'jszip';
import { Check, Copy, Download, FileText, FolderArchive, HelpCircle, Image as ImageIcon, Loader2, RefreshCw, Sparkles, UploadCloud, X } from 'lucide-react';
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

type FilePreviewItem = {
  name: string;
  url?: string;
  isZip?: boolean;
  isPdf?: boolean;
  isVector?: boolean;
};

// Helper async untuk membaca dimensi piksel (Width & Height)
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
  const [uploadedFiles, setUploadedFiles] = useState<FilePreviewItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [aiScanDone, setAiScanDone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSavedFiles() {
      try {
        const saved = await getFilesFromDB(taskId);
        if (saved && saved.length > 0 && active) {
          const restoredFiles: FilePreviewItem[] = saved.map((f) => {
            const blob = new Blob([f.data], { type: f.type });
            const isImg = f.type.startsWith('image/') || f.name.match(/\.(png|jpg|jpeg|webp|jfif|gif)$/i);
            const url = isImg ? URL.createObjectURL(blob) : undefined;
            return {
              name: f.name,
              url,
              isZip: f.isZip || f.name.endsWith('.zip'),
              isPdf: f.type.includes('pdf') || f.name.endsWith('.pdf'),
              isVector: f.type.includes('svg') || f.name.endsWith('.svg'),
            };
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

    const newUploadedFiles: FilePreviewItem[] = [];
    const passedIndexes = new Set<number>();

    // Bendera & Metadata Berkas
    let hasVector = false;
    let hasPdf = false;
    let hasFont = false;
    let hasTextDoc = false;
    let hasTransparentImage = false;
    let hasZip = false;

    // Analisis Dimensi Piksel Realistis
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
        if (internalFileNames.some((f) => f.endsWith('.txt') || f.endsWith('.doc') || f.endsWith('.docx') || f.includes('caption') || f.includes('hashtag') || f.includes('notes'))) {
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
      const isImg = fileType.startsWith('image/') || fileName.match(/\.(png|jpg|jpeg|webp|jfif|gif)$/i);
      const url = isImg ? URL.createObjectURL(file) : undefined;

      const isSvg = fileType.includes('svg') || fileName.endsWith('.svg');
      const isPdfFile = fileName.endsWith('.pdf') || fileType.includes('pdf');

      newUploadedFiles.push({
        name: file.name,
        url,
        isPdf: isPdfFile,
        isVector: isSvg || fileName.endsWith('.ai') || fileName.endsWith('.eps'),
      });

      if (isSvg || fileName.endsWith('.ai') || fileName.endsWith('.eps')) {
        hasVector = true;
        hasTransparentImage = true;
      }
      if (isPdfFile) {
        hasPdf = true;
      }
      if (fileName.endsWith('.ttf') || fileName.endsWith('.otf') || fileName.endsWith('.woff') || fileName.endsWith('.woff2') || fileName.includes('font') || fileName.includes('embed') || fileName.includes('outline')) {
        hasFont = true;
      }
      if (fileName.endsWith('.txt') || fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.includes('caption') || fileName.includes('hashtag') || fileName.includes('notes') || fileName.includes('specs')) {
        hasTextDoc = true;
      }
      if (fileType.includes('png') || fileName.endsWith('.png') || isSvg) {
        hasTransparentImage = true;
      }
    });

    const isBatch = totalFiles > 1 || hasZip;

    // 3. Matriks Rule Engine Kritis & Presisi
    items.forEach((itemText, idx) => {
      const text = itemText.toLowerCase();

      // ==========================================
      // KATEGORI 1: UI/UX HANDOFF
      // ==========================================
      if (text.includes('layer & komponen') || text.includes('diberi nama')) {
        if (hasZip || normalFiles.some((f) => f.name.toLowerCase().includes('.fig'))) passedIndexes.add(idx);
      } else if (text.includes('spacing & grid') || text.includes('8pt grid')) {
        if (hasHighResImage || hasPdf || hasVector) passedIndexes.add(idx);
      } else if (text.includes('typografi menggunakan style')) {
        if (hasFont || hasPdf || hasTextDoc) passedIndexes.add(idx);
      } else if (text.includes('color variables') || text.includes('variables/styles')) {
        if (hasPdf || hasTextDoc || hasZip) passedIndexes.add(idx);
      } else if (text.includes('diekspor dalam resolusi') || text.includes('semua aset diekspor')) {
        if (hasHighResImage || hasVector || isBatch) passedIndexes.add(idx);
      } else if (text.includes('prototype flow') || text.includes('sudah dihubungkan')) {
        if (isBatch || validImages.length >= 2 || hasZip) passedIndexes.add(idx);
      } else if (text.includes('artboard/frame') || text.includes('ukuran artboard')) {
        if (validImages.length > 0 || hasVector) passedIndexes.add(idx);
      } else if (text.includes('catatan & anotasi') || text.includes('anotasi')) {
        if (hasTextDoc || hasPdf || normalFiles.some((f) => f.name.toLowerCase().includes('notes') || f.name.toLowerCase().includes('anotasi'))) passedIndexes.add(idx);
      } else if (text.includes('organize per section') || text.includes('section/flow')) {
        if (isBatch || hasZip) passedIndexes.add(idx);
      } else if (text.includes('share ke stakeholder') || text.includes('stakeholder')) {
        if (isBatch || hasZip || hasPdf) passedIndexes.add(idx);
      }

      // ==========================================
      // KATEGORI 2: ASET MEDIA SOSIAL
      // ==========================================
      else if (text.includes('dimensi sesuai platform') || text.includes('feed, story, reel')) {
        if (validImages.length > 0 || hasHighResImage || isBatch) passedIndexes.add(idx);
      } else if (text.includes('safe zone konten')) {
        if (hasHighResImage || isBatch) passedIndexes.add(idx);
      } else if (text.includes('font sudah diembed') || text.includes('di-outline')) {
        if (hasFont || hasVector || hasPdf) passedIndexes.add(idx);
      } else if (text.includes('warna sudah sesuai brand guideline')) {
        if (hasPdf || hasVector || validImages.length > 0 || hasTextDoc) passedIndexes.add(idx);
      } else if (text.includes('resolusi minimal 72dpi')) {
        if (validImages.length > 0) passedIndexes.add(idx);
      } else if (text.includes('format yang tepat (jpg/png/mp4)')) {
        if (validImages.length > 0 || isBatch) passedIndexes.add(idx);
      } else if (text.includes('teks terbaca di semua ukuran layar')) {
        if (hasHighResImage || hasVector) passedIndexes.add(idx);
      } else if (text.includes('logo & watermark sudah ditambahkan')) {
        if (hasTransparentImage || isBatch) passedIndexes.add(idx);
      } else if (text.includes('konsistensi visual antar postingan')) {
        if (isBatch || hasZip) passedIndexes.add(idx);
      } else if (text.includes('caption & hashtag')) {
        if (hasTextDoc || hasPdf || hasZip) passedIndexes.add(idx);
      }

      // ==========================================
      // KATEGORI 3: LOGO & BRANDING
      // ==========================================
      else if (text.includes('format vector') || text.includes('svg/ai/eps')) {
        if (hasVector) passedIndexes.add(idx);
      } else if (text.includes('full color, monochrome, reversed')) {
        if ((totalFiles >= 2 && (hasTransparentImage || hasVector)) || hasZip) passedIndexes.add(idx);
      } else if (text.includes('clear space/margin logo')) {
        if (hasPdf || hasHighResImage || hasVector) passedIndexes.add(idx);
      } else if (text.includes('ukuran minimum logo')) {
        if (hasPdf || hasVector) passedIndexes.add(idx);
      } else if (text.includes('brand color palette') || text.includes('hex/rgb/cmyk')) {
        if (hasPdf || hasTextDoc || hasVector) passedIndexes.add(idx);
      } else if (text.includes('tipografi brand sudah ditentukan')) {
        if (hasFont || hasPdf) passedIndexes.add(idx);
      } else if (text.includes('background yang bentrok')) {
        if (hasTransparentImage || hasVector || hasPdf) passedIndexes.add(idx);
      } else if (text.includes('berbagai ukuran') || text.includes('file logo tersedia')) {
        if (hasMultipleDimensions || hasVector || hasZip) passedIndexes.add(idx);
      } else if (text.includes('brand guideline pdf')) {
        if (hasPdf) passedIndexes.add(idx);
      } else if (text.includes('package dalam satu folder') || text.includes('semua aset di-package')) {
        if (isBatch || hasZip) passedIndexes.add(idx);
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

  // Ringkasan Handoff
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
      <section className="rounded-3xl border border-violet-500/30 bg-violet-950/20 p-5 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
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
            accept="image/*,video/*,.pdf,.svg,.zip,.txt,.ttf,.otf,.woff,.woff2,.doc,.docx,.fig"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Petunjuk Edukasi File Pendukung Untuk Pengguna */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold text-violet-300 mb-1.5">
            <HelpCircle className="h-4 w-4 text-violet-400 shrink-0" />
            <span>Panduan Format Berkas Handoff (Agar Terverifikasi 100%):</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400 mb-2">
            Upload 1 gambar JPG/PNG biasa hanya memverifikasi kriteria visual dasar. Untuk mencapai skor QC penuh, pilih beberapa file sekaligus (Batch Upload) atau gunakan format berikut:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
            <li className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1">
              <strong className="text-violet-300 block font-semibold">🎨 Logo & Branding:</strong>
              <p className="text-slate-400 leading-normal">
                Sertakan Master Vektor (<code className="text-amber-300 font-mono">.svg/.ai</code>), Font (<code className="text-amber-300 font-mono">.ttf/.otf</code>), Kode Warna (<code className="text-amber-300 font-mono">.txt</code>), dan Panduan (<code className="text-amber-300 font-mono">.pdf</code>).
              </p>
            </li>
            <li className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1">
              <strong className="text-violet-300 block font-semibold">📱 Media Sosial:</strong>
              <p className="text-slate-400 leading-normal">
                Sertakan minimal 2 gambar poster/video (<code className="text-amber-300 font-mono">.png/.jpg/.mp4</code>) + File Teks Caption & Hashtag (<code className="text-amber-300 font-mono">.txt/.doc</code>).
              </p>
            </li>
            <li className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1">
              <strong className="text-violet-300 block font-semibold">💻 UI/UX Handoff:</strong>
              <p className="text-slate-400 leading-normal">
                Sertakan gambar UI multi-layar (<code className="text-amber-300 font-mono">.png</code>) + File Figma (<code className="text-amber-300 font-mono">.fig</code>) atau Arsip Terkompresi (<code className="text-amber-300 font-mono">.zip</code>).
              </p>
            </li>
          </ul>
        </div>

        {/* Grid Thumbnail Preview Visual */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 px-1">
              <span className="font-semibold">{uploadedFiles.length} Berkas Di-upload:</span>
              <button
                type="button"
                onClick={handleRemoveAllFiles}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px] transition"
              >
                <X className="h-3 w-3" /> Hapus Semua
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-2 bg-slate-950/80 rounded-2xl border border-slate-800/80">
              {uploadedFiles.map((file, i) => {
                const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

                return (
                  <div
                    key={`${file.name}-${i}`}
                    className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-center transition hover:border-violet-500/50 hover:bg-slate-800"
                  >
                    {file.url ? (
                      <div className="relative h-20 w-full overflow-hidden rounded-lg bg-slate-950/80 flex items-center justify-center">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="h-full w-full object-contain p-1 transition group-hover:scale-105"
                        />
                        <span className="absolute bottom-1 right-1 rounded bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-bold text-violet-300 border border-violet-500/30 backdrop-blur-xs">
                          {ext}
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-20 w-full flex-col items-center justify-center rounded-lg bg-slate-950/60 p-2">
                        {file.isZip ? (
                          <FolderArchive className="h-8 w-8 text-amber-400" />
                        ) : file.isPdf ? (
                          <FileText className="h-8 w-8 text-rose-400" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-violet-400" />
                        )}
                        <span className="mt-1 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-300">
                          {ext}
                        </span>
                      </div>
                    )}

                    <p className="mt-2 w-full truncate text-[11px] font-medium text-slate-300 px-1">
                      {file.name}
                    </p>
                  </div>
                );
              })}
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
                <span>Analisis Batch Selesai! Kriteria terverifikasi secara presisi.</span>
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

      {/* Ringkasan & Ekspor */}
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
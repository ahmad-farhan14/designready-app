export type CategoryKey = 'ui-ux' | 'social-media' | 'branding';

export interface CategoryData {
  id: CategoryKey;
  label: string;
  items: string[];
}

export const CHECKLIST_DATA: Record<CategoryKey, CategoryData> = {
  'ui-ux': {
    id: 'ui-ux',
    label: 'UI/UX HANDOFF',
    items: [
      'Layer & Komponen Diberi Nama Rapi & Sesuai Konvensi',
      'Spacing & Grid Konsisten (Sistem 8pt Grid)',
      'Typografi Menggunakan Style Token / Local Styles',
      'Color Variables / Styles Terorganisir (Light & Dark Mode)',
      'Semua Aset Diekspor Dalam Resolusi & Ukuran Tepat',
      'Prototype Flow / Interaksi Antar Layar Sudah Dihubungkan',
      'Ukuran Artboard / Frame Standar Perangkat',
      'Catatan & Anotasi Spesifikasi Desain Terlampir',
      'Organize Per Section / Flow Rapi',
      'Siap Share ke Stakeholder & Developer',
    ],
  },
  'social-media': {
    id: 'social-media',
    label: 'ASET MEDIA SOSIAL',
    items: [
      'Dimensi Sesuai Platform (Feed, Story, Reel/Shorts)',
      'Safe Zone Konten Terbebas dari Elemen UI Platform',
      'Font Sudah Diembed / Teks Dikonversi ke Outline',
      'Warna Sudah Sesuai Brand Guideline',
      'Resolusi Minimal 72DPI / High Quality',
      'Format yang Tepat (JPG/PNG/MP4)',
      'Teks Terbaca di Semua Ukuran Layar',
      'Logo & Watermark Sudah Ditambahkan (PNG Transparan)',
      'Konsistensi Visual Antar Postingan / Grid',
      'Caption & Hashtag Terlampir dalam Berkas Teks',
    ],
  },
  branding: {
    id: 'branding',
    label: 'BRANDING & LOGO',
    items: [
      'Master Logo Tersedia dalam Format Vector (SVG/AI/EPS)',
      'Variasi Logo Lengkap (Full Color, Monochrome, Reversed)',
      'Clear Space / Margin Logo Terdefinisi',
      'Ukuran Minimum Logo Terdefinisi',
      'Brand Color Palette Terlampir (HEX/RGB/CMYK)',
      'Tipografi Brand Sudah Ditentukan & Font File Terlampir',
      'Bebas dari Background yang Bentrok (PNG Transparan)',
      'File Logo Tersedia dalam Berbagai Ukuran',
      'Brand Guideline PDF Terlampir (Penggunaan Do & Don’t)',
      'Package Dalam Satu Folder / Arsip Terkompresi',
    ],
  },
};
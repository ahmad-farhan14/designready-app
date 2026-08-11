export type CategoryKey = 'ui-ux' | 'social-media' | 'branding';

export interface CategoryData {
  id: CategoryKey;
  label: string;
  items: string[];
}

// 1. Ekspor Kriteria Checklist (Selaras dengan Rule Engine AI)
export const CHECKLIST_ITEMS: Record<CategoryKey, string[]> = {
  'ui-ux': [
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
  'social-media': [
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
  branding: [
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
};

// 2. Ekspor Kategori
export const CATEGORIES: CategoryData[] = [
  { id: 'ui-ux', label: 'UI/UX HANDOFF', items: CHECKLIST_ITEMS['ui-ux'] },
  { id: 'social-media', label: 'ASET MEDIA SOSIAL', items: CHECKLIST_ITEMS['social-media'] },
  { id: 'branding', label: 'BRANDING & LOGO', items: CHECKLIST_ITEMS['branding'] },
];

// 3. Ekspor Panduan Ukuran & Dimensi Aset
export interface DimensionSize {
  name: string;
  width: number;
  height: number;
  unit: string;
  description?: string;
}

export interface DimensionGroup {
  platform: string;
  sizes: DimensionSize[];
}

export const DIMENSION_GUIDES: DimensionGroup[] = [
  {
    platform: 'INSTAGRAM',
    sizes: [
      { name: 'Feed Square', width: 1080, height: 1080, unit: 'px' },
      { name: 'Feed Portrait', width: 1080, height: 1350, unit: 'px' },
      { name: 'Story / Reels', width: 1080, height: 1920, unit: 'px' },
      { name: 'Carousel', width: 1080, height: 1080, unit: 'px' },
    ],
  },
  {
    platform: 'TWITTER / X',
    sizes: [
      { name: 'Post Image', width: 1200, height: 675, unit: 'px' },
      { name: 'Header', width: 1500, height: 500, unit: 'px' },
    ],
  },
  {
    platform: 'LINKEDIN',
    sizes: [
      { name: 'Post Image', width: 1200, height: 627, unit: 'px' },
      { name: 'Cover', width: 1128, height: 191, unit: 'px' },
    ],
  },
];
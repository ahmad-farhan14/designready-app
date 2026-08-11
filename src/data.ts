import type { CategoryKey } from './types';

export interface CategoryData {
  key: CategoryKey;
  label: string;
  items: string[];
}

const uiUxItems = [
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
];

const socialItems = [
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
];

const brandingItems = [
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
];

export const CHECKLIST_ITEMS: Record<CategoryKey, string[]> = {
  'ui-ux': uiUxItems,
  social: socialItems,
  branding: brandingItems,
};

export const CATEGORIES: CategoryData[] = [
  { key: 'ui-ux', label: 'UI/UX HANDOFF', items: uiUxItems },
  { key: 'social', label: 'ASET MEDIA SOSIAL', items: socialItems },
  { key: 'branding', label: 'BRANDING & LOGO', items: brandingItems },
];

export interface DimensionSize {
  name: string;
  width: number;
  height: number;
  dim: string;
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
      { name: 'Feed Square', width: 1080, height: 1080, dim: '1080 × 1080 px', unit: 'px' },
      { name: 'Feed Portrait', width: 1080, height: 1350, dim: '1080 × 1350 px', unit: 'px' },
      { name: 'Story / Reels', width: 1080, height: 1920, dim: '1080 × 1920 px', unit: 'px' },
      { name: 'Carousel', width: 1080, height: 1080, dim: '1080 × 1080 px', unit: 'px' },
    ],
  },
  {
    platform: 'TWITTER / X',
    sizes: [
      { name: 'Post Image', width: 1200, height: 675, dim: '1200 × 675 px', unit: 'px' },
      { name: 'Header', width: 1500, height: 500, dim: '1500 × 500 px', unit: 'px' },
    ],
  },
  {
    platform: 'LINKEDIN',
    sizes: [
      { name: 'Post Image', width: 1200, height: 627, dim: '1200 × 627 px', unit: 'px' },
      { name: 'Cover', width: 1128, height: 191, dim: '1128 × 191 px', unit: 'px' },
    ],
  },
];
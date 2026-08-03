import type { CategoryKey } from './types';

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'ui-ux', label: 'UI/UX Handoff' },
  { key: 'social', label: 'Aset Media Sosial' },
  { key: 'branding', label: 'Branding & Logo' },
];

export type { CategoryKey };

export const CHECKLIST_ITEMS: Record<CategoryKey, string[]> = {
  'ui-ux': [
    'Semua layer & komponen diberi nama dengan benar',
    'Spacing & grid konsisten (8pt grid)',
    'Typografi menggunakan style yang terdefinisi',
    'Warna menggunakan color variables/styles',
    'Semua aset diekspor dalam resolusi yang benar',
    'Prototype flow sudah dihubungkan',
    'Ukuran artboard/frame sesuai standar',
    'Catatan & anotasi sudah ditambahkan',
    'File di-organize per section/flow',
    'File sudah di-share ke stakeholder yang tepat'
  ],
  'social': [
    'Dimensi sesuai platform (Feed, Story, Reel)',
    'Safe zone konten sudah diperhatikan',
    'Font sudah diembed atau di-outline',
    'Warna sudah sesuai brand guideline',
    'Resolusi minimal 72dpi untuk digital',
    'File disimpan dalam format yang tepat (JPG/PNG/MP4)',
    'Teks terbaca di semua ukuran layar',
    'Logo & watermark sudah ditambahkan jika diperlukan',
    'Konsistensi visual antar postingan terjaga',
    'Caption & hashtag sudah disiapkan'
  ],
  'branding': [
    'Logo tersedia dalam format vector (SVG/AI/EPS)',
    'Versi logo: full color, monochrome, reversed',
    'Clear space/margin logo sudah didefinisikan',
    'Ukuran minimum logo sudah ditentukan',
    'Brand color palette sudah terdokumentasi (HEX/RGB/CMYK)',
    'Tipografi brand sudah ditentukan & terdokumentasi',
    'Logo tidak digunakan di atas background yang bentrok',
    'File logo tersedia dalam berbagai ukuran',
    'Brand guideline PDF sudah disiapkan',
    'Semua aset di-package dalam satu folder'
  ]
};

export const DIMENSION_GUIDES = [
  {
    platform: 'Instagram',
    sizes: [
      { name: 'Feed Square', dim: '1080 × 1080 px' },
      { name: 'Feed Portrait', dim: '1080 × 1350 px' },
      { name: 'Story / Reels', dim: '1080 × 1920 px' },
      { name: 'Carousel', dim: '1080 × 1080 px' },
    ]
  },
  {
    platform: 'Twitter / X',
    sizes: [
      { name: 'Post Image', dim: '1200 × 675 px' },
      { name: 'Header', dim: '1500 × 500 px' },
    ]
  },
  {
    platform: 'LinkedIn',
    sizes: [
      { name: 'Post Image', dim: '1200 × 627 px' },
      { name: 'Cover', dim: '1584 × 396 px' },
    ]
  },
  {
    platform: 'Design Tools',
    sizes: [
      { name: 'Figma Frame (Desktop)', dim: '1920 × 1080 px' },
      { name: 'Figma Frame (Mobile)', dim: '390 × 844 px' },
      { name: 'Thumbnail', dim: '1280 × 720 px' },
    ]
  },
];

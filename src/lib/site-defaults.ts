import type { SiteConfig, Taxonomy, TitleType } from './api/types';

/** Same defaults as backend/api/lib.php — used before /api/config answers and in mock mode. */
export const defaultTaxonomy: Taxonomy = {
  movie: {
    origins: ['مصري', 'عربي', 'خليجي', 'أجنبي', 'ياباني', 'كوري', 'هندي', 'تركي'],
    genres: ['أكشن', 'دراما', 'كوميديا', 'خيال علمي', 'رعب', 'إثارة', 'جريمة', 'رومانسي', 'مغامرات', 'غموض', 'فانتازيا', 'تاريخي', 'حرب', 'عائلي', 'رسوم متحركة', 'وثائقي', 'موسيقي', 'سيرة ذاتية'],
  },
  series: {
    origins: ['مصري', 'خليجي', 'عربي', 'أجنبي', 'تركي', 'كوري', 'ياباني', 'هندي'],
    genres: ['دراما', 'كوميديا', 'أكشن', 'إثارة', 'جريمة', 'رومانسي', 'اجتماعي', 'تاريخي', 'غموض', 'خيال علمي', 'رعب', 'فانتازيا', 'عائلي', 'وثائقي'],
  },
  kids: {
    origins: ['عربي', 'مدبلج بالعربي', 'أجنبي', 'ياباني (أنمي)'],
    genres: ['مغامرات', 'كوميديا', 'تعليمي', 'أنمي', 'خيال', 'عائلي', 'موسيقي', 'رياضي', 'أبطال خارقون'],
  },
  program: {
    origins: ['مصري', 'عربي', 'خليجي', 'أجنبي'],
    genres: ['حواري', 'وثائقي', 'واقعي', 'مسابقات', 'رياضة', 'طبخ', 'ديني', 'منوعات', 'كوميدي', 'أخبار'],
  },
};

export const defaultConfig: SiteConfig = {
  siteName: 'Mamatvbox',
  features: { accounts: false, pricing: false },
  home: {
    platformsCount: 6,
    top10: { enabled: true, title: 'الأعلى مشاهدة — أفضل ١٠ أعمال' },
    ramadan: { enabled: false, title: 'مسلسلات رمضان', subtitle: 'كل مسلسلات الموسم الرمضاني وأين تشاهدها قانونياً' },
    mostWatched: { enabled: true },
  },
  social: [],
  taxonomy: defaultTaxonomy,
};

/** Each section of the site: page URL + labels used in the navbar, home rows and catalog pages. */
export const sections: { type: TitleType; href: string; label: string; plural: string; all: string; popular: string }[] = [
  { type: 'movie', href: '/movies', label: 'أفلام', plural: 'الأفلام', all: 'كل الأفلام', popular: 'الأفلام الأكثر مشاهدة' },
  { type: 'series', href: '/series', label: 'مسلسلات', plural: 'المسلسلات', all: 'كل المسلسلات', popular: 'المسلسلات الأكثر مشاهدة' },
  { type: 'program', href: '/programs', label: 'برامج', plural: 'البرامج', all: 'كل البرامج', popular: 'البرامج الأكثر مشاهدة' },
  { type: 'kids', href: '/kids', label: 'كرتون', plural: 'الكرتون', all: 'كل الكرتون', popular: 'الكرتون الأكثر مشاهدة' },
];
export const sectionOf = (type: TitleType) => sections.find((s) => s.type === type)!;

/**
 * Genre names differ between sources (TMDB Arabic, imports in English, the dashboard list).
 * Each group counts as one genre when filtering.
 */
const genreGroups: string[][] = [
  ['أكشن', 'حركة', 'اكشن', 'action'],
  ['مغامرات', 'مغامرة', 'adventure'],
  ['رومانسي', 'رومانسية', 'رومانسى', 'romance'],
  ['تاريخي', 'تاريخ', 'تاريخى', 'history'],
  ['موسيقي', 'موسيقى', 'music', 'musical'],
  ['كوميديا', 'كوميدي', 'كوميدى', 'comedy'],
  ['دراما', 'drama'],
  ['خيال علمي', 'خيال علمى', 'science fiction', 'sci-fi', 'sci-fi & fantasy'],
  ['فانتازيا', 'خيال', 'fantasy'],
  ['رعب', 'horror'],
  ['إثارة', 'اثارة', 'تشويق', 'thriller'],
  ['جريمة', 'crime'],
  ['غموض', 'mystery'],
  ['حرب', 'war', 'war & politics'],
  ['عائلي', 'عائلى', 'family'],
  ['رسوم متحركة', 'animation'],
  ['وثائقي', 'وثائقى', 'documentary'],
  ['أنمي', 'انمي', 'anime'],
  ['حواري', 'talk'],
  ['واقعي', 'تلفزيون الواقع', 'reality'],
  ['أخبار', 'news'],
  ['أطفال', 'kids'],
];
const norm = (s: string) => s.trim().toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
const groupIndex = new Map<string, number>();
genreGroups.forEach((g, i) => g.forEach((name) => groupIndex.set(norm(name), i)));
const genreKey = (s: string) => { const n = norm(s); const i = groupIndex.get(n); return i === undefined ? n : `#${i}`; };

export function hasGenre(titleGenres: string[], genre: string): boolean {
  const k = genreKey(genre);
  return titleGenres.some((g) => genreKey(g) === k);
}

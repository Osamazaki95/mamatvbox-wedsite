import type {
  AdminKpi, AppNotification, Country, Invoice, Person, Plan,
  Platform, ReferralShare, Title, UserProfile,
} from '../api/types';

export const platforms: Platform[] = [
  { id: 'shahid', name: 'Shahid VIP', nameAr: 'شاهد VIP', tagline: 'الصالون الترفيهي الأول عربياً', color: '#4FE3D0', priceMonthly: 89, currency: 'ج.م', maxQuality: '4K UHD', hdr: 'HDR10', audio: 'Dolby Digital 5.1', screens: 3, offline: true, trialDays: 7, catalogSize: 4890 },
  { id: 'watchit', name: 'Watch It', nameAr: 'ووتش إت', tagline: 'الأرشيف المصري والدراما الحية', color: '#FBBF24', priceMonthly: 65, currency: 'ج.م', maxQuality: '1080p FHD', hdr: null, audio: 'Stereo 2.0', screens: 2, offline: true, trialDays: 0, catalogSize: 3120 },
  { id: 'netflix', name: 'Netflix', nameAr: 'نتفليكس', tagline: 'إنتاجات عالمية وأصلية', color: '#F87171', priceMonthly: 120, currency: 'ج.م', maxQuality: '4K UHD', hdr: 'Dolby Vision', audio: 'Dolby Atmos', screens: 4, offline: true, trialDays: 0, catalogSize: 6200 },
  { id: 'osn', name: '+OSN', nameAr: 'أو إس إن بلس', tagline: 'موطن HBO الحصري', color: '#C4B5FD', priceMonthly: 99, currency: 'ج.م', maxQuality: '4K UHD', hdr: 'Dolby Vision', audio: 'Dolby Atmos', screens: 4, offline: true, trialDays: 7, catalogSize: 2400 },
  { id: 'prime', name: 'Prime Video', nameAr: 'أمازون برايم', tagline: 'سينما هوليوود وأفلام عالمية', color: '#60A5FA', priceMonthly: 29, currency: 'ج.م', maxQuality: '4K UHD', hdr: 'HDR10+', audio: 'Dolby Atmos', screens: 3, offline: true, trialDays: 30, catalogSize: 5100 },
  { id: 'yango', name: 'Yango Play', nameAr: 'يانغو بلاي', tagline: 'باقة السينما والموسيقى', color: '#4FE3D0', priceMonthly: 49, currency: 'ج.م', maxQuality: '4K UHD', hdr: null, audio: 'Stereo 2.0', screens: 2, offline: false, trialDays: 30, catalogSize: 1800 },
  { id: 'appletv', name: '+Apple TV', nameAr: 'أبل تي في بلس', tagline: 'جودة سينمائية فائقة', color: '#E5E7EB', priceMonthly: 149, currency: 'ج.م', maxQuality: '4K HDR', hdr: 'Dolby Vision', audio: 'Dolby Atmos', screens: 6, offline: true, trialDays: 7, catalogSize: 240 },
  { id: 'starzplay', name: 'STARZPLAY', nameAr: 'ستارزبلاي', tagline: 'رياضة، سينما ومسلسلات', color: '#FBBF24', priceMonthly: 65, currency: 'ج.م', maxQuality: '4K UHD', hdr: 'HDR10', audio: '5.1 Surround', screens: 4, offline: true, trialDays: 7, catalogSize: 2900 },
  { id: 'youtube', name: 'YouTube Movies', nameAr: 'يوتيوب أفلام', tagline: 'شراء وتأجير بدون اشتراك', color: '#F87171', priceMonthly: 0, currency: 'ج.م', maxQuality: '4K UHD', hdr: null, audio: 'Stereo 2.0', screens: 1, offline: false, trialDays: 0, catalogSize: 9000 },
];

const t = (x: Partial<Title> & Pick<Title, 'id' | 'slug' | 'title'>): Title => ({
  type: 'movie', year: 2024, genres: ['دراما'], rating: 8.0, runtime: 'ساعتان',
  quality: '4K UHD', platforms: ['shahid'], inPlan: true, download: true,
  tint: '#1f2937', overview: '', director: '', cast: [], ...x,
});

export const titles: Title[] = [
  t({ id: '1', slug: 'kira-wa-el-gin', title: 'كيرة والجن', originalTitle: 'Kira & El Gin', year: 2022, genres: ['تاريخي', 'ملحمي', 'أكشن'], rating: 8.6, runtime: 'ساعتان و٥٥ دقيقة', quality: '4K UHD', platforms: ['shahid', 'watchit'], tint: '#7c4a1e', director: 'مروان حامد', cast: ['كريم عبد العزيز', 'أحمد عز', 'هند صبري'], overview: 'يرصد الفيلم حقبة تاريخية مصرية في تاريخ مصر إبان ثورة ١٩١٩ حيث يلتقي مصير الطبيب المثقف أحمد كيرة بالثائر الفدائي عبدالقادر الجن لتشكيل خلايا شعبية تلقن ضربات نوعية للاستعمار.' }),
  t({ id: '2', slug: 'oppenheimer', title: 'أوبنهايمر', originalTitle: 'Oppenheimer', year: 2023, genres: ['سيرة ذاتية', 'دراما', 'تاريخ'], rating: 8.9, runtime: '٣ ساعات', quality: 'IMAX 4K', platforms: ['prime', 'osn'], inPlan: false, tint: '#9a3412', poster: '/posters/oppenheimer.png', director: 'كريستوفر نولان', cast: ['كيليان ميرفي', 'إيميلي بلانت', 'مات ديمون'], overview: 'الملحمة السينمائية التي توثق حياة الفيزيائي الأمريكي روبرت أوبنهايمر ودوره المحوري في إدارة مشروع مانهاتن السري لتطوير أول سلاح نووي في تاريخ البشرية.' }),
  t({ id: '3', slug: 'el-hashashin', title: 'الحشاشين', originalTitle: 'The Assassins', type: 'series', year: 2024, genres: ['دراما تاريخية', 'إثارة'], rating: 9.2, runtime: '30 حلقة', quality: '4K UHD', platforms: ['shahid', 'watchit'], tint: '#134e4a', director: 'بيتر ميمي', cast: ['كريم عبد العزيز', 'فتحي عبد الوهاب'], overview: 'رحلة حسن الصباح في القرن الحادي عشر وتأسيس جماعة الفدائيين في قلعة ألموت، وكيف فرضت الجماعة نفوذها عبر الاغتيالات.' }),
  t({ id: '4', slug: 'dune-part-two', title: 'Dune: Part Two', year: 2024, genres: ['خيال علمي', 'مغامرة'], rating: 8.7, runtime: 'ساعتان و٤٦ دقيقة', quality: '4K HDR', platforms: ['osn', 'appletv'], inPlan: true, tint: '#b45309', director: 'دينيس فيلنوف', cast: ['تيموثي شالاميه', 'زندايا'], overview: 'يتحد بول أتريدس مع تشاني والفريمن في رحلة انتقام ضد المتآمرين الذين دمروا عائلته.' }),
  t({ id: '5', slug: 'mawdoo-aeli', title: 'موضوع عائلي', type: 'series', year: 2024, genres: ['كوميديا عائلية'], rating: 9.1, runtime: '10 حلقات', quality: '1080p FHD', platforms: ['shahid'], tint: '#0f766e', director: 'أحمد الجندي', cast: ['ماجد الكدواني', 'رنا رئيس', 'طه دسوقي'], overview: 'يعود «إبراهيم» في مغامرة عائلية جديدة مع بنته وزوجها وسط مواقف كوميدية وإنسانية دافئة.' }),
  t({ id: '6', slug: 'beit-el-roubi', title: 'بيت الروبي', year: 2023, genres: ['كوميديا', 'اجتماعي'], rating: 7.8, runtime: 'ساعتان', quality: '1080p FHD', platforms: ['watchit', 'netflix'], tint: '#0369a1', director: 'بيتر ميمي', cast: ['كريم عبد العزيز', 'كريم محمود عبد العزيز'], overview: 'يقرر إبراهيم الروبي العودة إلى القاهرة بعد سنوات من العزلة لتنقلب حياة عائلته رأساً على عقب.' }),
  t({ id: '7', slug: 'el-feel-el-azraq-2', title: 'الفيل الأزرق ٢', year: 2019, genres: ['إثارة', 'غموض'], rating: 8.1, runtime: 'ساعتان و١٠ دقائق', quality: '4K UHD', platforms: ['shahid', 'netflix'], tint: '#1e3a8a', expiresInDays: 5, director: 'مروان حامد', cast: ['كريم عبد العزيز', 'هند صبري'], overview: 'يعود الدكتور يحيى لمواجهة حالة جديدة في عنبر الخطرين تقوده إلى قلب لعنة قديمة.' }),
  t({ id: '8', slug: 'welad-rizk-3', title: 'ولاد رزق ٣', year: 2024, genres: ['أكشن', 'جريمة'], rating: 7.6, runtime: 'ساعتان', quality: '4K UHD', platforms: ['watchit'], tint: '#78350f', expiresInDays: 7, director: 'طارق العريان', cast: ['أحمد عز', 'عمرو يوسف'], overview: 'بعد عهد التوبة، يعود الأشقاء لمهمة دولية تخلط الأوراق في الرياض.' }),
  t({ id: '9', slug: 'interstellar', title: 'Interstellar', year: 2014, genres: ['خيال علمي', 'دراما'], rating: 8.7, runtime: 'ساعتان و٤٩ دقيقة', quality: '4K UHD', platforms: ['netflix', 'prime'], tint: '#1e293b', director: 'كريستوفر نولان', cast: ['ماثيو ماكونهي', 'آن هاثاواي'], overview: 'رحلة ملحمية تخوضها مجموعة من المستكشفين عبر ثقب دودي لإنقاذ البشرية.' }),
  t({ id: '10', slug: 'the-batman', title: 'The Batman', year: 2022, genres: ['جريمة', 'نوار'], rating: 8.1, runtime: 'ساعتان و٥٦ دقيقة', quality: '4K HDR', platforms: ['osn'], tint: '#450a0a', director: 'مات ريفز', cast: ['روبرت باتينسون'], overview: 'في عامه الثاني كحارس لمدينة جوثام، يطارد باتمان قاتلاً متسلسلاً يستهدف النخبة.' }),
  t({ id: '11', slug: 'el-harifa', title: 'الحريفة', year: 2024, genres: ['رياضي', 'شبابي'], rating: 8.1, runtime: 'ساعتان', quality: '4K UHD', platforms: ['shahid'], tint: '#14532d', director: 'رؤوف السيد', cast: ['نور النبوي', 'أحمد غزي'], overview: 'طالب ينتقل إلى مدرسة حكومية ويبني فريق كرة شوارع يغير حياته.' }),
  t({ id: '12', slug: 'yehia-wa-kenooz', title: 'يحيى وكنوز', type: 'kids', year: 2024, genres: ['مغامرات', 'تعليمي'], rating: 9.4, runtime: '26 حلقة', quality: '4K UHD', platforms: ['watchit'], tint: '#92400e', director: 'استوديو مصري', cast: [], overview: 'مغامرة تاريخية كرتونية تتبع يحيى وشقيقته كنوز في رحلة عبر العصور المصرية القديمة.' }),
  t({ id: '13', slug: 'captain-majid', title: 'كابتن ماجد', type: 'kids', year: 2019, genres: ['رياضي', 'أنمي'], rating: 8.6, runtime: '52 حلقة', quality: '1080p FHD', platforms: ['osn', 'shahid'], tint: '#1d4ed8', director: '', cast: [], overview: 'أحلام الملاعب وروح الفريق مع ماجد ورفاقه.' }),
  t({ id: '14', slug: 'grand-magical', title: 'مسلسل صلة رحم', type: 'series', year: 2024, genres: ['دراما'], rating: 8.4, runtime: '30 حلقة', quality: '4K UHD', platforms: ['shahid'], tint: '#374151', director: 'تامر نادي', cast: ['إياد نصار'], overview: 'طبيب يدخل في أزمة أخلاقية بسبب تأجير الأرحام.' }),
];

export const people: Person[] = [
  { id: 'p1', slug: 'karim-abdelaziz', name: 'كريم عبد العزيز', role: 'ممثل ومخرج مصري • 48 سنة • القاهرة', bio: 'أحد أبرز نجوم السينما والدراما التلفزيونية في العالم العربي، صاحب أعلى إيرادات شباك التذاكر في تاريخ السينما المصرية بسلسلة أعمال فارقة مثل «كيرة والجن»، «الفيل الأزرق»، ومسلسل «الحشاشين».', titles: ['1', '3', '6', '7'] },
  { id: 'p2', slug: 'ahmed-ezz', name: 'أحمد عز', role: 'ممثل مصري', bio: 'نجم أكشن ودراما مصري.', titles: ['1', '8'] },
];

export const countries: Country[] = [
  { code: 'EG', name: 'مصر', official: 'جمهورية مصر العربية', flag: '🇪🇬', currency: 'EGP', currencyName: 'الجنيه المصري' },
  { code: 'SA', name: 'السعودية', official: 'المملكة العربية السعودية', flag: '🇸🇦', currency: 'SAR', currencyName: 'الريال السعودي' },
  { code: 'AE', name: 'الإمارات', official: 'الإمارات العربية المتحدة', flag: '🇦🇪', currency: 'AED', currencyName: 'الدرهم الإماراتي' },
  { code: 'KW', name: 'الكويت', official: 'دولة الكويت', flag: '🇰🇼', currency: 'KWD', currencyName: 'الدينار الكويتي' },
  { code: 'QA', name: 'قطر', official: 'دولة قطر', flag: '🇶🇦', currency: 'QAR', currencyName: 'الريال القطري' },
  { code: 'BH', name: 'البحرين', official: 'مملكة البحرين', flag: '🇧🇭', currency: 'BHD', currencyName: 'الدينار البحريني' },
  { code: 'OM', name: 'عُمان', official: 'سلطنة عمان', flag: '🇴🇲', currency: 'OMR', currencyName: 'الريال العماني' },
  { code: 'JO', name: 'الأردن', official: 'المملكة الأردنية الهاشمية', flag: '🇯🇴', currency: 'JOD', currencyName: 'الدينار الأردني' },
  { code: 'LB', name: 'لبنان', official: 'الجمهورية اللبنانية', flag: '🇱🇧', currency: 'USD', currencyName: 'الدولار الأمريكي' },
  { code: 'MA', name: 'المغرب', official: 'المملكة المغربية', flag: '🇲🇦', currency: 'MAD', currencyName: 'الدرهم المغربي' },
  { code: 'TN', name: 'تونس', official: 'الجمهورية التونسية', flag: '🇹🇳', currency: 'TND', currencyName: 'الدينار التونسي' },
  { code: 'XX', name: 'دول أخرى', official: 'دليل عام عالمي', flag: '🌐', currency: 'USD', currencyName: 'الدولار الأمريكي' },
];

export const plans: Plan[] = [
  { id: 'free', name: 'حساب الزائر', badge: 'Free', monthly: 0, yearly: 0, features: [
    { label: 'البحث في كافة الأفلام والمسلسلات العربية والعالمية', included: true },
    { label: 'معرفة منصات البث المتاحة للأعمال المطلوبة', included: true },
    { label: 'تنبيهات فورية عند إضافة أو سحب ترخيص العناوين', included: false },
    { label: 'كشف تفاصيل الجودة الدقيقة (4K, HDR, Dolby Atmos)', included: false },
  ] },
  { id: 'gold', name: 'العضوية الذهبية', badge: 'Cinema Member', monthly: 49, yearly: 468, highlight: true, features: [
    { label: 'كاشف جودة 4K وتقنيات HDR والصوت المحيطي لكل فيلم', included: true },
    { label: 'تفعيل ميزة «في باقتك» لـ ٩ منصات', included: true },
    { label: 'تنبيهات حصرية بقرب انتهاء التراخيص «هيتشال قريب»', included: true },
    { label: 'روابط التنزيل المباشر الرسمي للمشاهدة بدون اتصال', included: true },
  ] },
  { id: 'family', name: 'عضوية العائلة و VIP', badge: 'Cinephile VIP', monthly: 79, yearly: 790, features: [
    { label: 'يدعم حتى ٦ أفراد بحسابات وتفضيلات مستقلة', included: true },
    { label: 'تنبيهات فورية مخصصة عبر SMS وواتساب', included: true },
    { label: 'رصد إقليمي غير محدود لأكثر من ٤٠ دولة', included: true },
    { label: 'دعم سينمائي فوري مخصص ٢٤/٧', included: true },
  ] },
];

export const invoices: Invoice[] = [
  { id: 'INV-2024-00918', date: '١٢ أكتوبر ٢٠٢٤', description: 'بدء التجربة المجانية — العضوية الذهبية', method: 'VISA •••• ٤٥٧١', amount: 0, status: 'free' },
  { id: 'INV-2024-00842', date: '١٥ أغسطس ٢٠٢٤', description: 'اشتراك تجريبي سابق', method: 'Fawry (7882)', amount: 0, status: 'paid' },
  { id: 'INV-2024-00619', date: '٠١ مارس ٢٠٢٤', description: 'بطاقة إهداء سينمائية', method: 'Meeza', amount: 150, status: 'paid' },
  { id: 'INV-2024-00104', date: '١٠ يناير ٢٠٢٤', description: 'تجربة فاشلة (عملية مصرفية ملغاة)', method: 'Mastercard •••• 1182', amount: 0, status: 'failed' },
];

export const notifications: AppNotification[] = [
  { id: 'n1', kind: 'expiring', title: 'فيلم "وقفة رجالة" سينتهي ترخيصه ويُحذف من منصة شاهد VIP خلال ٥ أيام', body: 'السبب: انتهاء اتفاقية حقوق التوزيع الحصري لمنطقة شمال أفريقيا.', time: 'منذ ساعتين', read: false, titleSlug: 'kira-wa-el-gin' },
  { id: 'n2', kind: 'quality', title: 'تم تحديث فيلم "كيرة والجن" على منصة Watch It بنسخة 4K UHD وصوت محيطي Dolby Atmos', body: 'شاشتك المسجلة تدعم البث الفائق (LG OLED 4K).', time: 'منذ ٥ ساعات', read: false, titleSlug: 'kira-wa-el-gin' },
  { id: 'n3', kind: 'new', title: 'مسلسل "موضوع عائلي – الموسم الثالث" أصبح متاحاً الآن بالكامل على شاهد VIP', body: 'يتضمن 10 حلقات جديدة متاحة للتنزيل بدون إنترنت.', time: 'أمس ٨:٠٠ م', read: false, titleSlug: 'mawdoo-aeli' },
  { id: 'n4', kind: 'billing', title: 'تجديد اشتراك باقة شاهد VIP القياسية مستحق خلال ٣ أيام (٨٩ ج.م)', body: 'ساعات المشاهدة في الـ 30 يوماً الماضية: ١٤ ساعة فقط.', time: 'أمس', read: false },
  { id: 'n5', kind: 'available', title: 'فيلم "Dune: Part Two" أصبح متاحاً رسمياً الآن في مصر عبر منصة +OSN', body: 'بجودة 4K IMAX Enhanced مع ترجمة عربية معتمدة.', time: 'منذ يومين', read: true, titleSlug: 'dune-part-two' },
  { id: 'n6', kind: 'available', title: 'فيلم "Oppenheimer" أصبح متاحاً للتأجير الرقمي على Prime Video في السعودية والإمارات', body: 'ملاحظة جغرافية: غير متاح في مصر حالياً.', time: 'منذ ٤ أيام', read: true, titleSlug: 'oppenheimer' },
];

export const currentUser: UserProfile = {
  id: 'u1', name: 'أحمد السعيد', email: 'ahmed.cinema@example.com', phone: '+20 100 123 4567',
  country: 'EG', memberSince: 'نوفمبر ٢٠٢٣', plan: 'gold', trialEndsAt: '٢٦ أكتوبر ٢٠٢٥',
  platforms: ['shahid', 'watchit', 'prime'], watchlist: ['1', '3', '4', '5', '7', '9'],
};

export const adminKpis: AdminKpi[] = [
  { label: 'الإيراد الشهري (MRR)', value: '٤٨٢,٥٠٠ ج.م', delta: '+١٤.٢٪ عن الشهر السابق', trend: 'up' },
  { label: 'الأعضاء النشطون', value: '١٤,٢٨٠', delta: '+٨٥٠ هذا الأسبوع', trend: 'up' },
  { label: 'التجارب المجانية', value: '٣,١٥٠', delta: '٧٢٪ تنتهي خلال ٥ أيام', trend: 'up' },
  { label: 'معدل التحويل لمدفوع', value: '٦٨.٤٪', delta: '+٣.١٪ فوق المستهدف', trend: 'up' },
  { label: 'معدل الإلغاء (Churn)', value: '٢.١٪', delta: '-٠.٤٪ انخفاض إيجابي', trend: 'down' },
  { label: 'نقرات الإحالة للمنصات', value: '٩٢,٤٠٠', delta: '+٢٢٪ عائد إحالة متوقع', trend: 'up' },
];

export const referrals: ReferralShare[] = [
  { platform: 'Shahid VIP (شاهد)', clicks: 31416, share: 34, color: '#4FE3D0' },
  { platform: 'Watch It (واتش إت)', clicks: 24024, share: 26, color: '#FBBF24' },
  { platform: '+OSN', clicks: 16632, share: 18, color: '#C4B5FD' },
  { platform: 'Netflix (نتفليكس)', clicks: 11088, share: 12, color: '#2DD4BF' },
  { platform: 'Prime Video', clicks: 5544, share: 6, color: '#FDE68A' },
  { platform: 'Yango Play & منصات أخرى', clicks: 3696, share: 4, color: '#4B5563' },
];

export const trendingSearches = ['#الحشاشين', '#بيت_الروبي', '#Stranger_Things_5', '#ولاد_رزق_3', '#Shogun'];

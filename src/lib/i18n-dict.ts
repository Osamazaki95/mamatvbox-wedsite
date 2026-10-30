/**
 * Manual translations. One line per phrase:  Arabic | English | Français | Español | 中文 | Português
 * {n} = any number (e.g. "{n} ج.م" matches "٤٦٨ ج.م").
 * Add or fix lines freely — the site picks them up on the next build.
 */
const RAW = `
الرئيسية|Home|Accueil|Inicio|首页|Início
أفلام|Movies|Films|Películas|电影|Filmes
مسلسلات|Series|Séries|Series|剧集|Séries
برامج|Shows|Émissions|Programas|节目|Programas
كرتون|Cartoons|Dessins animés|Dibujos animados|动画|Desenhos
المنصات|Platforms|Plateformes|Plataformas|平台|Plataformas
باقاتي|Plans|Offres|Planes|套餐|Planos
قائمتي|My list|Ma liste|Mi lista|我的片单|Minha lista
تنبيهاتي|My alerts|Mes alertes|Mis alertas|我的提醒|Meus alertas
حسابي|My account|Mon compte|Mi cuenta|我的账户|Minha conta
التنبيهات|Alerts|Alertes|Alertas|提醒|Alertas
القائمة|Menu|Menu|Menú|菜单|Menu
إغلاق|Close|Fermer|Cerrar|关闭|Fechar
بحث|Search|Rechercher|Buscar|搜索|Buscar
ابحث عن فيلم، مسلسل، منصة...|Search a movie, series, platform...|Rechercher un film, une série, une plateforme...|Busca una película, serie o plataforma...|搜索电影、剧集、平台...|Busque um filme, série ou plataforma...
ابحث عن فيلم، مسلسل، ممثل، أو منصة...|Search a movie, series, actor or platform...|Rechercher un film, une série, un acteur ou une plateforme...|Busca una película, serie, actor o plataforma...|搜索电影、剧集、演员或平台...|Busque um filme, série, ator ou plataforma...
تسجيل الدخول|Sign in|Se connecter|Iniciar sesión|登录|Entrar
شاهد الآن|Watch now|Regarder|Ver ahora|立即观看|Assistir agora
تسجيل الخروج|Sign out|Se déconnecter|Cerrar sesión|退出登录|Sair
منصة توجيه وبحث قانونية وموثوقة|A legal and trusted search & guide platform|Une plateforme de recherche légale et fiable|Una plataforma de búsqueda legal y confiable|合法可信的搜索与导览平台|Uma plataforma de busca legal e confiável
المنصات المرخصة المدعومة|Supported licensed platforms|Plateformes sous licence prises en charge|Plataformas con licencia compatibles|支持的正版平台|Plataformas licenciadas suportadas
سياسة الخصوصية|Privacy policy|Politique de confidentialité|Política de privacidad|隐私政策|Política de privacidade
الشروط والأحكام|Terms & conditions|Conditions générales|Términos y condiciones|条款与条件|Termos e condições
إضافة منصة جديدة|Suggest a platform|Proposer une plateforme|Sugerir una plataforma|推荐平台|Sugerir plataforma
تنبيهات التوفر|Availability alerts|Alertes de disponibilité|Alertas de disponibilidad|上线提醒|Alertas de disponibilidade
حقوق الملكية الفكرية|Intellectual property|Propriété intellectuelle|Propiedad intelectual|知识产权|Propriedade intelectual
تواصل معنا|Contact us|Contact|Contáctanos|联系我们|Fale conosco
محرك البحث والتوجيه السينمائي الأول عربياً|The #1 Arabic streaming guide|Le premier guide streaming arabe|La guía de streaming árabe n.º 1|阿拉伯地区第一流媒体指南|O guia de streaming árabe nº 1
اعرف|Find out|Découvrez|Descubre|了解|Descubra
فين|where|où|dónde|在哪里|onde
تتفرج|to watch|regarder|ver|观看|assistir
على|on|sur|en|在|em
أي|any|n'importe quel|cualquier|任何|qualquer
فيلم|movie|film|película|电影|filme
أو|or|ou|o|或|ou
مسلسل...|series...|série...|serie...|剧集...|série...
قانونياً وبأعلى جودة|legally, in the best quality|légalement, en meilleure qualité|legalmente y con la mejor calidad|合法且高画质|legalmente e com a melhor qualidade
ابحث الآن|Search now|Rechercher|Buscar ahora|立即搜索|Buscar agora
بحث سريع:|Quick search:|Recherche rapide :|Búsqueda rápida:|快速搜索：|Busca rápida:
أفلام عربي|Arabic movies|Films arabes|Películas árabes|阿拉伯电影|Filmes árabes
كوميدي|Comedy|Comédie|Comedia|喜剧|Comédia
عمل سينمائي وتلفزيوني|movies & TV titles|films et séries|películas y series|部影视作品|filmes e séries
منصات رسمية مرخصة|licensed official platforms|plateformes officielles|plataformas oficiales|个正版平台|plataformas oficiais
توجيه قانوني بدون قرصنة|legal, piracy-free guidance|orientation légale sans piratage|guía legal sin piratería|合法无盗版|guia legal sem pirataria
زمن الاستجابة ومقارنة الأسعار|response & price comparison time|temps de réponse et comparaison|tiempo de respuesta y comparación|响应与比价时间|tempo de resposta e comparação
خطوة بخطوة|Step by step|Étape par étape|Paso a paso|逐步了解|Passo a passo
كيف تعمل المنصة في ٣ خطوات بسيطة|How it works in 3 simple steps|Comment ça marche en 3 étapes|Cómo funciona en 3 pasos|三步了解使用方法|Como funciona em 3 passos
رحلة سينمائية ذكية تبدأ من البحث وتنتهي بالمشاهدة بضغطة واحدة.|A smart journey from search to watching in one click.|Un parcours intelligent de la recherche au visionnage en un clic.|Un recorrido inteligente de la búsqueda a la reproducción en un clic.|从搜索到观看，一键完成。|Uma jornada inteligente da busca à exibição em um clique.
ابحث عن عملك المفضل|Search your favorite title|Cherchez votre titre préféré|Busca tu título favorito|搜索你喜欢的作品|Busque seu título favorito
قارن المنصات وجودة البث|Compare platforms & quality|Comparez plateformes et qualité|Compara plataformas y calidad|比较平台与画质|Compare plataformas e qualidade
انقر وشاهد مباشرة|Click and watch|Cliquez et regardez|Haz clic y mira|点击即可观看|Clique e assista
منصات البث القانونية في مصر والشرق الأوسط|Legal streaming platforms in Egypt & the Middle East|Plateformes légales en Égypte et au Moyen-Orient|Plataformas legales en Egipto y Oriente Medio|埃及及中东正版流媒体平台|Plataformas legais no Egito e no Oriente Médio
شركاء المحتوى والمنصات المرخصة|Content partners & licensed platforms|Partenaires et plateformes sous licence|Socios y plataformas con licencia|内容合作伙伴与正版平台|Parceiros e plataformas licenciadas
من|from|dès|desde|起|a partir de
ج.م/شهرياً|EGP/month|EGP/mois|EGP/mes|埃镑/月|EGP/mês
{n} ج.م|EGP {n}|{n} EGP|{n} EGP|{n} 埃镑|EGP {n}
ج.م|EGP|EGP|EGP|埃镑|EGP
ج.م / شهرياً|EGP / month|EGP / mois|EGP / mes|埃镑 / 月|EGP / mês
/ شهرياً|/ month|/ mois|/ mes|/ 月|/ mês
شراء وتأجير|Buy & rent|Achat et location|Compra y alquiler|购买与租赁|Compra e aluguel
مجاني / حسب العمل|Free / per title|Gratuit / selon le titre|Gratis / según el título|免费 / 按作品|Grátis / por título
بحث تفاعلي مباشر|Live search|Recherche en direct|Búsqueda en vivo|实时搜索|Busca ao vivo
أين تشاهد «|Where to watch «|Où regarder «|Dónde ver «|在哪里观看「|Onde assistir «
» الآن؟|» now?|» maintenant ?|» ahora?|」？|» agora?
المنصات الرسمية المتاح عليها العمل.|Official platforms carrying this title.|Plateformes officielles proposant ce titre.|Plataformas oficiales con este título.|提供该作品的正版平台。|Plataformas oficiais com este título.
شاهد على|Watch on|Regarder sur|Ver en|观看平台|Assistir em
الأكثر مشاهدة اليوم في مصر|Most watched today in Egypt|Les plus regardés aujourd'hui en Égypte|Lo más visto hoy en Egipto|今日埃及热门|Mais assistidos hoje no Egito
عضوية Mamatvbox Premium|Mamatvbox Premium membership|Abonnement Mamatvbox Premium|Membresía Mamatvbox Premium|Mamatvbox 高级会员|Assinatura Mamatvbox Premium
تحكم كامل في ميزانية ترفيهك وتنبيهات فورية عند وصول أعمالك المرتقبة|Full control of your entertainment budget, with instant alerts when awaited titles arrive|Maîtrisez votre budget et recevez une alerte dès l'arrivée de vos titres attendus|Controla tu presupuesto y recibe alertas cuando lleguen tus títulos|掌控娱乐预算，期待的作品上线即时提醒|Controle seu orçamento e receba alertas quando seus títulos chegarem
تنبيهات فورية للهاتف|Instant phone alerts|Alertes instantanées|Alertas instantáneas|手机即时提醒|Alertas instantâneos
مزامنة باقات غير محدودة|Unlimited plan sync|Synchronisation illimitée|Sincronización ilimitada|无限套餐同步|Sincronização ilimitada
تتبع مواعيد انتهاء الحقوق|Track licence expiry dates|Suivi des fins de licence|Seguimiento de fin de licencias|追踪版权到期|Acompanhe o fim das licenças
تصفح بدون إعلانات|Ad-free browsing|Navigation sans pub|Navegación sin anuncios|无广告浏览|Navegação sem anúncios
تجربة مجانية كاملة|Full free trial|Essai gratuit complet|Prueba gratuita completa|完整免费试用|Teste grátis completo
مجاناً|Free|Gratuit|Gratis|免费|Grátis
ابدأ التجربة المجانية الآن|Start free trial|Commencer l'essai gratuit|Empieza la prueba gratis|开始免费试用|Começar teste grátis
إلغاء في أي وقت|Cancel anytime|Annulation à tout moment|Cancela cuando quieras|随时取消|Cancele quando quiser
لديك سؤال؟|Have a question?|Une question ?|¿Tienes preguntas?|有疑问？|Tem alguma dúvida?
الأسئلة الشائعة|FAQ|FAQ|Preguntas frecuentes|常见问题|Perguntas frequentes
هل تقوم المنصة بتشغيل أو بث الأفلام والمسلسلات مباشرة؟|Does the site stream movies and series itself?|Le site diffuse-t-il lui-même les films ?|¿El sitio transmite las películas directamente?|本站会直接播放影视内容吗？|O site transmite os filmes diretamente?
كيف تعمل ميزة «في باقتك» المخصصة؟|How does “In your plan” work?|Comment fonctionne « Dans votre offre » ?|¿Cómo funciona “En tu plan”?|“已含在套餐”如何运作？|Como funciona “No seu plano”?
هل الروابط والتوجيهات آمنة ورسمية بنسبة 100%؟|Are the links 100% safe and official?|Les liens sont-ils 100 % sûrs et officiels ?|¿Los enlaces son 100% seguros y oficiales?|链接是否100%安全正版？|Os links são 100% seguros e oficiais?
هل تدعم المنصة تتبع العروض بدقة 4K وتقنيات الصوت Dolby؟|Do you track 4K and Dolby audio availability?|Suivez-vous la 4K et le son Dolby ?|¿Rastreáis 4K y sonido Dolby?|是否追踪 4K 与杜比音效？|Vocês acompanham 4K e áudio Dolby?
وفّر وقت البحث وتنقّل بين أفضل الأعمال الترفيهية بدون أي مجهود|Save search time and browse the best entertainment effortlessly|Gagnez du temps et parcourez le meilleur du divertissement|Ahorra tiempo y explora lo mejor del entretenimiento|节省搜索时间，轻松浏览精彩内容|Economize tempo e explore o melhor do entretenimento
ابدأ تجربتك المجانية|Start your free trial|Commencez votre essai gratuit|Empieza tu prueba gratis|开始免费试用|Comece seu teste grátis
استكشف مكتبة الأعمال|Explore the library|Explorer la bibliothèque|Explorar la biblioteca|浏览片库|Explorar a biblioteca
دليل وأرشيف الأفلام القانونية|Legal movies guide|Guide des films légaux|Guía de películas legales|正版电影指南|Guia de filmes legais
أرشيف السينما القانونية المرخصة|Licensed legal cinema archive|Archive de cinéma légal|Archivo de cine legal|正版电影资料库|Acervo de cinema legal
{n} فيلماً نشطاً|{n} active movies|{n} films actifs|{n} películas activas|{n} 部电影|{n} filmes ativos
دليل المسلسلات والدراما|Series & drama guide|Guide des séries|Guía de series|剧集指南|Guia de séries
مكتبة الدراما المرخصة|Licensed drama library|Bibliothèque de séries|Biblioteca de series|正版剧集库|Biblioteca de séries
{n} مسلسلاً نشطاً|{n} active series|{n} séries actives|{n} series activas|{n} 部剧集|{n} séries ativas
البرامج والوثائقيات|Shows & documentaries|Émissions et documentaires|Programas y documentales|节目与纪录片|Programas e documentários
برامج مرخصة|Licensed shows|Émissions sous licence|Programas con licencia|正版节目|Programas licenciados
{n} برنامجاً|{n} shows|{n} émissions|{n} programas|{n} 个节目|{n} programas
عالم الأطفال والكرتون|Kids & cartoons|Enfants et dessins animés|Niños y dibujos|少儿与动画|Infantil e desenhos
مكتبة الأطفال|Kids library|Bibliothèque enfants|Biblioteca infantil|少儿片库|Biblioteca infantil
الكل|All|Tout|Todo|全部|Tudo
أكشن|Action|Action|Acción|动作|Ação
دراما|Drama|Drame|Drama|剧情|Drama
كوميديا|Comedy|Comédie|Comedia|喜剧|Comédia
خيال علمي|Sci-fi|Science-fiction|Ciencia ficción|科幻|Ficção científica
رعب|Horror|Horreur|Terror|恐怖|Terror
وثائقي|Documentary|Documentaire|Documental|纪录片|Documentário
تاريخي|Historical|Historique|Histórico|历史|Histórico
إثارة|Thriller|Thriller|Suspenso|惊悚|Suspense
جريمة|Crime|Policier|Crimen|犯罪|Crime
حواري|Talk show|Talk-show|Entrevistas|访谈|Talk show
رياضة|Sports|Sport|Deportes|体育|Esportes
رياضي|Sports|Sport|Deportes|体育|Esportes
مسابقات|Game shows|Jeux|Concursos|竞赛|Competições
مغامرات|Adventure|Aventure|Aventura|冒险|Aventura
تعليمي|Educational|Éducatif|Educativo|教育|Educativo
أنمي|Anime|Anime|Anime|动漫|Anime
رومانسي|Romance|Romance|Romance|爱情|Romance
عائلي|Family|Famille|Familiar|家庭|Família
المتاح الآن في نطاقك الجغرافي|Available now in your region|Disponible dans votre région|Disponible en tu región|你所在地区可看|Disponível na sua região
كل المنصات التسع|All platforms|Toutes les plateformes|Todas las plataformas|全部平台|Todas as plataformas
الأحدث إضافة للمكتبة|Recently added|Ajouts récents|Añadidos recientemente|最新上架|Adicionados recentemente
الأعلى تقييماً|Top rated|Les mieux notés|Mejor valorados|评分最高|Mais bem avaliados
ضمن باقاتي المشترك بها فقط|Only in my plans|Uniquement dans mes offres|Solo en mis planes|仅限我的套餐|Só nos meus planos
متاح للتنزيل بدون نت|Downloadable offline|Téléchargeable hors ligne|Descargable sin conexión|可离线下载|Disponível offline
فلاتر مطبقة:|Active filters:|Filtres actifs :|Filtros activos:|已选筛选：|Filtros ativos:
مسح الكل|Clear all|Tout effacer|Borrar todo|全部清除|Limpar tudo
ضمن باقتي|In my plan|Dans mon offre|En mi plan|在我的套餐中|No meu plano
متاح للتنزيل|Downloadable|Téléchargeable|Descargable|可下载|Disponível para download
لا توجد أعمال مطابقة لهذه الفلاتر|No titles match these filters|Aucun titre ne correspond|Ningún título coincide|没有符合条件的作品|Nenhum título corresponde
إعادة ضبط الفلاتر|Reset filters|Réinitialiser|Restablecer filtros|重置筛选|Redefinir filtros
عرض|Showing|Affichage|Mostrando|显示|Mostrando
من أصل|of|sur|de|共|de
عملاً متاحاً|available titles|titres disponibles|títulos disponibles|部作品|títulos disponíveis
عملاً|titles|titres|títulos|部作品|títulos
أين تشاهد؟|Where to watch?|Où regarder ?|¿Dónde ver?|在哪看？|Onde assistir?
في باقتك •|In your plan •|Dans votre offre •|En tu plan •|已含套餐 •|No seu plano •
في باقتك|In your plan|Dans votre offre|En tu plan|已含套餐|No seu plano
إيجار أو شراء|Rent or buy|Location ou achat|Alquiler o compra|租赁或购买|Aluguel ou compra
تنزيل|Download|Télécharger|Descargar|下载|Download
تنزيل متاح|Download available|Téléchargement dispo|Descarga disponible|支持下载|Download disponível
السابق|Previous|Précédent|Anterior|上一页|Anterior
التالي|Next|Suivant|Siguiente|下一页|Próximo
عرض الكل|View all|Voir tout|Ver todo|查看全部|Ver tudo
العمل غير موجود|Title not found|Titre introuvable|Título no encontrado|未找到作品|Título não encontrado
ربما تم تغيير الرابط أو لم يعد العمل متاحاً في منطقتك.|The link may have changed or the title is no longer available in your region.|Le lien a peut-être changé ou le titre n'est plus disponible.|Puede que el enlace haya cambiado o el título ya no esté disponible.|链接可能已变更，或该作品在你所在地区已下架。|O link pode ter mudado ou o título não está mais disponível.
ابحث عن عمل آخر|Search another title|Chercher un autre titre|Buscar otro título|搜索其他作品|Buscar outro título
في باقتك المشتركة|In your subscribed plan|Dans votre abonnement|En tu suscripción|已含在你的订阅中|Na sua assinatura
متاح على المنصات الرسمية|Available on official platforms|Disponible sur les plateformes officielles|Disponible en plataformas oficiales|正版平台可看|Disponível em plataformas oficiais
محدّث تلقائياً|Auto-updated|Mis à jour auto|Actualizado auto|自动更新|Atualizado automaticamente
إخراج:|Director:|Réalisation :|Dirección:|导演：|Direção:
بطولة:|Starring:|Avec :|Reparto:|主演：|Elenco:
التقييم العالمي|Global rating|Note globale|Valoración global|全球评分|Avaliação global
متاح على|Available on|Disponible sur|Disponible en|可观看平台|Disponível em
{n} منصات|{n} platforms|{n} plateformes|{n} plataformas|{n} 个平台|{n} plataformas
{n} منصة|{n} platform|{n} plateforme|{n} plataforma|{n} 个平台|{n} plataforma
النوع|Type|Type|Tipo|类型|Tipo
النطاق المحلي|Local region|Région|Región|所在地区|Região
مصر (متاح)|Egypt (available)|Égypte (disponible)|Egipto (disponible)|埃及（可看）|Egito (disponível)
مصر (غير متاح)|Egypt (unavailable)|Égypte (indisponible)|Egipto (no disponible)|埃及（不可看）|Egito (indisponível)
التوزيع القانوني الموثق|Verified legal distribution|Distribution légale vérifiée|Distribución legal verificada|认证正版发行|Distribuição legal verificada
أين تشاهد العمل الآن؟|Where to watch it now?|Où le regarder maintenant ?|¿Dónde verlo ahora?|现在在哪看？|Onde assistir agora?
ترتيب ذكي حسب الجودة والتوفر في منطقتك.|Smart ranking by quality and availability in your region.|Classement par qualité et disponibilité.|Orden inteligente por calidad y disponibilidad.|按画质和可用性智能排序。|Ordenado por qualidade e disponibilidade.
متاح بالاشتراك|With subscription|Avec abonnement|Con suscripción|订阅可看|Com assinatura
مجاني قانوني|Free (legal)|Gratuit (légal)|Gratis (legal)|免费正版|Grátis (legal)
مجاني بإعلانات|Free with ads|Gratuit avec pub|Gratis con anuncios|免费含广告|Grátis com anúncios
تأجير / شراء|Rent / buy|Location / achat|Alquiler / compra|租赁 / 购买|Aluguel / compra
الصوت|Audio|Audio|Audio|音效|Áudio
السعر الشهري|Monthly price|Prix mensuel|Precio mensual|月费|Preço mensal
حالة التوفر الإقليمي|Regional availability|Disponibilité régionale|Disponibilidad regional|地区可用性|Disponibilidade regional
هذا العمل غير متاح حالياً للبث في نطاقك الجغرافي|This title isn't currently available in your region|Ce titre n'est pas disponible dans votre région|Este título no está disponible en tu región|该作品目前在你所在地区不可观看|Este título não está disponível na sua região
حقوق البث الرقمي غير مفعّلة على المنصات داخل منطقتك حالياً.|Streaming rights aren't active in your region yet.|Les droits ne sont pas encore actifs dans votre région.|Los derechos aún no están activos en tu región.|你所在地区尚未开通版权。|Os direitos ainda não estão ativos na sua região.
نبهني فور توفر العمل|Notify me when available|Me prévenir dès sa sortie|Avísame cuando esté disponible|上线时提醒我|Avise-me quando disponível
أعمال مشابهة متاحة الآن|Similar titles available now|Titres similaires disponibles|Títulos similares disponibles|相似作品|Títulos semelhantes
الإعلان الرسمي (4K)|Official trailer (4K)|Bande-annonce (4K)|Tráiler oficial (4K)|官方预告 (4K)|Trailer oficial (4K)
تمت الإضافة إلى قائمة المشاهدة|Added to your list|Ajouté à votre liste|Añadido a tu lista|已加入片单|Adicionado à sua lista
تمت الإزالة من القائمة|Removed from your list|Retiré de votre liste|Eliminado de tu lista|已从片单移除|Removido da lista
تم نسخ رابط العمل|Link copied|Lien copié|Enlace copiado|链接已复制|Link copiado
تعذر الحفظ — جرّب تاني|Couldn't save — try again|Échec de l'enregistrement — réessayez|No se pudo guardar — inténtalo de nuevo|保存失败，请重试|Não foi possível salvar — tente novamente
ESC للإغلاق|ESC to close|Échap pour fermer|ESC para cerrar|按 ESC 关闭|ESC para fechar
الأعمال والعناوين|Titles|Titres|Títulos|作品|Títulos
اقتراحات مطابقة|matching suggestions|suggestions|sugerencias|条匹配建议|sugestões
جرّب البحث المتقدم|Try advanced search|Essayez la recherche avancée|Prueba la búsqueda avanzada|试试高级搜索|Tente a busca avançada
صناع السينما والأشخاص|People|Personnalités|Personas|影人|Pessoas
مسح|Clear|Effacer|Borrar|清除|Limpar
عمليات البحث الأخيرة|Recent searches|Recherches récentes|Búsquedas recientes|最近搜索|Buscas recentes
مسح السجل|Clear history|Effacer l'historique|Borrar historial|清除记录|Limpar histórico
تصفح سريع حسب التصنيف|Browse by category|Parcourir par catégorie|Explorar por categoría|按分类浏览|Navegar por categoria
الأكثر بحثاً وتداولاً اليوم|Trending searches today|Tendances du jour|Tendencias de hoy|今日热搜|Tendências de hoje
تحديث مباشر|Live|En direct|En vivo|实时|Ao vivo
نتائج البحث عن «|Results for «|Résultats pour «|Resultados para «|搜索结果：「|Resultados para «
لم نتمكن من العثور على أي نتائج|No results found|Aucun résultat|No se encontraron resultados|未找到结果|Nenhum resultado encontrado
بحثك عن|Your search for|Votre recherche|Tu búsqueda de|你搜索的|Sua busca por
هل تقصد البحث عن:|Did you mean:|Vouliez-vous dire :|¿Quisiste decir?|你是不是要找：|Você quis dizer:
لم تجد ما تبحث عنه؟ اطلب إضافة العمل فوراً|Can't find it? Request the title|Introuvable ? Demandez le titre|¿No lo encuentras? Solicita el título|没找到？申请添加|Não encontrou? Solicite o título
عنوان العمل المطلوب|Requested title|Titre demandé|Título solicitado|想要的作品名|Título desejado
سنة الإصدار|Release year|Année de sortie|Año de estreno|上映年份|Ano de lançamento
اطلب إضافة العمل للتتبع|Request & track this title|Demander et suivre|Solicitar y seguir|申请并追踪|Solicitar e acompanhar
تم تسجيل طلبك بنجاح|Request received|Demande enregistrée|Solicitud registrada|申请已提交|Solicitação recebida
سنراسلك فور توفر العمل على أي منصة مرخصة.|We'll email you as soon as it's on a licensed platform.|Nous vous écrirons dès sa disponibilité.|Te escribiremos en cuanto esté disponible.|上线后我们会邮件通知你。|Avisaremos por e-mail quando estiver disponível.
دليل ومقارنة المنصات الرقمية المرخصة في مصر والشرق الأوسط|Licensed streaming platforms guide for Egypt & the Middle East|Guide des plateformes légales en Égypte et au Moyen-Orient|Guía de plataformas legales en Egipto y Oriente Medio|埃及及中东正版平台指南|Guia de plataformas legais no Egito e Oriente Médio
المنصات المتوفرة|Available platforms|Plateformes disponibles|Plataformas disponibles|可用平台|Plataformas disponíveis
أقل سعر للاشتراك|Lowest price|Prix le plus bas|Precio más bajo|最低价格|Menor preço
دعم البث 4K|4K support|Support 4K|Soporte 4K|支持 4K|Suporte 4K
الشرعية والتراخيص|Legal & licensed|Légal et sous licence|Legal y con licencia|合法正版|Legal e licenciado
يبدأ من|Starts at|À partir de|Desde|起价|A partir de
ج.م / شهر|EGP / mo|EGP / mois|EGP / mes|埃镑 / 月|EGP / mês
حسب العمل|Per title|Selon le titre|Según el título|按作品|Por título
استكشف الكتالوج الكامل|Explore full catalog|Voir le catalogue|Ver el catálogo|浏览完整片库|Ver catálogo completo
المنصة|Platform|Plateforme|Plataforma|平台|Plataforma
أقل سعر شهري|Lowest monthly|Mensuel min.|Mensual mínimo|最低月费|Mensal mínimo
أقصى دقة|Max quality|Qualité max|Calidad máx.|最高画质|Qualidade máx.
تجربة مجانية|Free trial|Essai gratuit|Prueba gratis|免费试用|Teste grátis
غير متوفر|Not available|Indisponible|No disponible|不提供|Indisponível
دليل الباقة|Plan guide|Guide de l'offre|Guía del plan|套餐指南|Guia do plano
استثمارك الأمثل في الترفيه المنزلي|The best investment in home entertainment|Le meilleur investissement divertissement|La mejor inversión en entretenimiento|家庭娱乐的最佳投资|O melhor investimento em entretenimento
اشتراك شهري|Monthly|Mensuel|Mensual|按月|Mensal
اشتراك سنوي|Yearly|Annuel|Anual|按年|Anual
حساب الزائر|Guest account|Compte invité|Cuenta invitado|访客账户|Conta visitante
العضوية الذهبية|Gold membership|Abonnement Or|Membresía Oro|黄金会员|Assinatura Ouro
عضوية العائلة و VIP|Family & VIP|Famille et VIP|Familia y VIP|家庭与 VIP|Família e VIP
الأكثر اختياراً لعشاق السينما|Most popular with film lovers|Le plus choisi|El más elegido|影迷首选|O mais escolhido
حسابك الحالي النشط|Your current plan|Votre offre actuelle|Tu plan actual|当前套餐|Seu plano atual
اشترك في باقة العائلة|Get the Family plan|Choisir l'offre Famille|Elegir plan Familiar|订阅家庭套餐|Assinar plano Família
الأسئلة الأكثر شيوعاً حول الباقات|Plan FAQ|FAQ des offres|Preguntas sobre planes|套餐常见问题|Perguntas sobre planos
تصفح الكتالوج أولاً|Browse the catalog first|Voir d'abord le catalogue|Ver el catálogo primero|先浏览片库|Ver o catálogo primeiro
مرحباً بعودتك|Welcome back|Bon retour|Bienvenido de nuevo|欢迎回来|Bem-vindo de volta
البوابة السينمائية الآمنة|Secure cinema gateway|Accès cinéma sécurisé|Acceso seguro|安全影院入口|Acesso seguro
سجّل دخولك لمتابعة قائمتك وتنبيهاتك ومنصاتك.|Sign in to access your list, alerts and platforms.|Connectez-vous pour retrouver votre liste et vos alertes.|Inicia sesión para ver tu lista y alertas.|登录以查看片单、提醒和平台。|Entre para acessar sua lista e alertas.
أو بالبريد الإلكتروني|or with email|ou par e-mail|o con correo|或使用邮箱|ou com e-mail
المتابعة باستخدام Google|Continue with Google|Continuer avec Google|Continuar con Google|使用 Google 继续|Continuar com Google
المتابعة باستخدام Apple|Continue with Apple|Continuer avec Apple|Continuar con Apple|使用 Apple 继续|Continuar com Apple
البريد الإلكتروني|Email|E-mail|Correo electrónico|电子邮箱|E-mail
كلمة المرور|Password|Mot de passe|Contraseña|密码|Senha
نسيت كلمة المرور؟|Forgot password?|Mot de passe oublié ?|¿Olvidaste tu contraseña?|忘记密码？|Esqueceu a senha?
تذكرني على هذا الجهاز|Remember me on this device|Se souvenir de moi|Recordarme en este dispositivo|在此设备上记住我|Lembrar de mim neste dispositivo
ليس لديك حساب بعد؟|Don't have an account?|Pas encore de compte ?|¿No tienes cuenta?|还没有账户？|Não tem conta?
إنشاء حساب جديد|Create account|Créer un compte|Crear cuenta|注册新账户|Criar conta
اتصال مشفّر بالكامل|Fully encrypted connection|Connexion chiffrée|Conexión cifrada|全程加密连接|Conexão criptografada
كلمات المرور محفوظة بتشفير آمن|Passwords are securely hashed|Mots de passe chiffrés|Contraseñas cifradas|密码安全加密存储|Senhas criptografadas
إظهار كلمة المرور|Show password|Afficher le mot de passe|Mostrar contraseña|显示密码|Mostrar senha
أنشئ حسابك|Create your account|Créez votre compte|Crea tu cuenta|创建账户|Crie sua conta
احفظ قائمتك، واختار منصاتك، واستقبل تنبيهات التوفر.|Save your list, pick your platforms and get availability alerts.|Enregistrez votre liste et recevez des alertes.|Guarda tu lista y recibe alertas.|保存片单、选择平台、接收上线提醒。|Salve sua lista e receba alertas.
تجربة سينمائية فريدة وبلا إعلانات|A unique, ad-free cinema experience|Une expérience cinéma sans pub|Una experiencia de cine sin anuncios|独特的无广告观影体验|Uma experiência de cinema sem anúncios
الاسم|Name|Nom|Nombre|姓名|Nome
اسمك|Your name|Votre nom|Tu nombre|你的名字|Seu nome
تأكيد كلمة المرور|Confirm password|Confirmer le mot de passe|Confirmar contraseña|确认密码|Confirmar senha
اكتبها تاني|Type it again|Retapez-le|Escríbela de nuevo|再输入一次|Digite novamente
٨ حروف أو أرقام على الأقل|At least 8 characters|8 caractères minimum|Mínimo 8 caracteres|至少 8 个字符|Mínimo de 8 caracteres
أوافق على|I agree to the|J'accepte les|Acepto los|我同意|Concordo com os
شروط الاستخدام|Terms of use|Conditions d'utilisation|Términos de uso|使用条款|Termos de uso
و|and|et|y|和|e
إنشاء الحساب|Create account|Créer le compte|Crear cuenta|创建账户|Criar conta
بياناتك مشفرة ولا نشاركها مع أي جهة.|Your data is encrypted and never shared.|Vos données sont chiffrées et jamais partagées.|Tus datos están cifrados y no se comparten.|你的数据经过加密，绝不外泄。|Seus dados são criptografados e nunca compartilhados.
لديك حساب بالفعل؟|Already have an account?|Déjà un compte ?|¿Ya tienes cuenta?|已有账户？|Já tem conta?
قوة كلمة المرور:|Password strength:|Robustesse :|Seguridad:|密码强度：|Força da senha:
ضعيفة جداً|Very weak|Très faible|Muy débil|非常弱|Muito fraca
ضعيفة|Weak|Faible|Débil|弱|Fraca
متوسطة|Fair|Moyenne|Media|中等|Média
جيدة|Good|Bonne|Buena|良好|Boa
قوية|Strong|Forte|Fuerte|强|Forte
قوية جداً|Very strong|Très forte|Muy fuerte|非常强|Muito forte
كلمتا المرور غير متطابقتين|Passwords don't match|Les mots de passe ne correspondent pas|Las contraseñas no coinciden|两次密码不一致|As senhas não coincidem
لازم توافق على الشروط وسياسة الخصوصية|Please accept the terms and privacy policy|Veuillez accepter les conditions|Debes aceptar los términos|请同意条款与隐私政策|Aceite os termos e a política
نسيت كلمة المرور؟|Forgot password?|Mot de passe oublié ?|¿Olvidaste tu contraseña?|忘记密码？|Esqueceu a senha?
اكتب بريدك الإلكتروني وهنبعتلك رابط لاختيار كلمة مرور جديدة.|Enter your email and we'll send you a link to set a new password.|Saisissez votre e-mail pour recevoir un lien de réinitialisation.|Escribe tu correo y te enviaremos un enlace.|输入邮箱，我们将发送重置链接。|Digite seu e-mail e enviaremos um link.
إرسال رابط إعادة التعيين|Send reset link|Envoyer le lien|Enviar enlace|发送重置链接|Enviar link
تفقّد بريدك|Check your inbox|Vérifiez vos e-mails|Revisa tu correo|请查收邮件|Verifique seu e-mail
لو ما لقيتوش، شوف مجلد الرسائل غير المرغوب فيها (Spam).|Can't find it? Check your spam folder.|Introuvable ? Vérifiez vos spams.|¿No lo ves? Revisa el spam.|没收到？请检查垃圾邮件。|Não encontrou? Verifique o spam.
إعادة إرسال الرابط|Resend link|Renvoyer le lien|Reenviar enlace|重新发送|Reenviar link
العودة لتسجيل الدخول|Back to sign in|Retour à la connexion|Volver a iniciar sesión|返回登录|Voltar ao login
كلمة مرور جديدة|New password|Nouveau mot de passe|Nueva contraseña|新密码|Nova senha
اختار كلمة مرور قوية ما استخدمتهاش قبل كده.|Choose a strong password you haven't used before.|Choisissez un mot de passe fort et inédit.|Elige una contraseña segura y nueva.|请设置一个未用过的强密码。|Escolha uma senha forte e nova.
كلمة المرور الجديدة|New password|Nouveau mot de passe|Nueva contraseña|新密码|Nova senha
حفظ كلمة المرور|Save password|Enregistrer|Guardar contraseña|保存密码|Salvar senha
طلب رابط جديد|Request a new link|Demander un nouveau lien|Pedir otro enlace|重新获取链接|Solicitar novo link
تم تغيير كلمة المرور|Password changed|Mot de passe modifié|Contraseña cambiada|密码已修改|Senha alterada
تم تسجيل دخولك — جاري تحويلك لحسابك...|You're signed in — redirecting...|Vous êtes connecté — redirection...|Sesión iniciada — redirigiendo...|已登录，正在跳转...|Você entrou — redirecionando...
البيانات الشخصية|Personal details|Informations personnelles|Datos personales|个人信息|Dados pessoais
رقم الهاتف|Phone number|Téléphone|Teléfono|电话号码|Telefone
حفظ التعديلات|Save changes|Enregistrer|Guardar cambios|保存修改|Salvar alterações
تم حفظ البيانات|Saved|Enregistré|Guardado|已保存|Salvo
تغيير كلمة المرور|Change password|Changer le mot de passe|Cambiar contraseña|修改密码|Alterar senha
إضافة كلمة مرور|Add a password|Ajouter un mot de passe|Añadir contraseña|添加密码|Adicionar senha
كلمة المرور الحالية|Current password|Mot de passe actuel|Contraseña actual|当前密码|Senha atual
حذف الحساب|Delete account|Supprimer le compte|Eliminar cuenta|删除账户|Excluir conta
حذف الحساب نهائياً|Delete account permanently|Supprimer définitivement|Eliminar definitivamente|永久删除账户|Excluir permanentemente
تأكيد الحذف|Confirm delete|Confirmer|Confirmar|确认删除|Confirmar exclusão
إلغاء|Cancel|Annuler|Cancelar|取消|Cancelar
هيتم حذف حسابك وقائمتك نهائياً.|Your account and list will be permanently deleted.|Votre compte sera définitivement supprimé.|Tu cuenta se eliminará definitivamente.|你的账户和片单将被永久删除。|Sua conta será excluída permanentemente.
عمل في قائمتي|titles in my list|titres dans ma liste|títulos en mi lista|部作品在片单|títulos na minha lista
منصة مشترك بها|subscribed platforms|plateformes abonnées|plataformas suscritas|个已订阅平台|plataformas assinadas
بريد وكلمة مرور|Email & password|E-mail et mot de passe|Correo y contraseña|邮箱与密码|E-mail e senha
عضو منذ|Member since|Membre depuis|Miembro desde|注册于|Membro desde
الملف الشخصي|Profile|Profil|Perfil|个人资料|Perfil
إدارة الاشتراك|Subscription|Abonnement|Suscripción|订阅管理|Assinatura
سجل الفواتير|Billing history|Factures|Facturas|账单记录|Faturas
منصاتي المشترك بها|My platforms|Mes plateformes|Mis plataformas|我的平台|Minhas plataformas
إعدادات الحساب|Settings|Paramètres|Ajustes|账户设置|Configurações
قائمة المشاهدة المتزامنة|Synced watchlist|Liste synchronisée|Lista sincronizada|同步片单|Lista sincronizada
أضف أعمالاً جديدة|Add new titles|Ajouter des titres|Añadir títulos|添加作品|Adicionar títulos
هيتشال قريب|Leaving soon|Bientôt retiré|Se va pronto|即将下架|Saindo em breve
إشارة مفقودة|Signal lost|Signal perdu|Señal perdida|信号丢失|Sinal perdido
عذراً، يبدو أن هذا العمل أو الصفحة غادرت صالة العرض!|Sorry, this page seems to have left the theater!|Désolé, cette page a quitté la salle !|¡Lo sentimos, esta página salió de la sala!|抱歉，这个页面似乎已离场！|Desculpe, esta página saiu da sala!
استكشاف|Explore|Explorer|Explorar|探索|Explorar
العودة للرئيسية|Back to home|Retour à l'accueil|Volver al inicio|返回首页|Voltar ao início
تصفح أحدث الأفلام|Browse latest movies|Derniers films|Últimas películas|浏览最新电影|Últimos filmes
أفضل المسلسلات المتوفرة|Best available series|Meilleures séries|Mejores series|热门剧集|Melhores séries
قائمة المشاهدة الخاصة بي|My watchlist|Ma liste|Mi lista|我的片单|Minha lista
إشعار ملفات تعريف الارتباط والخصوصية|Cookies & privacy notice|Cookies et confidentialité|Aviso de cookies|Cookie 与隐私提示|Aviso de cookies
شفافية رقمية|Transparency|Transparence|Transparencia|透明|Transparência
رفض الكل|Reject all|Tout refuser|Rechazar todo|全部拒绝|Recusar tudo
تخصيص الخيارات|Customize|Personnaliser|Personalizar|自定义|Personalizar
قبول الكل|Accept all|Tout accepter|Aceptar todo|全部接受|Aceitar tudo
حفظ تفضيلاتي المحددة|Save my choices|Enregistrer mes choix|Guardar mis preferencias|保存我的选择|Salvar minhas escolhas
رفض الكل غير الضروري|Reject non-essential|Refuser le non essentiel|Rechazar no esenciales|拒绝非必要|Recusar não essenciais
إلزامية للتشغيل|Required|Obligatoire|Obligatorio|必需|Obrigatório
مسلسل|Series|Série|Serie|剧集|Série
برنامج|Show|Émission|Programa|节目|Programa
حساب|Account|Compte|Cuenta|账户|Conta
البريد أو كلمة المرور غير صحيحة|Wrong email or password|E-mail ou mot de passe incorrect|Correo o contraseña incorrectos|邮箱或密码错误|E-mail ou senha incorretos
اكتب بريد إلكتروني صحيح|Enter a valid email|Saisissez un e-mail valide|Introduce un correo válido|请输入有效邮箱|Digite um e-mail válido
كلمة المرور لازم تكون ٨ حروف أو أرقام على الأقل|Password must be at least 8 characters|Le mot de passe doit comporter 8 caractères minimum|La contraseña debe tener al menos 8 caracteres|密码至少 8 个字符|A senha deve ter pelo menos 8 caracteres
البريد ده مسجل قبل كده — سجّل دخولك|This email is already registered — sign in|Cet e-mail existe déjà — connectez-vous|Este correo ya está registrado — inicia sesión|该邮箱已注册，请登录|Este e-mail já está cadastrado — entre
محاولات كتير — استنى ١٥ دقيقة وجرب تاني|Too many attempts — try again in 15 minutes|Trop de tentatives — réessayez dans 15 min|Demasiados intentos — espera 15 minutos|尝试次数过多，请 15 分钟后再试|Muitas tentativas — aguarde 15 minutos
الرابط انتهى أو غير صالح — اطلب رابط جديد|Link expired or invalid — request a new one|Lien expiré — demandez-en un nouveau|Enlace caducado — pide otro|链接已失效，请重新获取|Link expirado — solicite outro
تم إلغاء تسجيل الدخول|Sign-in cancelled|Connexion annulée|Inicio de sesión cancelado|已取消登录|Login cancelado
تعذر تسجيل الدخول — جرّب تاني|Sign-in failed — try again|Échec de connexion — réessayez|Error al iniciar sesión — reintenta|登录失败，请重试|Falha no login — tente novamente
تسجيل الدخول بجوجل لسه ما اتفعّلش على الموقع|Google sign-in isn't enabled yet|Connexion Google pas encore activée|Inicio con Google aún no activado|Google 登录尚未开启|Login com Google ainda não ativado
تسجيل الدخول بأبل لسه ما اتفعّلش على الموقع|Apple sign-in isn't enabled yet|Connexion Apple pas encore activée|Inicio con Apple aún no activado|Apple 登录尚未开启|Login com Apple ainda não ativado
حصل خطأ غير متوقع — جرّب تاني|Something went wrong — try again|Une erreur est survenue — réessayez|Algo salió mal — inténtalo de nuevo|出现错误，请重试|Algo deu errado — tente novamente
شاهد على شاهد|Watch on Shahid|Regarder sur Shahid|Ver en Shahid|在 Shahid 观看|Assistir no Shahid
شاهد VIP|Shahid VIP|Shahid VIP|Shahid VIP|Shahid VIP|Shahid VIP
ووتش إت|Watch It|Watch It|Watch It|Watch It|Watch It
نتفليكس|Netflix|Netflix|Netflix|Netflix|Netflix
أو إس إن بلس|OSN+|OSN+|OSN+|OSN+|OSN+
أمازون برايم|Prime Video|Prime Video|Prime Video|Prime Video|Prime Video
يانغو بلاي|Yango Play|Yango Play|Yango Play|Yango Play|Yango Play
أبل تي في بلس|Apple TV+|Apple TV+|Apple TV+|Apple TV+|Apple TV+
ستارزبلاي|STARZPLAY|STARZPLAY|STARZPLAY|STARZPLAY|STARZPLAY
يوتيوب أفلام|YouTube Movies|YouTube Films|YouTube Películas|YouTube 电影|YouTube Filmes
فيلم|Movie|Film|Película|电影|Filme
ساعتان|2 hours|2 heures|2 horas|2 小时|2 horas
{n} حلقة|{n} episodes|{n} épisodes|{n} episodios|{n} 集|{n} episódios
{n} حلقات|{n} episodes|{n} épisodes|{n} episodios|{n} 集|{n} episódios
`;

const IDX: Record<string, number> = { en: 0, fr: 1, es: 2, zh: 3, pt: 4 };
export const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

let cache: { lang: string; map: Map<string, string> } | null = null;
export function dictFor(lang: string): Map<string, string> {
  if (cache?.lang === lang) return cache.map;
  const i = IDX[lang] ?? 0;
  const map = new Map<string, string>();
  RAW.split('\n').forEach((line) => {
    const parts = line.split('|');
    if (parts.length < 6) return;
    const v = parts[i + 1]?.trim();
    if (v) map.set(norm(parts[0]), v);
  });
  cache = { lang, map };
  return map;
}

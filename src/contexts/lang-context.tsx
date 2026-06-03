import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Lang = "FR" | "AR" | "TZM";

export interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof translations.FR) => string;
  isRTL: boolean;
}

// ─── Translations ────────────────────────────────────────────────────────────

export const translations = {
  FR: {
    // Nav
    nav_discover: "Découvrir",
    nav_map: "Carte",
    nav_eco: "Éco-impact",
    nav_login: "Connexion",
    nav_signup: "S'inscrire",
    nav_myspace: "Mon espace",
    nav_logout: "Déconnexion",
    nav_admin: "Admin",

    // Hero
    hero_eyebrow: "ECOHACK · Béjaïa 2026",
    hero_title_1: "Le réseau calme",
    hero_title_2: "qui connecte la",
    hero_title_3: "jeunesse",
    hero_title_4: "de Béjaïa.",
    hero_subtitle:
      "Une plateforme légère et peu gourmande en données pour les activités, le bénévolat, les ateliers et les structures de jeunesse de la wilaya — construite avec ODEJ Béjaïa.",
    hero_cta_explore: "Explorer les opportunités",
    hero_cta_login: "Se connecter",
    hero_metric_structures: "Structures",
    hero_metric_communes: "Communes",
    hero_metric_data: "Moins de données",
    hero_metric_partner: "Partenaire officiel",
    hero_live: "En direct · Béjaïa",
    hero_live_event: "Atelier · Design d'impact",
    hero_live_sub: "Maison de Jeunes Béjaïa · Sam 18:00",
    hero_live_btn: "Rejoindre",

    // Discover
    discover_eyebrow: "01 — Découvrir",
    discover_title_1: "Un fil qui connaît votre",
    discover_title_2: "commune",
    discover_title_3: ", vos intérêts, votre temps.",
    discover_subtitle:
      "Personnalisé en silence. Pas de scroll addictif — juste la prochaine chose utile qui se passe près de vous, cette semaine, dans la wilaya de Béjaïa.",
    discover_featured: "À la une cette semaine",
    discover_featured_title: "Studio ouvert — créez quelque chose pour votre commune",
    discover_featured_sub: "5 communes · 80 participants",
    discover_spotlight: "Spotlight · Bénévoles Béjaïa",
    discover_spotlight_quote: "« On a planté 1 400 arbres avec des gens qu'on ne connaissait pas. »",
    discover_spotlight_credit: "Yasmine · Béjaïa",

    // Map
    map_eyebrow: "02 — Carte",
    map_title_1: "Chaque",
    map_title_2: "Maison de Jeunes",
    map_title_3: ", sur une carte calme.",
    map_subtitle:
      "Trouvez la structure la plus proche de chez vous dans la wilaya de Béjaïa. Filtrez par commune, par type d'activité, par ce qui est ouvert ce soir. Fonctionne hors ligne dès la première visite.",
    map_stat_structures: "Structures ODEJ",
    map_stat_communes: "Communes couvertes",
    map_stat_weight: "Poids moyen / page",
    map_stat_offline: "Après la 1ʳᵉ visite",
    map_offline_label: "Hors ligne",
    map_live: "En direct · Béjaïa · 9 nouvelles ce soir",

    // Eco
    eco_eyebrow: "03 — Éco-impact",
    eco_title_1: "Léger par conception.",
    eco_title_2: "Plus doux",
    eco_title_3: "pour les téléphones, réseaux et la planète.",
    eco_subtitle:
      "La plupart de nos utilisateurs ouvrent YouthLink sur un téléphone modeste, en 3G, avec peu de données. Nous avons donc expédié moins de code, des images plus légères, et une page d'accueil qui fonctionne dès la deuxième visite — même hors ligne.",
    eco_stat_weight: "Poids de la page",
    eco_stat_weight_detail: "contre 2,4 Mo en moyenne",
    eco_stat_carbon: "Carbone par visite",
    eco_stat_carbon_detail: "Plus propre que 92% des sites",
    eco_stat_paint: "Premier affichage",
    eco_stat_paint_detail: "Sur une connexion 3G",
    eco_stat_offline: "Prêt hors ligne",
    eco_stat_offline_detail: "Après la première visite",
    eco_tracker: "Éco tracker · ce mois",
    eco_live: "en direct",
    eco_saved: "économisés vs. méthode conventionnelle.",
    eco_trees: "Arbres plantés",
    eco_volunteers: "Bénévoles",
    eco_workshops: "Ateliers",

    // Voices
    voices_eyebrow: "05 — Voix",
    voices_title_1: "De",
    voices_title_2: "Béjaïa",
    voices_title_3: "à",
    voices_title_4: "Kherrata",
    voices_subtitle: "Des voix de la wilaya — en arabe, en français, en kabyle.",
    voices_q1: "J'ai trouvé un atelier de code à deux rues de chez moi à Amizour. Je ne savais même pas qu'il existait.",
    voices_p1: "Massinissa, 20 ans",
    voices_l1: "Amizour · Béjaïa",
    voices_q2: "On a posté un nettoyage de côte vendredi. Le dimanche, 90 personnes s'étaient inscrites — sans aucune pub.",
    voices_p2: "Lila, personnel ODEJ",
    voices_l2: "Tichy · Béjaïa",
    voices_q3: "Enfin quelque chose en arabe, français et tamazight qui ne ressemble pas à un formulaire administratif.",
    voices_p3: "Yidir, 22 ans",
    voices_l3: "Akbou · Béjaïa",

    // Footer
    footer_desc:
      "Construit avec soin pour la jeunesse des 52 communes de la wilaya de Béjaïa, en partenariat avec ODEJ — Office des Établissements de Jeunes de Béjaïa.",
    footer_col_product: "Produit",
    footer_col_product_1: "Découvrir",
    footer_col_product_2: "Carte",
    footer_col_product_3: "Éco-impact",
    footer_col_product_4: "Tableau de bord",
    footer_col_odej: "ODEJ Béjaïa",
    footer_col_odej_1: "Pour le personnel",
    footer_col_odej_2: "Structures",
    footer_col_odej_3: "Partenaires",
    footer_col_odej_4: "Contact",
    footer_col_lang: "Langues",
    footer_copyright: "© 2026 YouthLink Béjaïa · Un projet civique",
    footer_made: "fabriqué à Béjaïa",

    // Auth
    auth_back: "← Retour à l'accueil",
    auth_tagline_login: "Bienvenue. Connectez-vous à votre compte.",
    auth_tagline_signup: "Rejoignez la communauté jeunesse de la wilaya.",
    login_title: "Connexion",
    login_email: "Adresse e-mail",
    login_password: "Mot de passe",
    login_submit: "Se connecter",
    login_submitting: "Connexion…",
    login_no_account: "Pas encore de compte ?",
    login_signup_link: "S'inscrire",
    signup_title: "Créer un compte",
    signup_name: "Nom complet",
    signup_email: "Adresse e-mail",
    signup_commune: "Commune",
    signup_commune_placeholder: "Sélectionnez votre commune…",
    signup_password: "Mot de passe",
    signup_password_placeholder: "Min. 6 caractères",
    signup_submit: "Créer mon compte",
    signup_submitting: "Inscription…",
    signup_has_account: "Déjà un compte ?",
    signup_login_link: "Se connecter",
    odej_access: "Accès ODEJ Béjaïa",

    // App portal
    app_explore: "Explorer",
    app_tasks: "Tâches",
    app_leaderboard: "Classement",
    app_progression: "Progression",
    app_logout: "Sortir",
    app_greeting: "Bonjour,",
    app_opportunities: "Opportunités · Béjaïa",
    app_register: "S'inscrire",
    app_registered: "Inscrit ✓",
    app_full: "Complet",
    app_cancel: "Annuler",
  },

  // ─── Arabic ────────────────────────────────────────────────────────────────
  AR: {
    // Nav
    nav_discover: "اكتشف",
    nav_map: "الخريطة",
    nav_eco: "الأثر البيئي",
    nav_login: "تسجيل الدخول",
    nav_signup: "إنشاء حساب",
    nav_myspace: "مساحتي",
    nav_logout: "تسجيل الخروج",
    nav_admin: "الإدارة",

    // Hero
    hero_eyebrow: "إيكوهاك · بجاية 2026",
    hero_title_1: "الشبكة الهادئة",
    hero_title_2: "التي تربط",
    hero_title_3: "شباب",
    hero_title_4: "بجاية.",
    hero_subtitle:
      "منصة خفيفة وموفرة للبيانات للأنشطة والتطوع وورش العمل وهياكل الشباب في ولاية بجاية — بُنيت مع مكتب مؤسسات الشباب ODEJ بجاية.",
    hero_cta_explore: "استكشف الفرص",
    hero_cta_login: "تسجيل الدخول",
    hero_metric_structures: "هيكلًا",
    hero_metric_communes: "بلدية",
    hero_metric_data: "أقل استهلاكًا للبيانات",
    hero_metric_partner: "الشريك الرسمي",
    hero_live: "مباشر · بجاية",
    hero_live_event: "ورشة · تصميم الأثر",
    hero_live_sub: "دار الشباب بجاية · السبت 18:00",
    hero_live_btn: "انضم",

    // Discover
    discover_eyebrow: "01 — اكتشف",
    discover_title_1: "خيط يعرف",
    discover_title_2: "بلديتك",
    discover_title_3: "، اهتماماتك، ووقتك.",
    discover_subtitle:
      "مخصص بصمت. لا تمرير إدماني — فقط الشيء المفيد التالي القريب منك هذا الأسبوع في ولاية بجاية.",
    discover_featured: "المميز هذا الأسبوع",
    discover_featured_title: "استوديو مفتوح — اصنع شيئًا لبلديتك",
    discover_featured_sub: "5 بلديات · 80 مشاركًا",
    discover_spotlight: "تسليط الضوء · متطوعو بجاية",
    discover_spotlight_quote: "«زرعنا 1400 شجرة مع أشخاص لم نكن نعرفهم.»",
    discover_spotlight_credit: "ياسمين · بجاية",

    // Map
    map_eyebrow: "02 — الخريطة",
    map_title_1: "كل",
    map_title_2: "دار الشباب",
    map_title_3: "، على خريطة هادئة.",
    map_subtitle:
      "اعثر على أقرب هيكل إليك في ولاية بجاية. فلتر حسب البلدية، نوع النشاط، وما هو مفتوح الليلة. يعمل بدون إنترنت بعد الزيارة الأولى.",
    map_stat_structures: "هيكل ODEJ",
    map_stat_communes: "بلدية مشمولة",
    map_stat_weight: "متوسط حجم الصفحة",
    map_stat_offline: "بعد الزيارة الأولى",
    map_offline_label: "بدون إنترنت",
    map_live: "مباشر · بجاية · 9 جديدة الليلة",

    // Eco
    eco_eyebrow: "03 — الأثر البيئي",
    eco_title_1: "خفيف بطبيعته.",
    eco_title_2: "أكثر رفقًا",
    eco_title_3: "للهواتف والشبكات والكوكب.",
    eco_subtitle:
      "معظم مستخدمينا يفتحون YouthLink على هاتف بسيط، باتصال 3G، وبيانات محدودة. لذا شحنّا كودًا أقل، صورًا أصغر، وصفحة رئيسية تعمل في الزيارة الثانية — حتى بدون إنترنت.",
    eco_stat_weight: "حجم الصفحة",
    eco_stat_weight_detail: "مقابل 2.4 ميجابايت في المتوسط",
    eco_stat_carbon: "الكربون لكل زيارة",
    eco_stat_carbon_detail: "أنظف من 92% من المواقع",
    eco_stat_paint: "أول رسم مرئي",
    eco_stat_paint_detail: "على اتصال 3G",
    eco_stat_offline: "جاهز بدون إنترنت",
    eco_stat_offline_detail: "بعد الزيارة الأولى",
    eco_tracker: "مقياس الأثر البيئي · هذا الشهر",
    eco_live: "مباشر",
    eco_saved: "تم توفيرها مقارنةً بالطريقة التقليدية.",
    eco_trees: "شجرة مزروعة",
    eco_volunteers: "متطوع",
    eco_workshops: "ورشة عمل",

    // Voices
    voices_eyebrow: "05 — أصوات",
    voices_title_1: "من",
    voices_title_2: "بجاية",
    voices_title_3: "إلى",
    voices_title_4: "خراطة",
    voices_subtitle: "أصوات من الولاية — بالعربية، الفرنسية، والقبايلية.",
    voices_q1: "وجدتُ ورشة برمجة على بُعد خطوتين من منزلي في أميزور. لم أكن أعلم بوجودها أصلًا.",
    voices_p1: "مسينيسا، 20 سنة",
    voices_l1: "أميزور · بجاية",
    voices_q2: "نشرنا حملة تنظيف ساحلية الجمعة. الأحد، سجّل 90 شخصًا — دون أي إعلان.",
    voices_p2: "ليلى، موظفة ODEJ",
    voices_l2: "تيشي · بجاية",
    voices_q3: "أخيرًا شيء بالعربية والفرنسية والتمازيغت لا يشبه نموذجًا إداريًا.",
    voices_p3: "ييدير، 22 سنة",
    voices_l3: "أقبو · بجاية",

    // Footer
    footer_desc:
      "بُني بعناية لشباب 52 بلدية في ولاية بجاية، بشراكة مع ODEJ — مكتب مؤسسات الشباب في بجاية.",
    footer_col_product: "المنتج",
    footer_col_product_1: "اكتشف",
    footer_col_product_2: "الخريطة",
    footer_col_product_3: "الأثر البيئي",
    footer_col_product_4: "لوحة التحكم",
    footer_col_odej: "ODEJ بجاية",
    footer_col_odej_1: "للموظفين",
    footer_col_odej_2: "الهياكل",
    footer_col_odej_3: "الشركاء",
    footer_col_odej_4: "اتصل بنا",
    footer_col_lang: "اللغات",
    footer_copyright: "© 2026 YouthLink بجاية · مشروع مدني",
    footer_made: "صُنع في بجاية",

    // Auth
    auth_back: "← العودة إلى الرئيسية",
    auth_tagline_login: "أهلًا بك. سجّل دخولك إلى حسابك.",
    auth_tagline_signup: "انضم إلى مجتمع شباب الولاية.",
    login_title: "تسجيل الدخول",
    login_email: "البريد الإلكتروني",
    login_password: "كلمة المرور",
    login_submit: "تسجيل الدخول",
    login_submitting: "جارٍ الدخول…",
    login_no_account: "لا تملك حسابًا بعد؟",
    login_signup_link: "إنشاء حساب",
    signup_title: "إنشاء حساب",
    signup_name: "الاسم الكامل",
    signup_email: "البريد الإلكتروني",
    signup_commune: "البلدية",
    signup_commune_placeholder: "اختر بلديتك…",
    signup_password: "كلمة المرور",
    signup_password_placeholder: "6 أحرف على الأقل",
    signup_submit: "إنشاء حسابي",
    signup_submitting: "جارٍ التسجيل…",
    signup_has_account: "لديك حساب؟",
    signup_login_link: "تسجيل الدخول",
    odej_access: "دخول ODEJ بجاية",

    // App portal
    app_explore: "استكشف",
    app_tasks: "المهام",
    app_leaderboard: "الترتيب",
    app_progression: "التقدم",
    app_logout: "خروج",
    app_greeting: "مرحبًا،",
    app_opportunities: "الفرص · بجاية",
    app_register: "تسجيل",
    app_registered: "مسجّل ✓",
    app_full: "مكتمل",
    app_cancel: "إلغاء",
  },

  // ─── Tamazight (Tifinagh) ──────────────────────────────────────────────────
  TZM: {
    // Nav
    nav_discover: "ⵙⵙⵏ",
    nav_map: "ⵜⴰⵡⵍⴰⴼⵜ",
    nav_eco: "ⵜⵉⵍⴻⵍⵍⵉ",
    nav_login: "ⴽⴽⴻⵏ",
    nav_signup: "ⵉⵔⴰⴳⴻⵎ",
    nav_myspace: "ⴰⵙⵉⵔⴰ ⵉⵡ",
    nav_logout: "ⴼⴼⴻⵖ",
    nav_admin: "ⴰⴷⵎⵉⵏ",

    // Hero
    hero_eyebrow: "ECOHACK · ⴱⴳⴰⵢⴻⵜ 2026",
    hero_title_1: "Aγmis amezwaru",
    hero_title_2: "i d-yettasen",
    hero_title_3: "tarwa",
    hero_title_4: "n Bgayet.",
    hero_subtitle:
      "Ameskar aẓayan d uffir n isefka i tezrawin, aseggas, tizrawin d uxxam n tarwa s tmurt n Bgayet — yettwaggen akked ODEJ Bgayet.",
    hero_cta_explore: "ⵙⵙⵏ ⵜⵉⵖⴰⵡⵙⵉⵡⵉⵏ",
    hero_cta_login: "ⴽⴽⴻⵏ",
    hero_metric_structures: "ⵉⵎⴻⴷⵢⴰⵜⴻⵏ",
    hero_metric_communes: "ⵜⵓⴷⴷⴰⵔ",
    hero_metric_data: "Uffir n isefka",
    hero_metric_partner: "ⴰⵎⴰⵔⴰⴽ ⴰⵎⴻⵙⵍⴰⵢ",
    hero_live: "ⴷⴻⴳ ⵓⵣⵎⴻⵔ · ⴱⴳⴰⵢⴻⵜ",
    hero_live_event: "Taneḍṭit · Design d'impact",
    hero_live_sub: "Axxam n Tarwa Bgayet · Ass n Ssebt 18:00",
    hero_live_btn: "ⴽⴽⴻⵏ",

    // Discover
    discover_eyebrow: "01 — ⵙⵙⵏ",
    discover_title_1: "Aγmis i d-issen",
    discover_title_2: "tuddar-ik",
    discover_title_3: ", tamuɣli-ik, akud-ik.",
    discover_subtitle:
      "Yettwasellek s ugdud. Ulac aseɣwen — kan ayen iteɛban ara d-yiliɣ sdat-ek, assa n-nni, deg tmurt n Bgayet.",
    discover_featured: "ⴰⵙⴻⵍⵡⴰⵢ n ddurt-a",
    discover_featured_title: "Axxam n tira iwimi — aru ayen i tuddar-ik",
    discover_featured_sub: "5 n tuddar · 80 n yimezdaɣ",
    discover_spotlight: "Spotlight · Imsebgasen n Bgayet",
    discover_spotlight_quote: "«Nezra 1400 n yiseklan akked yimdanen ur nessen ara.»",
    discover_spotlight_credit: "Yasmine · Bgayet",

    // Map
    map_eyebrow: "02 — ⵜⴰⵡⵍⴰⴼⵜ",
    map_title_1: "Kull",
    map_title_2: "Axxam n Tarwa",
    map_title_3: ", deg tawlaft tamzizin.",
    map_subtitle:
      "Af taɣult i d-iqarben fell-ak deg tmurt n Bgayet. Sfurzu s tuddar, s tamselt n tneḍṭit, ɣef wayen iwefren iḍ-a. Yetteddu s yir azref di tzeɣrut tamezwarut.",
    map_stat_structures: "ⵉⵎⴻⴷⵢⴰⵜⴻⵏ ODEJ",
    map_stat_communes: "ⵜⵓⴷⴷⴰⵔ ⵉⵍⵓⵍⴰⵏⵜ",
    map_stat_weight: "Azɣal amezwaru / asebter",
    map_stat_offline: "Deffir tzeɣrut tamezwarut",
    map_offline_label: "S yir azref",
    map_live: "ⴷⴻⴳ ⵓⵣⵎⴻⵔ · ⴱⴳⴰⵢⴻⵜ · 9 tifin iḍ-a",

    // Eco
    eco_eyebrow: "03 — ⵜⵉⵍⴻⵍⵍⵉ",
    eco_title_1: "Aẓayan s yisem-is.",
    eco_title_2: "Yelha",
    eco_title_3: "i yisutan, i uzeṭṭa d akal.",
    eco_subtitle:
      "Aṭas n yimezdaɣ-nneɣ ttwali-ten YouthLink s tiliɣri tamẓluft, deg 3G, s isefka imẓiyen. Yebɣa-d s wakud iffiren, tugna tameqqrant, d usebter amezwaru yellan-itent.",
    eco_stat_weight: "Azɣal n usebter",
    eco_stat_weight_detail: "akkin 2.4 MB i umezruy",
    eco_stat_carbon: "Acarbunn s uẓawan",
    eco_stat_carbon_detail: "Imensi ɣef 92% n yisiten",
    eco_stat_paint: "Azeɣlu amezwaru",
    eco_stat_paint_detail: "Deg 3G",
    eco_stat_offline: "Yeqqar s yir azref",
    eco_stat_offline_detail: "Deffir tzeɣrut tamezwarut",
    eco_tracker: "Ameskar n tiliɣri · aggur-a",
    eco_live: "deg uzmir",
    eco_saved: "tyuzway akkin tarrayt tamaqlalt.",
    eco_trees: "Iseklan ifrez",
    eco_volunteers: "Imsebgasen",
    eco_workshops: "Tineḍṭiwin",

    // Voices
    voices_eyebrow: "05 — ⵉⵙⴻⵍⵍⴰⵙⴻⵏ",
    voices_title_1: "ⵙⴳ",
    voices_title_2: "ⴱⴳⴰⵢⴻⵜ",
    voices_title_3: "ⴰⵔ",
    voices_title_4: "ⵅⵔⵔⴰⵟⴰ",
    voices_subtitle: "Isellassen n tmurt — s taɛrabt, tafransist, taqbaylit.",
    voices_q1: "Ufiɣ taneḍṭit n usihel deg sin n yiɣsan seg uxxam-iw deg Amizur. Ur ssineɣ ara belli tella.",
    voices_p1: "Massinissa, 20 n yiseggasen",
    voices_l1: "Amizur · Bgayet",
    voices_q2: "Nessura asxisuf n yidammen n Tizi ass n Lexmis. Ass n Yider, 90 n yimdanen d-yekker — s yir tilɣa.",
    voices_p2: "Lila, taneɛlamt n ODEJ",
    voices_l2: "Tixi · Bgayet",
    voices_q3: "Tazwara ayen deg taɛrabt, tafransist d tamaziɣt ur-iten-tettwali ara am ufeggag anamur.",
    voices_p3: "Yidir, 22 n yiseggasen",
    voices_l3: "Aqbu · Bgayet",

    // Footer
    footer_desc:
      "Yettwaggen s lεnayet i tarwa n 52 n tuddar n tmurt n Bgayet, akked ODEJ — Amezgun n Tiddukliwin n Tarwa n Bgayet.",
    footer_col_product: "ⴰⵎⴻⵙⴽⴰⵔ",
    footer_col_product_1: "ⵙⵙⵏ",
    footer_col_product_2: "ⵜⴰⵡⵍⴰⴼⵜ",
    footer_col_product_3: "ⵜⵉⵍⴻⵍⵍⵉ",
    footer_col_product_4: "Taburt n uselkem",
    footer_col_odej: "ODEJ ⴱⴳⴰⵢⴻⵜ",
    footer_col_odej_1: "I yineɛlamen",
    footer_col_odej_2: "ⵉⵎⴻⴷⵢⴰⵜⴻⵏ",
    footer_col_odej_3: "Imaraken",
    footer_col_odej_4: "ⴰⵎⵢⴰⵡⴰⵍ",
    footer_col_lang: "ⵜⵓⵜⵍⴰⵢⵉⵏ",
    footer_copyright: "© 2026 YouthLink ⴱⴳⴰⵢⴻⵜ · Asenker aɣerfan",
    footer_made: "yettwaggen deg Bgayet",

    // Auth
    auth_back: "← Err ɣer usebter amezwaru",
    auth_tagline_login: "ⴰⵣⵓⵍ. ⴽⴽⴻⵏ ⵖⴻⵔ ⵓⵃⴻⵙⵙⴰⴱ-ⵉⴽ.",
    auth_tagline_signup: "Kcem deg tɣiwant n tarwa n tmurt.",
    login_title: "ⴽⴽⴻⵏ",
    login_email: "Tansa n yimɛul",
    login_password: "Awal n uɣilif",
    login_submit: "ⴽⴽⴻⵏ",
    login_submitting: "Itteddu…",
    login_no_account: "Ulac-ik uḥessab?",
    login_signup_link: "ⵉⵔⴰⴳⴻⵎ",
    signup_title: "ⵉⵔⴰⴳⴻⵎ",
    signup_name: "Isem aččar",
    signup_email: "Tansa n yimɛul",
    signup_commune: "ⵜⵓⴷⴷⴰⵔ",
    signup_commune_placeholder: "Fren tuddar-ik…",
    signup_password: "Awal n uɣilif",
    signup_password_placeholder: "6 n yisekkiren",
    signup_submit: "Snulfu uḥessab-iw",
    signup_submitting: "Itteddu…",
    signup_has_account: "Yella-d uḥessab-ik?",
    signup_login_link: "ⴽⴽⴻⵏ",
    odej_access: "ⴰⵎⵢⴰⵡⴰⵍ ODEJ ⴱⴳⴰⵢⴻⵜ",

    // App portal
    app_explore: "ⵙⵙⵏ",
    app_tasks: "Tigawin",
    app_leaderboard: "ⴰⵙⴻⵏⴼⴰⵍ",
    app_progression: "Ilkam",
    app_logout: "ⴼⴼⴻⵖ",
    app_greeting: "ⴰⵣⵓⵍ,",
    app_opportunities: "ⵜⵉⵖⴰⵡⵙⵉⵡⵉⵏ · ⴱⴳⴰⵢⴻⵜ",
    app_register: "ⵉⵔⴰⴳⴻⵎ",
    app_registered: "ⵉⵔⴰⴳⴻⵎ ✓",
    app_full: "ⵉⵎⵍⴰ",
    app_cancel: "ⵙⴼⵙⵙⵓ",
  },
} as const;

// ─── Context ─────────────────────────────────────────────────────────────────

const LangContext = createContext<LangContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("ylb_lang") as Lang) || "FR";
    }
    return "FR";
  });

  const isRTL = lang === "AR";

  function setLang(l: Lang) {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("ylb_lang", l);
    }
  }

  // Apply dir attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang === "AR" ? "ar" : lang === "TZM" ? "zgh" : "fr");
  }, [lang, isRTL]);

  function t(key: keyof typeof translations.FR): string {
    return (translations[lang] as typeof translations.FR)[key] ?? translations.FR[key];
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LangContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}

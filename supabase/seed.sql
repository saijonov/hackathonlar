-- ===========================================================================
-- hackathonlar.uz — seed data
--
-- GENERATED FILE. Edit supabase/seed-data/hackathons.json and run
-- `pnpm seed:generate` instead of editing this file by hand.
--
-- Provenance
-- ----------
-- Every organizer and hackathon below was researched from public sources on
-- 2026-08-25. The `sources:` comment above each record lists where the
-- facts came from. Fields that could not be corroborated are NULL — they are
-- never guessed. Confidence breakdown:
--     verified     13   corroborated on an official site or by two reputable sources
--     partial       7   the event definitely exists; some fields remain uncertain
--     illustrative  1   could NOT be corroborated — see the warning below
--
-- !! ILLUSTRATIVE ENTRIES — REVIEW BEFORE PUBLIC LAUNCH !!
--     nasa-space-apps-challenge-2026-tashkent
--   The global 2026 hackathon date (Nov 14-15, 2026) and the Aug 26, 2026
--   registration opening are confirmed on NASA's own program materials.
--   Tashkent's participation is NOT yet confirmed for 2026 specifically -- it
--   is inferred from a consistent multi-year hosting pattern (local Tashkent
--   event pages existed for 2023, 2024 and 2025). Marked 'illustrative' rather
--   than 'partial' because the Uzbekistan-specific claim for 2026 is a
--   well-grounded projection, not a corroborated fact; drop this entry if the
--   platform requires confirmed-only upcoming events.
-- Delete them, or confirm them, before the site goes public. They are included
-- because the PRD asks for upcoming events and only these were findable.
--
--
-- NO REVIEWS ARE SEEDED HERE, BY DESIGN.
-- The credibility of this platform depends on never fabricating an opinion.
-- Demo reviews for local development live in seed-demo.sql, are attributed to
-- accounts literally named "Demo foydalanuvchi", and must never be loaded into
-- production. See README "Manual steps".
-- ===========================================================================

begin;


-- ---------------------------------------------------------------------------
-- Organizers (16)
-- ---------------------------------------------------------------------------

-- sources: https://ai500.agrobank.uz/ | https://agrobank.uz/ru/about/press-center/agrobank-ai500-hackathon-2025-ni-ishga-tushirdi
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '50d1195d-7b8c-538b-85e6-41427e8aee71', 'agrobank', 'Agrobank',
  null, 'https://agrobank.uz', null,
  'Agrobank — qishloq xoʻjaligi sohasini moliyalashtirishga ixtisoslashgan Oʻzbekistonning yirik davlat tijorat banki. 2025-yilda u IT Community of Uzbekistan bilan hamkorlikda bank, agrotex va boshqa sohalar uchun AI yechimlarini topish maqsadida AI500 Hackathon musobaqasini boshladi.',
  'Agrobank — крупный государственный коммерческий банк Узбекистана, специализирующийся на финансировании аграрного сектора. В 2025 году он запустил AI500 Hackathon в партнёрстве с IT Community of Uzbekistan для поиска AI-решений в банковской сфере, агротехе и других отраслях.',
  'Agrobank is a major state-owned commercial bank in Uzbekistan focused on financing the agricultural sector. In 2025 it launched the AI500 Hackathon in partnership with IT Community of Uzbekistan to source AI solutions for banking, agritech and other industries.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://eventflow.uz/en/events/national-ai-hackathon-fergana | https://hackathons.uz/en/
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  'f48afe2d-106a-5a34-8be4-fe4814bd6244', 'ai-alliance-ngo', 'AI Alliance (NGO)',
  null, null, null,
  'AI Alliance — Oʻzbekistonning National AI Hackathon dasturining bir qancha mintaqaviy bosqichlari (jumladan, Fargʻona bosqichi) uchun ijrochi hamkor sifatida ishlaydigan, IT Park mintaqaviy filiallarida joy tanlash, ishtirokchilarni saralash va sovrinlarni topshirish kabi tashkiliy masalalarni hal qiluvchi NNT.',
  'AI Alliance — НКО, выступающая исполнительным партнёром нескольких региональных этапов узбекистанской программы National AI Hackathon (включая Ферганский этап), отвечающая за организационные вопросы на местах: площадки, отбор участников и выдачу призов на базе региональных филиалов IT Park.',
  'AI Alliance is an NGO that acts as an implementing partner for several regional legs of Uzbekistan''s National AI Hackathon program (including the Fergana stage), handling on-the-ground logistics such as venue bookings, eligibility screening and prize distribution at IT Park regional branches.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://angelconnect.uz/samarcand_hackathon | https://www.spot.uz/oz/2025/07/21/ai-samarqand
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '36164a1a-003a-5e11-8ed1-3f3c42ba2e3f', 'angel-connect', 'Angel Connect',
  null, 'https://angelconnect.uz', null,
  'Angel Connect — Markaziy Osiyoda faoliyat yurituvchi, asoschilar, investorlar va mentorlarni bogʻlaydigan startap-ekotizim platformasi. 2025-yil avgust oyida u IT Park bilan hamkorlikda School 21 va Hilton Samarkand maydonlarida oʻtkazilgan uch kunlik AI Hackathon Samarkand 2025 hakatonini tashkil etdi.',
  'Angel Connect — платформа стартап-экосистемы, работающая в Центральной Азии и объединяющая основателей, инвесторов и менторов. В августе 2025 года в сотрудничестве с IT Park она организовала AI Hackathon Samarkand 2025 — трёхдневный AI-хакатон, прошедший на площадках School 21 и Hilton Samarkand.',
  'Angel Connect is a startup-ecosystem platform operating across Central Asia that connects founders, investors and mentors. In August 2025, in collaboration with IT Park, it organized the AI Hackathon Samarkand 2025, a three-day AI-focused hackathon held at School 21 and the Hilton Samarkand.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://centralasian.uz/university_community/yj5sskdoy1-cau-tech-hackathon-2026-how-one-of-the-r | https://tuit.uz/en/post/cau-tech-hackathon-2026
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '783b1089-7c71-5364-8614-db2c09ec0416', 'central-asian-university', 'Central Asian University (CAU)',
  null, 'https://centralasian.uz', null,
  '2019-yilda tashkil etilgan (avvalgi nomi AKFA University) va 2023-yilda qayta nomlangan Markaziy Osiyo universiteti (CAU) — Toshkentda joylashgan, tibbiyot, muhandislik va biznes yoʻnalishlarida ingliz tilida taʼlim beruvchi xususiy universitet. U Cisco kabi hamkorlar qoʻllab-quvvatlashida mintaqadagi eng katta talabalar texnologik musobaqalaridan biri boʻlgan CAU Tech Hackathonni oʻtkazadi.',
  'Центральноазиатский университет (CAU), основанный в 2019 году (ранее AKFA University) и переименованный в 2023 году, — частный университет в Ташкенте с обучением на английском языке по медицине, инженерии и бизнесу. Он проводит CAU Tech Hackathon — один из крупнейших студенческих технологических конкурсов региона, при поддержке партнёров, включая Cisco.',
  'Central Asian University (CAU), founded in 2019 (formerly AKFA University) and rebranded in 2023, is a private university in Tashkent offering English-medium programs in medicine, engineering and business. It runs the CAU Tech Hackathon, one of the region''s larger student technology competitions, with support from partners such as Cisco.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://cbu.uz/uz/press_center/news/3457527/
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '549c5a71-dc2a-5266-8b29-e7ca89aab50f', 'central-bank-of-uzbekistan', 'Central Bank of the Republic of Uzbekistan',
  null, 'https://cbu.uz', null,
  'Oʻzbekiston Respublikasi Markaziy banki (CBU) — mamlakatning pul-kredit siyosati regulyatori va moliyaviy nazorat organi. 2026-yilda u Smart Banking va fintex sohasidagi yechimlarni topish uchun ''Kod va gʻoyalar jangi'' nomli CBU Coding Hackathon musobaqasini boshladi — bu besh yil ichida 20 dan ortiq fintex-hakaton oʻtkazish rejasining bir qismidir.',
  'Центральный банк Республики Узбекистан (CBU) — денежно-кредитный регулятор и финансовый надзорный орган страны. В 2026 году он запустил CBU Coding Hackathon («Kod va gʻoyalar jangi») для поиска решений в сфере Smart Banking и финтеха — часть более широкого плана провести свыше 20 финтех-хакатонов за пять лет.',
  'The Central Bank of the Republic of Uzbekistan (CBU) is the country''s monetary authority and financial regulator. In 2026 it launched the CBU Coding Hackathon (''Kod va g''oyalar jangi'') to source Smart Banking and fintech solutions, part of a wider plan to run more than 20 fintech hackathons over five years.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://gdg.community.dev/events/details/google-gdg-qarshi-presents-build-with-ai-hackathon-karshi-2026/
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '03a453c0-5a03-5fd9-823c-d8700a4257cc', 'gdg-qarshi', 'Google Developer Groups (GDG) Qarshi',
  null, null, null,
  'Google Developer Groups (GDG) Qarshi — Qarshi shahridagi Google dasturchilar hamjamiyatining mahalliy boʻlimi boʻlib, Google''ning dasturchilar uchun global dasturi tarkibiga kiradi. 2026-yil aprel oyida u Qarshi davlat texnika universitetida ''Build with AI Hackathon - Karshi 2026'' hakatonini tashkil etdi.',
  'Google Developer Groups (GDG) Qarshi — местное отделение сообщества разработчиков Google в городе Карши (Кашкадарьинская область), часть глобальной программы Google для разработчиков. В апреле 2026 года оно организовало хакатон «Build with AI Hackathon - Karshi 2026» в Каршинском государственном техническом университете.',
  'Google Developer Groups (GDG) Qarshi is the local Google Developer Group chapter for Qarshi (Karshi), Uzbekistan, part of Google''s global community program for developers. In April 2026 it organized the ''Build with AI Hackathon - Karshi 2026'' at Karshi State Technical University.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://inha.uz/general/inha-it-park-cup-hackathon-2025-%F0%9F%94%B9/
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '09f59a44-6d6f-56ae-8fe9-fcca80220df2', 'inha-university-tashkent', 'Inha University in Tashkent',
  null, 'https://inha.uz', null,
  'Toshkentdagi Inha universiteti (IUT) — Janubiy Koreyaning Inha universiteti filiali boʻlib, axborot-kommunikatsiya texnologiyalari boʻyicha taʼlim beradi va Oʻzbekistonda hakatonlarda eng faol ishtirok etadigan universitetlardan biri hisoblanadi. U IT Park Uzbekistan bilan birgalikda Navruz Hackathon / INHA & IT Park CUP kabi muntazam hakatonlarni tashkil etadi.',
  'Университет Инха в Ташкенте (IUT) — филиал южнокорейского университета Инха, обучающий информационным и коммуникационным технологиям; один из самых активных вузов Узбекистана по участию в хакатонах. Совместно с IT Park Uzbekistan он соорганизует регулярные хакатоны, такие как Navruz Hackathon / INHA & IT Park CUP.',
  'Inha University in Tashkent (IUT) is a branch campus of South Korea''s Inha University teaching information and communication technology, and it is one of Uzbekistan''s most active hackathon-participating universities. Together with IT Park Uzbekistan it co-organizes recurring hackathons such as the Navruz Hackathon / INHA & IT Park CUP.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://it-park.uz/en/itpark
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '200d22ed-1601-518e-866a-9680aca12cdd', 'it-park-uzbekistan', 'IT Park Uzbekistan',
  null, 'https://it-park.uz', null,
  'IT Park Uzbekistan — Oʻzbekistonning davlat qoshidagi texnopark va IT sohasini rivojlantirish agentligi boʻlib, rezident texnologik kompaniyalar va startaplar uchun soliq imtiyozlari, infratuzilma va dasturlar taqdim etadi. U mamlakatdagi eng faol hakaton tashkilotchisi hisoblanadi: Milliy AI-xakaton, Navruz Hackathon, Open Data Challenge va President Tech Award hakaton yoʻnalishi kabi tadbirlarni oʻtkazadi yoki hammuallif sifatida ishtirok etadi. Tashkilot Raqamli texnologiyalar vazirligi bilan hamkorlikda faoliyat yuritadi.',
  'IT Park Uzbekistan — государственный технопарк и агентство развития IT-отрасли Узбекистана, предоставляющее налоговые льготы, инфраструктуру и программы для резидентных технологических компаний и стартапов. Это самый частый организатор хакатонов в стране: он проводит или соорганизует такие мероприятия, как National AI Hackathon, Navruz Hackathon, Open Data Challenge и хакатон-трек President Tech Award. Работает при координации Министерства цифровых технологий.',
  'IT Park Uzbekistan is the state-backed technology park and IT sector development agency of Uzbekistan, providing tax incentives, infrastructure and programs for resident tech companies and startups. It is the country''s most frequent hackathon organizer, running or co-running events such as the National AI Hackathon, Navruz Hackathon, Open Data Challenge and the President Tech Award hackathon track. It operates under the coordination of the Ministry of Digital Technologies.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://gov.uz/en/digital/news/view/153647 | https://digital.uz
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '994ed103-717b-5623-8377-f9521c6ebee2', 'ministry-of-digital-technologies-uzbekistan', 'Ministry of Digital Technologies of the Republic of Uzbekistan',
  null, 'https://digital.uz', null,
  'Oʻzbekiston Respublikasi Raqamli texnologiyalar vazirligi — mamlakatning raqamlashtirish siyosati, elektron hukumat va IT sohasini rivojlantirish uchun javobgar davlat organi. U IT Park Uzbekistan va tarmoq vazirliklari bilan birgalikda Milliy AI-xakaton va President Tech Award kabi yirik milliy tanlovlarni tashkil etadi va moliyalashtiradi.',
  'Министерство цифровых технологий Республики Узбекистан — государственный орган, отвечающий за политику цифровизации страны, электронное правительство и развитие IT-отрасли. Оно инициирует и совместно финансирует крупные национальные конкурсы, такие как National AI Hackathon и President Tech Award, работая совместно с IT Park Uzbekistan и отраслевыми министерствами.',
  'The Ministry of Digital Technologies is the government body responsible for Uzbekistan''s digitalization policy, e-government and IT industry development. It initiates and co-funds large national competitions such as the National AI Hackathon and the President Tech Award, working together with IT Park Uzbekistan and sector ministries.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://www.uzdaily.uz/en/yandex-uzbekistan-partners-for-national-transport-hackathon/ | https://hackathon.mintrans.uz/
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '7525d809-772f-5f89-8e53-069c1d0ddd80', 'ministry-of-transport-uzbekistan', 'Ministry of Transport of the Republic of Uzbekistan',
  null, 'https://mintrans.uz', null,
  'Oʻzbekiston Respublikasi Transport vazirligi aviatsiya, temir yoʻl va avtomobil transporti sohasidagi siyosatni belgilaydi. 2026-yilda u Yandex Uzbekistan bilan hamkorlikda transport sohasini AI yechimlari yordamida raqamlashtirishga qaratilgan mamlakatdagi birinchi Milliy transport hakatonini boshladi.',
  'Министерство транспорта Республики Узбекистан отвечает за политику в сфере авиации, железнодорожного и автомобильного транспорта. В 2026 году оно совместно с Yandex Uzbekistan запустило первый в стране National Transport Hackathon, направленный на цифровизацию транспортной отрасли с помощью AI-решений.',
  'The Ministry of Transport oversees aviation, rail and road transport policy in Uzbekistan. In 2026 it partnered with Yandex Uzbekistan to launch the country''s first National Transport Hackathon, aimed at digitalizing the transport sector with AI-based solutions.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://it-park.uz/en/itpark/news/national-selection-for-the-international-competition-red-bull-basement-launched-in-uzbekistan
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  'd541cab4-6f51-5713-8dbc-a598e7b40076', 'red-bull-uzbekistan', 'Red Bull Basement Uzbekistan (Red Bull)',
  null, 'https://www.redbull.com/int-en/event-series/basement', null,
  'Red Bull Basement — Red Bullning yosh texnologik innovatorlar uchun oʻnlab davlatlarda milliy tanlov mahalliy hamkori bilan har yili oʻtkaziladigan global dasturi. Oʻzbekistonda milliy tanlovni IT Park Uzbekistan oʻtkazadi, gʻolib jamoa esa Red Bull Basement xalqaro finaliga yoʻl oladi.',
  'Red Bull Basement — глобальная программа Red Bull для молодых технологических инноваторов, ежегодно проводимая с местным партнёром национального отбора в десятках стран. В Узбекистане национальный отбор проводит IT Park Uzbekistan, победившая команда отправляется на международный финал Red Bull Basement.',
  'Red Bull Basement is Red Bull''s global program for young tech innovators, run annually with a local national-selection partner in dozens of countries. In Uzbekistan, IT Park Uzbekistan runs the national selection, sending the winning team to Red Bull Basement''s international final.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://tech4impact.uz/en/events/9-noyabrya-technovation-girls-i-yandex-uzbekistan-priglashayut-devushek-i-parnej-15-25-let-na-hakaton-v-fergane/ | https://www.uzdaily.uz/en/uzbekistan-launches-the-tenth-season-of-the-international-technovation-girls-program/
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '12f6f32e-9fbc-597a-8220-d259ff67be64', 'tech4impact-uzbekistan', 'Tech4Impact (Technovation Girls Uzbekistan)',
  null, 'https://tech4impact.uz', null,
  'Tech4Impact — Oʻzbekistondagi Technovation Girls Uzbekistan dasturini amalga oshiradigan NNT boʻlib, bu qizlar va yoshlar uchun umummilliy texnologiya va tadbirkorlik tashabbusi hisoblanadi; 2026-yilda u Raqamli texnologiyalar vazirligi, Raqamli taʼlimni rivojlantirish markazi va Yandex Uzbekistan bilan hamkorlikda oʻninchi mavsumini oʻtkazmoqda. Tashkilot yoʻl xavfsizligi va aqlli shahar yechimlariga bagʻishlangan Fargʻonadagi kabi mintaqaviy hakatonlarni tashkil etadi.',
  'Tech4Impact — узбекская НКО, реализующая программу Technovation Girls Uzbekistan — общенациональную инициативу по технологиям и предпринимательству для девушек и молодёжи, которая в 2026 году проходит уже в десятый раз совместно с Министерством цифровых технологий, Центром развития цифрового образования и Yandex Uzbekistan. Организация проводит региональные хакатоны, в том числе в Фергане по темам безопасности дорожного движения и умного города.',
  'Tech4Impact is the Uzbek NGO that runs the Technovation Girls Uzbekistan program, a nationwide technology and entrepreneurship initiative for girls and young people now in its tenth season (2026), implemented with the Ministry of Digital Technologies, the Center for Digital Education Development and Yandex Uzbekistan. It organizes regional hackathons, including one in Fergana on road-safety and smart-city solutions.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://tuit.uz/en/post/innoweek-2024-doirasida-urbantech-uzbekistan-2024-xakaton-musobaqasi
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  'c544f705-bc00-5c60-828b-e05faea25616', 'tuit', 'Tashkent University of Information Technologies named after Muhammad al-Khwarizmi (TUIT)',
  null, 'https://tuit.uz', null,
  'TUIT — Oʻzbekistonning axborot-kommunikatsiya texnologiyalari sohasidagi yetakchi davlat universiteti. U oʻz hududida InnoWeek-2024 doirasidagi Urban.Tech Uzbekistan va Computer Vision AI Challenge kabi hakatonlarni muntazam ravishda oʻtkazadi yoki hammuallif sifatida ishtirok etadi.',
  'TUIT — ведущий государственный университет Узбекистана в сфере информационно-коммуникационных технологий. Он регулярно принимает или соорганизует хакатоны на своей территории, включая Urban.Tech Uzbekistan в рамках InnoWeek-2024 и Computer Vision AI Challenge.',
  'TUIT is Uzbekistan''s leading public university for information and communication technologies. It regularly hosts or co-hosts hackathons on its campus, including the Urban.Tech Uzbekistan hackathon during InnoWeek-2024 and the Computer Vision AI Challenge.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://www.unicef.org/uzbekistan/en/press-releases/ecology-art-technology-young-people-offer-creative-solutions-environmental-problems
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  'c51d529e-b881-5f10-8bf9-9f300da71f1e', 'unicef-uzbekistan', 'UNICEF Uzbekistan',
  null, 'https://www.unicef.org/uzbekistan/', null,
  'UNICEF Uzbekistan — BMTning Bolalar jamgʻarmasining Oʻzbekistondagi vakolatxonasi boʻlib, bolalar huquqlari, taʼlim va yoshlarni qoʻllab-quvvatlash sohasida faoliyat yuritadi. 2025-yil iyun oyida u School 21 dasturlash maktabi bilan hamkorlikda (Click va Huawei qoʻllab-quvvatlashida) Toshkentda ''Ekologiya, sanʼat, texnologiya'' yoshlar hakatonini oʻtkazdi.',
  'UNICEF Uzbekistan — узбекистанское представительство Детского фонда ООН, работающее в сфере прав детей, образования и поддержки молодёжи. В июне 2025 года совместно со школой программирования School 21 (при поддержке Click и Huawei) организация провела молодёжный хакатон «Экология, искусство, технологии» в Ташкенте.',
  'UNICEF Uzbekistan is the Uzbekistan country office of the United Nations Children''s Fund, working on child rights, education and youth empowerment. In June 2025 it partnered with the School 21 coding school (with support from Click and Huawei) to run the ''Ecology, Art, Technology'' youth hackathon in Tashkent.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://gov.uz/en/uzspace/news/view/65760 | https://www.spaceappschallenge.org/2025/local-events/tashkent/
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  '8fc43eac-ab15-5c9b-852a-0c78762b1c5b', 'uzbekkosmos-agency', 'Uzbekkosmos Agency',
  null, 'https://uzspace.uz', null,
  'Uzbekkosmos — Raqamli texnologiyalar vazirligi qoshida faoliyat yurituvchi Oʻzbekistonning milliy kosmik agentligi. U kamida 2023-yildan beri har yili Toshkentda NASA Space Apps Challenge mahalliy tadbirlarini tashkil etib, talaba va dasturchilarga NASA''ning yillik global hakatoni doirasida kosmik va Yer maʼlumotlariga asoslangan yechimlar yaratish imkonini beradi.',
  'Uzbekkosmos — национальное космическое агентство Узбекистана, действующее при Министерстве цифровых технологий. Оно организует ташкентские локальные мероприятия NASA Space Apps Challenge ежегодно, по меньшей мере с 2023 года, давая студентам и разработчикам возможность создавать решения на основе космических и земных данных в рамках ежегодного глобального хакатона NASA.',
  'Uzbekkosmos is Uzbekistan''s national space agency, operating under the Ministry of Digital Technologies. It has organized Uzbekistan''s local NASA Space Apps Challenge editions in Tashkent every year since at least 2023, giving students and developers a chance to build space- and Earth-data solutions as part of NASA''s global annual hackathon.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;

-- sources: https://newuu.uz/news/view/184 | https://yesu.uz/en/site/about
insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  'd116ef72-7d3e-59cb-8170-5b8b59319a87', 'young-economists-society-uzbekistan', 'Young Economists Society of Uzbekistan (YESU)',
  null, 'https://yesu.uz', null,
  'Oʻzbekiston Yosh Iqtisodchilar Jamiyati (YESU) — yosh oʻzbek iqtisodchilarining ilmiy-tadqiqot faoliyati, taʼlimi va kasbiy rivojlanishini qoʻllab-quvvatlaydigan yoshlar NNTsi. 2024-yil dekabrida u New Uzbekistan University bilan hamkorlikda, Iqtisodiy tadqiqotlar va islohotlar markazi, UZCARD va Kapitalbank qoʻllab-quvvatlashida mintaqaviy iqtisodiy muammolarga bagʻishlangan hakaton tashkil etdi.',
  'Общество молодых экономистов Узбекистана (YESU) — молодёжная НКО, продвигающая экономические исследования, образование и карьерное развитие молодых узбекских экономистов. В декабре 2024 года совместно с New Uzbekistan University оно организовало хакатон по региональным экономическим проблемам при поддержке Center for Economic Research and Reforms, UZCARD и Kapitalbank.',
  'The Young Economists Society of Uzbekistan (YESU) is a youth-focused NGO promoting economic research, education and career development for young Uzbek economists. In December 2024, together with New Uzbekistan University, it organized a hackathon on regional economic challenges with support from the Center for Economic Research and Reforms, UZCARD and Kapitalbank.'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;


-- ---------------------------------------------------------------------------
-- Hackathons (21)
-- All seeded as status = 'approved': they are researched, not user-submitted.
-- ---------------------------------------------------------------------------

-- [verified] AI500! Hackathon 2025
--   Final date (Dec 13, 2025), team counts and prize figures confirmed across
--   gazeta.uz, daryo.uz and agrobank.uz. Exact launch/kickoff date of the
--   hackathon (as opposed to the Nov 25 registration deadline) was not found
--   in available sources, so start_date is left null.
-- sources: https://www.gazeta.uz/oz/2025/12/16/agrobank/ | https://agrobank.uz/ru/about/press-center/agrobank-ai500-hackathon-2025-ni-ishga-tushirdi | https://ai500.agrobank.uz/
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  'ab7b7a02-afb2-5af1-8162-90903dc721bb', 'ai500-hackathon-2025', 'AI500! Hackathon 2025', '50d1195d-7b8c-538b-85e6-41427e8aee71',
  'AI500! Hackathon 2025 — Agrobank tomonidan IT Community of Uzbekistan bilan hamkorlikda tashkil etilgan umummilliy AI-hakaton boʻlib, unga 2500 dan ortiq ariza tushgan va 1345 jamoa roʻyxatdan oʻtgan. 50 finalchi jamoa 2025-yil 13-dekabrda Toshkentdagi Agrobank bosh binosida agrotex, fintex va bank xizmatlari boʻyicha AI yechimlarini taqdim etib, 500 million soʻmgacha boʻlgan mukofot jamgʻarmasi uchun bellashdi. Gʻolib Apollo jamoasi oʻsimlik kasalliklarini fotosurat orqali aniqlaydigan tizimi uchun 200 million soʻmlik bosh sovrinni qoʻlga kiritdi.',
  'AI500 Hackathon 2025 — общенациональный AI-хакатон, организованный Agrobank совместно с IT Community of Uzbekistan; на него поступило более 2500 заявок, зарегистрировалось 1345 команд. 50 команд-финалистов представили AI-решения для агротеха, финтеха и банковской сферы в головном офисе Agrobank в Ташкенте 13 декабря 2025 года, соревнуясь за призовой фонд до 500 миллионов сумов. Команда-победитель Apollo получила главный приз в 200 миллионов сумов за систему, определяющую болезни растений по фотографиям.',
  'AI500 Hackathon 2025 was a nationwide AI hackathon organized by Agrobank together with IT Community of Uzbekistan, drawing over 2,500 applications and 1,345 registered teams. Fifty finalist teams presented AI solutions for agritech, fintech and banking at Agrobank''s Tashkent headquarters on December 13, 2025, competing for a prize pool of up to 500 million so''m. The winning team, Apollo, took the 200-million-so''m grand prize for an AI system that detects plant diseases from photos and recommends treatment.',
  'Tashkent', 'offline', null, '2025-12-13'::date,
  '500 000 000 so''m (grand prize 200 000 000 so''m)', array['Fintech', 'Agritech', 'Banking services', 'AI']::text[], 'https://ai500.agrobank.uz/', null, 'https://ai500.agrobank.uz/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] National AI Hackathon — Bukhara Stage
--   Concluding date (April 14, 2026), venue and the presidential visit
--   corroborated across gov.uz and test.yuz.uz coverage. The exact start date
--   of the five-day program was not stated in the sources reviewed, so
--   start_date is left null. Regional leg of the original
--   'national-ai-hackathon-2025-regional-stages' entry, see the accompanying
--   correction.
-- sources: https://gov.uz/en/digital/news/view/153647 | https://test.yuz.uz/en/news/news-olpVaa | https://www.facebook.com/itparkuzb/posts/ai-hackathon-2026-kicked-off-in-bukhara-how-is-the-day-goingai-hackathon-2026-is/1844526573422418/
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '71152c2b-d975-580a-8d62-1be24d432882', 'national-ai-hackathon-bukhara-stage-2026', 'National AI Hackathon — Bukhara Stage', '994ed103-717b-5623-8377-f9521c6ebee2',
  'National AI Hackathonning Buxoro bosqichi 2026-yil 14-aprelda Buxorodagi sport majmuasida yakunlangan besh kunlik intensiv dastur boʻlib, hakaton bu mintaqada birinchi marta oʻtkazildi. Tadbirni Oʻzbekiston Prezidenti Shavkat Mirziyoyev va Qozogʻiston Prezidenti Qasim-Jomart Toqayev tashrif buyurgani bilan ajralib turdi; dastur TOP-15 finalchi jamoa venchur fondlar va startap vakillari oldida taqdimot qilgan Demo Day bilan yakunlandi.',
  'Бухарский этап National AI Hackathon стал пятидневной интенсивной программой, завершившейся 14 апреля 2026 года на спортивном комплексе в Бухаре — впервые хакатон прошёл в этом регионе. Мероприятие посетили президент Узбекистана Шавкат Мирзиёев и президент Казахстана Касым-Жомарт Токаев; программа завершилась Demo Day, где ТОП-15 команд-финалистов представили проекты венчурным фондам и представителям стартапов.',
  'The Bukhara stage of the National AI Hackathon was a five-day intensive program that concluded April 14, 2026 at a sports complex in Bukhara -- the first time the hackathon was held in that region. It drew a visit from President Shavkat Mirziyoyev of Uzbekistan and President Kassym-Jomart Tokayev of Kazakhstan, and ended with a Demo Day where a TOP-15 of finalist teams pitched to venture funds and startup representatives.',
  'Bukhara', 'offline', null, '2026-04-14'::date,
  null, array['Healthcare', 'Education', 'Entrepreneurship']::text[], 'https://ai-hackathon.uz/', null, 'https://ai-hackathon.uz/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] National Transport Hackathon 2026
--   Organizer, venue, format (three-day offline sprint at Radisson Blu
--   Tashkent) and prize pool are confirmed via UzDaily and the event's own
--   site (hackathon.mintrans.uz). Exact calendar dates were not stated
--   explicitly in the sources reviewed (a secondary aggregator, hackathons.uz,
--   suggests early-to-mid August 2026), so start/end dates are left null
--   rather than guessed.
-- sources: https://www.uzdaily.uz/en/yandex-uzbekistan-partners-for-national-transport-hackathon/ | https://hackathon.mintrans.uz/
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  'b18b4a9b-eee1-5dee-860f-2bb370302991', 'national-transport-hackathon-2026', 'National Transport Hackathon 2026', '7525d809-772f-5f89-8e53-069c1d0ddd80',
  'Oʻzbekistondagi birinchi Milliy transport hakatoni Transport vazirligi tomonidan Yandex Uzbekistan va Raqamli transport markazi bilan hamkorlikda tashkil etildi. Jamoalar Toshkentdagi Radisson Blu mehmonxonasida uch kunlik oflayn marafon davomida aviatsiya, temir yoʻl va avtomobil transporti uchun raqamli xizmatlar va AI yechimlarini yaratib, 320 million soʻmlik mukofot jamgʻarmasi uchun bellashdi. Transport vaziri Ilhom Mahkamov vazirlik hakatonni doimiy yillik tadbirga aylantirishni rejalashtirayotganini bildirdi.',
  'Первый в Узбекистане National Transport Hackathon был организован Министерством транспорта совместно с Yandex Uzbekistan и Центром цифрового транспорта. Команды провели трёхдневный офлайн-марафон в отеле Radisson Blu в Ташкенте, создавая цифровые сервисы и AI-решения для авиации, железнодорожного и автомобильного транспорта, соревнуясь за призовой фонд в 320 миллионов сумов. Министр транспорта Илхом Махкамов заявил, что министерство намерено сделать хакатон регулярным ежегодным мероприятием.',
  'Uzbekistan''s first National Transport Hackathon was organized by the Ministry of Transport together with Yandex Uzbekistan and the Center for Digital Transport. Teams spent a three-day offline sprint at the Radisson Blu Hotel in Tashkent building digital services and AI solutions for aviation, rail and road transport, competing for a 320-million-so''m prize fund. Transport Minister Ilkhom Makhkamov said the ministry intends to make the hackathon a recurring annual event.',
  'Tashkent', 'offline', null, null,
  '320 000 000 so''m', array['Aviation', 'Rail transport', 'Road transport', 'AI for public mobility', 'Big data analytics']::text[], 'https://hackathon.mintrans.uz/', null, 'https://hackathon.mintrans.uz/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [partial] Red Bull Basement Uzbekistan 2026
--   Existence of the 2026 Uzbekistan edition and regional meet-ups (Namangan,
--   Fergana, Khorezm, Jan-Feb 2026) confirmed via startupbase.uz and Red
--   Bull's own FAQ page. The exact date of the Tashkent national final was not
--   found in sources reviewed, so start/end dates are left null; the prize is
--   non-monetary (advancement to the international final), so prize_pool is
--   null.
-- sources: https://startupbase.uz/en/events/red-bull-basement-uzbekistan-2026-meet-up-in-naman | https://www.redbull.com/int-en/event-series/basement/red-bull-basement-2026-faq | https://it-park.uz/en/itpark/news/national-selection-for-the-international-competition-red-bull-basement-launched-in-uzbekistan
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '0e1860c5-6943-529e-877c-60fd575a1ef7', 'red-bull-basement-uzbekistan-2026', 'Red Bull Basement Uzbekistan 2026', 'd541cab4-6f51-5713-8dbc-a598e7b40076',
  'Red Bull Basement Uzbekistan 2026 — Red Bullning yosh innovatorlar uchun global dasturining oʻzbek milliy bosqichi boʻlib, IT Park Uzbekistan milliy hamkor sifatida ishtirok etadi. 2026-yil yanvar-fevral oylarida Namangan, Fargʻona va Xorazmda mintaqaviy uchrashuvlar boʻlib oʻtdi, soʻngra Toshkentda milliy final tashkil etildi; unda gʻolib jamoa Microsoft qoʻllab-quvvatlashi va xorijga safar imkoniyati bilan Red Bull Basement xalqaro finaliga yoʻl oldi.',
  'Red Bull Basement Uzbekistan 2026 — узбекский национальный этап глобальной программы Red Bull для молодых инноваторов, проводимый с IT Park Uzbekistan в качестве национального партнёра. В январе-феврале 2026 года прошли региональные встречи в Намангане, Фергане и Хорезме, за которыми последовал национальный финал в Ташкенте, где команда-победитель получила место в международном финале Red Bull Basement с доступом к поддержке Microsoft и поездкой за рубеж.',
  'Red Bull Basement Uzbekistan 2026 was the Uzbek national leg of Red Bull''s global youth-innovation program, run with IT Park Uzbekistan as national partner. It included regional meet-ups in Namangan, Fergana and Khorezm in January-February 2026, leading to a national final in Tashkent, where the winning team earned a place at the international Red Bull Basement final, with access to Microsoft support and a trip abroad.',
  'Tashkent', 'hybrid', null, null,
  null, array['AI for social impact', 'Youth entrepreneurship']::text[], 'https://www.redbull.com/int-en/event-series/basement/red-bull-basement-2026-faq', null, null,
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] President Tech Award 2024 — Hackathon
--   Dates, venue, participant numbers and winner corroborated by
--   outsource.gov.uz and digital.uz. A 2025 edition's hackathon pre-selection
--   stage was also reported (70 teams advanced) but full results for that
--   edition were not found, so only the 2024 edition is included here.
-- sources: https://www.outsource.gov.uz/en/media/president-tech-award-2024-hackathon-results | https://digital.uz/en/news/view/22623
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  'e0cfb372-f075-5342-8572-ed1529c730c2', 'president-tech-award-2024-hackathon', 'President Tech Award 2024 — Hackathon', '200d22ed-1601-518e-866a-9680aca12cdd',
  'Umumiy mukofot jamgʻarmasi 1 000 000 dollar boʻlgan davlat startap tanlovi — President Tech Award 2024 ning hakaton yoʻnalishi 2024-yil 20-22-sentyabrda Toshkentdagi Turin Politexnika universitetida oʻtkazildi; tashkilotchi IT Park Uzbekistan boʻlib, Raqamli texnologiyalar vazirligi qoʻllab-quvvatladi. 260 dan ortiq ishtirokchi 70 jamoaga birlashib, 72 soat ichida taʼlim, sogʻliqni saqlash, AI, qishloq xoʻjaligi, yashil energetika va fintex sohalarida raqamli prototiplar yaratdi. Gʻolib Lorem Ipsum jamoasi koʻngilochar kontentni taʼlim materialiga aylantiruvchi Focuscore AI platformasi uchun 100 000 dollarlik hakaton sovrinini qoʻlga kiritdi.',
  'Хакатон-трек President Tech Award 2024 — государственного конкурса стартапов с общим призовым фондом $1 000 000 — прошёл 20-22 сентября 2024 года в Туринском политехническом университете в Ташкенте; организатором выступил IT Park Uzbekistan при поддержке Министерства цифровых технологий. Более 260 участников сформировали 70 команд и за 72 часа создали цифровые прототипы в сферах образования, здравоохранения, AI, сельского хозяйства, зелёной энергетики и финтеха. Команда-победитель Lorem Ipsum получила приз в $100 000 за платформу Focuscore AI, превращающую развлекательный контент в образовательные материалы.',
  'The Hackathon track of the President Tech Award 2024 -- a state-backed startup competition with a $1,000,000 total prize pool -- was held September 20-22, 2024 at Turin Polytechnic University in Tashkent, organized by IT Park Uzbekistan with support from the Ministry of Digital Technologies. More than 260 participants formed 70 teams and built 72-hour digital prototypes across sectors including education, healthcare, AI, agriculture, green energy and fintech. The winning team, Lorem Ipsum, took the $100,000 hackathon prize with Focuscore AI, a platform that converts entertainment content into educational material.',
  'Tashkent', 'offline', '2024-09-20'::date, '2024-09-22'::date,
  '$100 000 (hackathon track; part of a $1 000 000 President Tech Award prize pool)', array['Education', 'Healthcare', 'AI', 'Agriculture', 'Green energy', 'Fintech']::text[], 'https://www.outsource.gov.uz/en/media/president-tech-award-2024-hackathon-results', null, null,
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] Technovation Girls & Yandex Uzbekistan Hackathon — Fergana
--   Sources gave slightly different exact dates (November 9 in the
--   Tech4Impact/UzDaily framing vs. November 13 in a UZA.uz article) for what
--   is clearly the same 83-participant, 18-team event in Fergana; both are
--   reflected as a range here (Nov 9-13, 2024) since the single precise day
--   could not be pinned down further. This is a 2024 event and does not count
--   toward the 'upcoming' gap, but adds real city diversity.
-- sources: https://www.uzdaily.uz/en/technovation-girls-and-yandex-uzbekistan-host-hackathon-in-ferghana/ | https://uza.uz/en/posts/fergana-hosts-the-technovation-girls-hackathon_656453 | https://tech4impact.uz/en/events/9-noyabrya-technovation-girls-i-yandex-uzbekistan-priglashayut-devushek-i-parnej-15-25-let-na-hakaton-v-fergane/
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '15ccca59-40dd-5065-8a5e-fc68c56ccb25', 'technovation-girls-yandex-hackathon-fergana-2024', 'Technovation Girls & Yandex Uzbekistan Hackathon — Fergana', '12f6f32e-9fbc-597a-8220-d259ff67be64',
  'Technovation Girls Uzbekistan va Yandex Uzbekistan Fargʻonada 14-25 yoshli 83 ishtirokchi uchun 10 soatlik hakaton oʻtkazdi; ular 18 jamoaga birlashib, yoʻl xavfsizligi, shahar muhitining qulayligi va aqlli shahar muammolariga mobil ilova va no-code yechimlar yaratdi. Olti jamoa maxsus sovrinlar, barcha ishtirokchilar esa sertifikatlar bilan taqdirlandi.',
  'Technovation Girls Uzbekistan и Yandex Uzbekistan провели в Фергане 10-часовой хакатон для 83 участников в возрасте 14-25 лет, объединённых в 18 команд, которые создавали мобильные и no-code решения по безопасности дорожного движения, доступности городской среды и умному городу. Шесть команд получили специальные призы, все участники — сертификаты.',
  'Technovation Girls Uzbekistan and Yandex Uzbekistan held a 10-hour hackathon in Fergana for 83 participants aged 14-25, organized into 18 teams building mobile-app and no-code solutions for road safety, urban accessibility and smart-city problems. Six teams won special prizes and all participants received certificates.',
  'Fergana', 'offline', '2024-11-09'::date, '2024-11-13'::date,
  null, array['Road safety', 'Urban accessibility', 'Smart city']::text[], 'https://tech4impact.uz/en/events/9-noyabrya-technovation-girls-i-yandex-uzbekistan-priglashayut-devushek-i-parnej-15-25-let-na-hakaton-v-fergane/', null, null,
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] Urban.Tech Uzbekistan 2024 Hackathon
--   Dates, venue, participant count and sponsor confirmed via TUIT's article
--   and the InnoWeek-2024 site.
-- sources: https://tuit.uz/en/post/innoweek-2024-doirasida-urbantech-uzbekistan-2024-xakaton-musobaqasi | https://2024.innoweek.uz/news/139
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  'a1eb4d12-406c-5a66-88af-f7766b0299d8', 'urban-tech-uzbekistan-2024-hackathon', 'Urban.Tech Uzbekistan 2024 Hackathon', 'c544f705-bc00-5c60-828b-e05faea25616',
  'Urban.Tech Uzbekistan 2024 — 2024-yil 14-16-noyabr kunlari Toshkentdagi UzExpoCenterda InnoWeek-2024 doirasida oʻtkazilgan, TUIT ishtirokida tashkil etilgan va Janubiy Koreyaning KOICA agentligi homiyligidagi 48 soatlik hakaton. Unda 18-30 yoshli 1200 dan ortiq yosh muhandis va texnologiya ishqibozi ijtimoiy-iqtisodiy va shahar muammolariga yechim yaratdi; taxminan 70 nafar gʻolib taqdirlandi.',
  'Urban.Tech Uzbekistan 2024 — 48-часовой хакатон, прошедший 14-16 ноября 2024 года в UzExpoCenter в Ташкенте в рамках InnoWeek-2024, организованный с участием TUIT и при спонсорской поддержке южнокорейского агентства KOICA. В нём приняли участие более 1200 молодых инженеров и техноэнтузиастов в возрасте 18-30 лет, разрабатывающих решения социально-экономических и городских проблем; было отмечено около 70 победителей.',
  'Urban.Tech Uzbekistan 2024 was a 48-hour hackathon held November 14-16, 2024 at UzExpoCenter in Tashkent as part of InnoWeek-2024, organized with TUIT and sponsored by South Korea''s KOICA. It engaged more than 1,200 young engineers and tech enthusiasts aged 18-30 in building solutions to socio-economic and urban challenges, with about 70 winners recognized.',
  'Tashkent', 'offline', '2024-11-14'::date, '2024-11-16'::date,
  null, array['Urban technology', 'Socio-economic innovation']::text[], 'https://2024.innoweek.uz/news/139', null, null,
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [partial] Young Economists Society of Uzbekistan Hackathon
--   Confirmed via New Uzbekistan University's own news article, which is the
--   only source found describing this specific event; the organizing NGO's
--   existence is separately confirmed via yesu.uz, but no independent second
--   outlet covering this exact hackathon was found, so confidence is 'partial'
--   rather than 'verified'. No prize pool figure was disclosed.
-- sources: https://newuu.uz/news/view/184
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '3c65e201-46f9-5776-8db9-ace5afe6bd65', 'young-economists-society-hackathon-2024', 'Young Economists Society of Uzbekistan Hackathon', 'd116ef72-7d3e-59cb-8170-5b8b59319a87',
  'Oʻzbekiston Yosh Iqtisodchilar Jamiyati hakatoni 2024-yil 7-8-dekabr kunlari Toshkentdagi New Uzbekistan University da boʻlib oʻtdi. Mamlakatning turli burchaklaridan 150 dan ortiq yosh ishtirokchi mintaqaviy iqtisodiy muammolarga yechim ishlab chiqdi va bu borada New Uzbekistan University, Iqtisodiy tadqiqotlar va islohotlar markazi, UZCARD va Kapitalbank mutaxassislaridan mentorlik yordami oldi.',
  'Хакатон Общества молодых экономистов Узбекистана прошёл 7-8 декабря 2024 года в New Uzbekistan University в Ташкенте. Более 150 молодых участников со всей страны разрабатывали решения региональных экономических проблем, получая наставничество от экспертов New Uzbekistan University, Центра экономических исследований и реформ, UZCARD и Kapitalbank.',
  'The Young Economists Society of Uzbekistan Hackathon was held December 7-8, 2024 at New Uzbekistan University in Tashkent. More than 150 young participants from across the country developed solutions to regional economic challenges, mentored by experts from New Uzbekistan University, the Center for Economic Research and Reforms, UZCARD and Kapitalbank.',
  'Tashkent', 'offline', '2024-12-07'::date, '2024-12-08'::date,
  null, array['Regional economic development', 'Public policy']::text[], 'https://newuu.uz/news/view/184', null, null,
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] Open Data Challenge 2025
--   Organizers, participant numbers and winning projects confirmed via IT
--   Park's own results article (published Jan 27, 2025) and independently via
--   the OSCE Project Co-ordinator in Uzbekistan, whose own article identifies
--   this as the seventh edition of the Open Data Challenge, held January
--   24-26, 2025 at New Uzbekistan University in Tashkent, with IT Park, OSCE
--   PCUz and the Statistics Agency of the Republic of Uzbekistan as
--   organizers. Confidence can reasonably be treated as verified now that
--   exact dates and a second independent source are in hand.
-- sources: https://it-park.uz/en/itpark/news/open-data-challenge-2025-hackathon-outcomes-2 | https://uzbekistan.osce.org/project-coordinator-in-uzbekistan/584977
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '59ad4568-95b7-5385-89c3-a408ffe1b520', 'open-data-challenge-2025', 'Open Data Challenge 2025', '200d22ed-1601-518e-866a-9680aca12cdd',
  'Open Data Challenge 2025 — IT Park Uzbekistan tomonidan OAHT (OSCE) Oʻzbekistondagi loyihalar muvofiqlashtiruvchisi va Davlat statistika qoʻmitasi (UzStat) bilan hamkorlikda tashkil etilgan, 2025-yil boshida Toshkentdagi New Uzbekistan University da oʻtkazilgan hakaton. 600 dan ortiq roʻyxatdan oʻtganlar orasidan 155 ishtirokchi 65 jamoaga birlashib, davlat ochiq maʼlumotlariga asoslangan yechimlar yaratdi, jumladan davlat xaridlaridagi nomunosib holatlarni aniqlovchi tizim, nogironligi boʻlgan insonlar uchun AI yordamchisi va qonunchilik boʻyicha chatbot.',
  'Open Data Challenge 2025 — хакатон, организованный IT Park Uzbekistan совместно с Координатором проектов ОБСЕ в Узбекистане и Государственным комитетом по статистике (UzStat), прошедший в New Uzbekistan University в Ташкенте в начале 2025 года. Из более 600 зарегистрировавшихся 155 участников сформировали 65 команд для создания решений на основе открытых государственных данных, включая детектор нарушений в госзакупках, AI-помощника для людей с инвалидностью и чат-бота по вопросам законодательства.',
  'The Open Data Challenge 2025 was a hackathon organized by IT Park Uzbekistan together with the OSCE Project Coordinator in Uzbekistan and the State Statistics Committee (UzStat), held at New Uzbekistan University in Tashkent in early 2025. From over 600 registrants, 155 participants formed 65 teams to build solutions using open government data, including a public-procurement anomaly detector, an AI accessibility assistant and a chatbot answering questions on regulations.',
  'Tashkent', 'offline', '2025-01-24'::date, '2025-01-26'::date,
  null, array['Open data', 'Public procurement transparency', 'Accessibility', 'GovTech']::text[], 'https://it-park.uz/en/itpark/news/open-data-challenge-2025-hackathon-outcomes-2', null, null,
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [partial] Navruz Hackathon 2025 (INHA & IT Park CUP)
--   IT Park's article calls this 'Navruz Hackathon 2025' while Inha
--   University's own article calls the same March 2025 event the 'INHA & IT
--   Park CUP Hackathon 2025' -- both name the same two organizers and the same
--   March 2025 timeframe, but it was not possible to fully confirm whether
--   these are literally one event described two ways or two closely linked
--   events, so the merged end date and the absence of a prize pool figure are
--   uncertain.
-- sources: https://it-park.uz/en/itpark/news/navruz-hackathon-2025-innovation-technology-and-sustainable-development | https://inha.uz/general/inha-it-park-cup-hackathon-2025-%F0%9F%94%B9/
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  'b60ba2c6-f700-59e5-8b36-5dcb5151744b', 'navruz-hackathon-2025', 'Navruz Hackathon 2025 (INHA & IT Park CUP)', '09f59a44-6d6f-56ae-8fe9-fcca80220df2',
  '2025-yil 18-martda Toshkentdagi Inha universiteti va IT Park Uzbekistan tomonidan Raqamli texnologiyalar vazirligi qoʻllab-quvvatlashida boshlangan Navruz Hackathon 2025 — barqaror rivojlanish, AI va raqamli innovatsiyalarga bagʻishlangan bahorgi hakaton. U 113 ishtirokchi, 43 jamoa bilan boshlangan, soʻngra 32 yarim finalchi va 24 finalchi jamoa tanlab olingan; unda Inha, Toshkentdagi Turin Politexnika universiteti, New Uzbekistan University, TUIT va Amity University Tashkent talabalari ishtirok etgan. Gʻolib loyihalar orasida qayta ishlangan qismlardan energiya olish tizimi, oziq-ovqat yaroqlilik muddatini kuzatish tizimi va chiqindixona monitoring platformasi bor.',
  'Navruz Hackathon 2025, запущенный 18 марта 2025 года Университетом Инха в Ташкенте и IT Park Uzbekistan при поддержке Министерства цифровых технологий, — весенний хакатон по устойчивому развитию, AI и цифровым инновациям. Он начался с 113 участников в 43 командах, затем отобрал 32 команды-полуфиналиста и 24 финалиста, привлекая студентов Инха, Туринского политехнического университета в Ташкенте, New Uzbekistan University, TUIT и Amity University Tashkent. Среди победивших проектов — система выработки энергии из переработанных деталей, монитор сроков годности продуктов и платформа мониторинга мусорных полигонов.',
  'Navruz Hackathon 2025, launched March 18, 2025 by Inha University in Tashkent and IT Park Uzbekistan with support from the Ministry of Digital Technologies, was a spring hackathon on sustainable development, AI and digital innovation. It opened with 113 participants in 43 teams, narrowed to 32 semifinalist teams and then 24 finalist teams, drawing students from Inha, Turin Polytechnic University in Tashkent, New Uzbekistan University, TUIT and Amity University Tashkent. Winning projects included an energy-from-recycled-parts system, a food-expiry monitor and a landfill-monitoring platform.',
  'Tashkent', 'offline', '2025-03-18'::date, '2025-03-21'::date,
  null, array['Sustainable development', 'AI', 'Digital innovation']::text[], 'https://inha.uz/general/inha-it-park-cup-hackathon-2025-%F0%9F%94%B9/', null, null,
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] Ecology, Art, Technology Hackathon
--   Dates, organizers, participant numbers and prize total corroborated across
--   UNICEF's own press release, gazeta.uz and spot.uz.
-- sources: https://www.unicef.org/uzbekistan/en/press-releases/ecology-art-technology-young-people-offer-creative-solutions-environmental-problems | https://www.gazeta.uz/ru/2025/06/24/hackathon/ | https://www.spot.uz/ru/2025/05/28/est-hackathon
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  'a22f5c6c-b0ed-51dd-8ba8-c0c673e13678', 'ecology-art-technology-hackathon-2025', 'Ecology, Art, Technology Hackathon', 'c51d529e-b881-5f10-8bf9-9f300da71f1e',
  '''Ekologiya, sanʼat, texnologiya'' hakatoni — 2025-yil 20-21-iyun kunlari Toshkentda oʻtkazilgan, UNICEF Uzbekistan va School 21 dasturlash maktabi tomonidan Click va Huawei qoʻllab-quvvatlashida tashkil etilgan ikki kunlik tadbir. 800 dan ortiq ariza orasidan Oʻzbekistonning barcha mintaqalaridan 18-30 yoshli 100 ishtirokchi tanlab olindi; ular jamoalar boʻlib texnologiya va sanʼatni birlashtirib ekologik muammolarga yechim topdi va 100 million soʻmlik sovrin va grantlar uchun bellashdi.',
  'Хакатон «Экология, искусство, технологии» — двухдневное мероприятие 20-21 июня 2025 года в Ташкенте, организованное UNICEF Uzbekistan и школой программирования School 21 при поддержке Click и Huawei. Из более 800 заявок было отобрано 100 участников в возрасте 18-30 лет из всех регионов Узбекистана, которые в командах сочетали технологии и искусство для решения экологических проблем, соревнуясь за 100 миллионов сумов призов и грантов.',
  'The ''Ecology, Art, Technology'' hackathon was a two-day event held June 20-21, 2025 in Tashkent, organized by UNICEF Uzbekistan and the School 21 coding school with support from Click and Huawei. From more than 800 applications, 100 participants aged 18-30 from across Uzbekistan were selected to form teams that combined technology and art to address environmental problems, competing for 100 million so''m in prizes and grants.',
  'Tashkent', 'offline', '2025-06-20'::date, '2025-06-21'::date,
  '100 000 000 so''m (prizes and grants)', array['Ecology', 'Art', 'Technology', 'Sustainability']::text[], 'https://www.unicef.org/uzbekistan/en/press-releases/ecology-art-technology-young-people-offer-creative-solutions-environmental-problems', null, null,
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] AI Hackathon Samarkand 2025
--   Dates, organizer, venue and format corroborated across Angel Connect's own
--   event page, spot.uz's registration announcement and startupbase.uz. This
--   is a standalone privately-run hackathon, distinct from the government-run
--   National AI Hackathon's later Samarkand stage (Jan 2026) listed separately
--   in this file.
-- sources: https://angelconnect.uz/samarcand_hackathon | https://www.spot.uz/oz/2025/07/21/ai-samarqand | https://startupbase.uz/en/events/ai-hackathon-samarkand-2025
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '6d6a4129-ef7b-5e3b-8fd8-345cfc1a3de4', 'ai-hackathon-samarkand-2025', 'AI Hackathon Samarkand 2025', '36164a1a-003a-5e11-8ed1-3f3c42ba2e3f',
  'AI Hackathon Samarkand 2025 — Angel Connect startap ekotizimi tomonidan IT Park bilan hamkorlikda tashkil etilgan, 2025-yil 6-8-avgust kunlari oʻtkazilgan uch kunlik hakaton boʻlib, Samarqandga 3-5 kishilik jamoalarda taxminan 100 ishtirokchi tashrif buyurdi. Ishlanma 6-7-avgustda School 21 da olib borildi, final va sovrinlar topshirish esa 8-avgustda Hilton Samarkand mehmonxonasida boʻlib oʻtdi; gʻolib jamoalar noutbuk, planshet va smartfonlar bilan taqdirlandi.',
  'AI Hackathon Samarkand 2025 — трёхдневный хакатон (6-8 августа 2025 года), организованный стартап-экосистемой Angel Connect в сотрудничестве с IT Park; в Самарканд приехало около 100 участников в командах по 3-5 человек. Разработка проходила в School 21 6-7 августа, финал и награждение — в Hilton Samarkand 8 августа; команды-победители получили ноутбуки, планшеты и смартфоны.',
  'AI Hackathon Samarkand 2025 was a three-day hackathon (August 6-8, 2025) organized by the Angel Connect startup ecosystem in collaboration with IT Park, bringing about 100 participants in teams of 3-5 to Samarkand. Development ran at School 21 on August 6-7 before finals and awards at the Hilton Samarkand on August 8, with winning teams receiving laptops, tablets and smartphones.',
  'Samarkand', 'offline', '2025-08-06'::date, '2025-08-08'::date,
  null, array['AI', 'Development', 'Design', 'Entrepreneurship']::text[], 'https://angelconnect.uz/samarcand_hackathon', null, 'https://angelconnect.uz/samarcand_hackathon',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] National AI Hackathon — Nukus Stage (HealthTech AI Hackathon)
--   This is the same Nukus/HealthTech leg already summarized inside the
--   original 'national-ai-hackathon-2025-regional-stages' entry, now broken
--   out as its own city-tagged row per the coordinator's request. See the
--   accompanying correction on that entry.
-- sources: https://www.uzdaily.uz/en/ai-hackathon-in-healthcare-kicks-off-in-nukus/ | https://people.uzum.com/career/uz/news/862
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '02e5a94d-7b08-5d64-86ad-5fd984b2fa9e', 'national-ai-hackathon-nukus-stage-2025', 'National AI Hackathon — Nukus Stage (HealthTech AI Hackathon)', '994ed103-717b-5623-8377-f9521c6ebee2',
  'HealthTech AI Hackathon nomi bilan atalgan Nukus bosqichi 2025-yil 2-oktyabrda Qoraqalpogʻiston poytaxtida umummilliy National AI Hackathon dasturining ochilish bosqichi sifatida boshlandi. 100 dan ortiq ishtirokchi 26 jamoada sogʻliqni saqlash, taʼlim, sud tizimi, suv xoʻjaligi va tadbirkorlik sohalarida AI yechimlari ustida ishladi; ularga IT Park Uzbekistan va Yoshlar Ventures mentorlik qildi, xususiy hamkorlar orasida Yandex Uzbekistan, Uzum, Click va ZTE bor edi.',
  'Нукусский этап, названный HealthTech AI Hackathon, стартовал 2 октября 2025 года как первый этап общенациональной программы National AI Hackathon, прошедший в столице Каракалпакстана. Более 100 участников в 26 командах работали над AI-решениями в сферах здравоохранения, образования, судебной системы, водного хозяйства и предпринимательства при наставничестве IT Park Uzbekistan и Yoshlar Ventures, с участием частных партнёров, включая Yandex Uzbekistan, Uzum, Click и ZTE.',
  'The Nukus stage, branded the HealthTech AI Hackathon, launched October 2, 2025 as the opening leg of the National AI Hackathon nationwide program, held in the capital of Karakalpakstan. Over 100 participants in 26 teams worked on AI solutions for healthcare, education, the judicial system, water management and entrepreneurship, mentored by IT Park Uzbekistan and Yoshlar Ventures, with private partners including Yandex Uzbekistan, Uzum, Click and ZTE.',
  'Nukus', 'offline', '2025-10-02'::date, null,
  null, array['Healthcare', 'Education', 'Judicial systems', 'Water management', 'Entrepreneurship']::text[], 'https://ai-hackathon.uz/', null, 'https://ai-hackathon.uz/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] National AI Hackathon — Samarkand Stage
--   Dates (Jan 20-23, 2026), city, organizers and focus tracks corroborated
--   across gazeta.uz, kun.uz and outsource.gov.uz. This is one of the regional
--   legs that was folded into the original
--   'national-ai-hackathon-2025-regional-stages' entry; see the accompanying
--   correction for that entry.
-- sources: https://www.gazeta.uz/oz/2026/01/16/uzum/ | https://kun.uz/news/2026/01/24/samarqandda-navbatdagi-milliy-ai-hackathon-goliblari-aniqlandi | https://www.outsource.gov.uz/en/media/the-second-national-ai-hackathon-will-take-place-in-samarkand
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '198be579-1ed2-535b-872e-2a9623528f8a', 'national-ai-hackathon-samarkand-stage-2026', 'National AI Hackathon — Samarkand Stage', '994ed103-717b-5623-8377-f9521c6ebee2',
  'National AI Hackathonning Samarqand bosqichi 2026-yil 20-23-yanvar kunlari Oʻzbekistonning umummilliy AI-xakaton dasturining ikkinchi mintaqaviy bosqichi sifatida oʻtkazildi. Samarqand viloyatidan yosh mutaxassislar sogʻliqni saqlash, taʼlim, tadbirkorlik va kiberxavfsizlik sohalarida, jumladan giyohvand moddalarning noqonuniy aylanishiga qarshi kurashish boʻyicha AI yechimlarini yaratdi; dastur Raqamli texnologiyalar vazirligi, IT Park Uzbekistan, AICA, ML Community Uzbekistan va Uzinfocom bilan hamkorlikda amalga oshirildi.',
  'Самаркандский этап National AI Hackathon прошёл 20-23 января 2026 года как второй региональный этап общенациональной AI-хакатон-программы Узбекистана. Молодые специалисты Самаркандской области создавали AI-решения в сферах здравоохранения, образования, предпринимательства и кибербезопасности, включая проекты по борьбе с незаконным оборотом наркотиков; программа реализована совместно с Министерством цифровых технологий, IT Park Uzbekistan, AICA, ML Community Uzbekistan и Uzinfocom.',
  'The Samarkand stage of the National AI Hackathon ran January 20-23, 2026 as the second regional leg of Uzbekistan''s nationwide AI hackathon program. Young specialists from the Samarkand region built AI solutions for healthcare, education, entrepreneurship and cybersecurity, including projects addressing illegal drug trafficking, implemented with the Ministry of Digital Technologies, IT Park Uzbekistan, AICA, ML Community Uzbekistan and Uzinfocom.',
  'Samarkand', 'offline', '2026-01-20'::date, '2026-01-23'::date,
  null, array['Healthcare', 'Education', 'Entrepreneurship', 'Cybersecurity']::text[], 'https://ai-hackathon.uz/', null, 'https://ai-hackathon.uz/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] CBU Coding Hackathon 2026 (Kod va g'oyalar jangi)
--   Dates and prize pool confirmed via CBU's own press release and a TUIT
--   article referencing the same hackathon. Exact final venue was not
--   explicitly stated in the sources reviewed, but the Central Bank is
--   headquartered in Tashkent, so Tashkent is used as the city.
-- sources: https://cbu.uz/uz/press_center/news/3457527/ | https://tuit.uz/post/cbu-coding-hackathon-2026-boshlandi
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '978ba7a0-5e1b-5599-800b-b1f51b60dce0', 'cbu-coding-hackathon-2026', 'CBU Coding Hackathon 2026 (Kod va g''oyalar jangi)', '549c5a71-dc2a-5266-8b29-e7ca89aab50f',
  '''Kod va gʻoyalar jangi'' nomi bilan oʻtkazilgan CBU Coding Hackathon 2026 Oʻzbekiston Respublikasi Markaziy banki tomonidan Smart Banking va fintex sohasidagi yechimlarni topish uchun tashkil etildi. Saralash bosqichi 2026-yil 16-fevraldan 16-martgacha, finali esa 27-28-mart kunlari boʻlib oʻtdi, umumiy mukofot jamgʻarmasi 350 million soʻmni tashkil etdi. Hakaton Markaziy bankning besh yil ichida 20 dan ortiq fintex-hakaton oʻtkazish, 100 dan ortiq gʻoyani sinovdan oʻtkazish va 100 dan ortiq startapni inkubatsiya qilish rejasining bir qismi sifatida taʼriflanadi.',
  'CBU Coding Hackathon 2026 под названием «Kod va gʻoyalar jangi» («Битва кода и идей») организован Центральным банком Республики Узбекистан для поиска решений в сфере Smart Banking и финтеха. Отборочный этап прошёл с 16 февраля по 16 марта 2026 года, финал — 27-28 марта 2026 года, общий призовой фонд составил 350 миллионов сумов. Хакатон описывается как часть пятилетнего плана CBU по проведению более 20 финтех-хакатонов, тестированию свыше 100 идей и инкубации более 100 стартапов.',
  'The CBU Coding Hackathon 2026, subtitled ''Kod va g''oyalar jangi'' (''Battle of Code and Ideas''), was organized by the Central Bank of the Republic of Uzbekistan to source Smart Banking and fintech solutions. A qualification stage ran February 16-March 16, 2026, followed by a final on March 27-28, 2026, with a total prize pool of 350 million so''m. It is described as part of a five-year CBU plan to run more than 20 fintech hackathons, test over 100 ideas and incubate more than 100 startups.',
  'Tashkent', 'hybrid', '2026-02-16'::date, '2026-03-28'::date,
  '350 000 000 so''m', array['Smart Banking', 'Fintech']::text[], 'https://hackathon.mbabm.uz/', null, 'https://hackathon.mbabm.uz/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [partial] CAU Tech Hackathon 2026
--   Dates, participant count/countries and the three tracks are corroborated
--   by two sources. A specific prize-pool figure appeared in secondary
--   summaries but as an internally implausible amount ('456,000 UZS' -- too
--   small for the described scale of the event), so it is treated as
--   unverified and left null rather than repeated.
-- sources: https://centralasian.uz/university_community/yj5sskdoy1-cau-tech-hackathon-2026-how-one-of-the-r | https://tuit.uz/en/post/cau-tech-hackathon-2026
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '137fb6b1-c6b6-5778-80af-43f4c922aa99', 'cau-tech-hackathon-2026', 'CAU Tech Hackathon 2026', '783b1089-7c71-5364-8614-db2c09ec0416',
  'CAU Tech Hackathon 2026 2026-yil 27-28-mart kunlari Markaziy Osiyo universitetining Toshkentdagi kampusida, Cisco hamkorligi qoʻllab-quvvatlashida oʻtkazildi. Tadbirda 17 davlatdan taxminan 1200 ishtirokchi uch yoʻnalishda bellashdi: talabalar uchun 36 soatlik AI in Healthcare hakatoni, Cybersecurity CTF va 10-11-sinf oʻquvchilari uchun Robotics Challenge.',
  'CAU Tech Hackathon 2026 прошёл 27-28 марта 2026 года в ташкентском кампусе Центральноазиатского университета при поддержке партнёра Cisco. Мероприятие собрало около 1200 участников из 17 стран в трёх соревнованиях: 36-часовой хакатон AI in Healthcare для студентов, Cybersecurity CTF и Robotics Challenge для школьников 10-11 классов.',
  'The CAU Tech Hackathon 2026 was held March 27-28, 2026 at Central Asian University''s Tashkent campus, with Cisco as a supporting partner. It brought together roughly 1,200 participants from 17 countries across three competitions: a 36-hour AI in Healthcare hackathon for university students, a Cybersecurity CTF, and a Robotics Challenge for grade 10-11 school students.',
  'Tashkent', 'offline', '2026-03-27'::date, '2026-03-28'::date,
  null, array['AI in Healthcare', 'Cybersecurity CTF', 'Robotics Challenge']::text[], 'https://tuit.uz/en/post/cau-tech-hackathon-2026', null, null,
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [partial] Build with AI Hackathon – Karshi 2026
--   Only a single source (the GDG community event page) was found for this
--   event; no independent second outlet covering it was located, so confidence
--   is 'partial' rather than 'verified'. No prize pool figure was disclosed.
-- sources: https://gdg.community.dev/events/details/google-gdg-qarshi-presents-build-with-ai-hackathon-karshi-2026/
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '654a9292-3fd5-5abe-8f16-a248ebaf51e9', 'build-with-ai-hackathon-karshi-2026', 'Build with AI Hackathon – Karshi 2026', '03a453c0-5a03-5fd9-823c-d8700a4257cc',
  'Build with AI Hackathon - Karshi 2026 — 2026-yil 18-19-aprel kunlari Qashqadaryo viloyatidagi Qarshi davlat texnika universitetida oʻtkazilgan, mahalliy Google Developer Group (GDG Qarshi) boʻlimi tomonidan tashkil etilgan yuzma-yuz hakaton edi. Unda dasturchilar, dizaynerlar va texnologiya ishqibozlari Gemini kabi vositalardan foydalanib AI loyihalarini yaratishga taklif etildi; oʻrinlar soni cheklangan edi.',
  'Build with AI Hackathon - Karshi 2026 — очный хакатон, прошедший 18-19 апреля 2026 года в Каршинском государственном техническом университете (Кашкадарьинская область), организованный местным отделением Google Developer Group (GDG Qarshi). Разработчиков, дизайнеров и техноэнтузиастов пригласили создавать AI-проекты с использованием таких инструментов, как Gemini; количество мест было ограничено.',
  'Build with AI Hackathon - Karshi 2026 was an in-person hackathon held April 18-19, 2026 at Karshi State Technical University in Kashkadarya region, organized by the local Google Developer Group (GDG Qarshi) chapter. It invited developers, designers and tech enthusiasts to build AI-driven projects using tools such as Gemini, with limited spots available.',
  'Qarshi', 'offline', '2026-04-18'::date, '2026-04-19'::date,
  null, array['AI', 'Gemini / Google AI tools']::text[], 'https://gdg.community.dev/events/details/google-gdg-qarshi-presents-build-with-ai-hackathon-karshi-2026/', null, 'https://gdg.community.dev/events/details/google-gdg-qarshi-presents-build-with-ai-hackathon-karshi-2026/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [partial] National AI Hackathon — Fergana Stage
--   Dates, venue, eligibility and prize structure are detailed on the
--   eventflow.uz registration listing, which appears to be the event's
--   official registration platform, but no independent second news outlet
--   covering this specific Fergana leg was found in this research pass, so
--   confidence is 'partial' rather than 'verified'.
-- sources: https://eventflow.uz/en/events/national-ai-hackathon-fergana
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  'e1def3b0-83fc-5ea3-86b1-a87d9e40e1b7', 'national-ai-hackathon-fergana-stage-2026', 'National AI Hackathon — Fergana Stage', 'f48afe2d-106a-5a34-8be4-fe4814bd6244',
  'National AI Hackathonning Fargʻona bosqichi 2026-yil 20-23-may kunlari IT Parkning Fargʻona filiali maydonida oʻtkazildi; mintaqaviy ijrochi hamkor sifatida AI Alliance NNTsi ishtirok etdi. 16 yoshdan oshgan Fargʻona viloyati aholisi uchun ochiq boʻlgan tadbir sogʻliqni saqlash, taʼlim, tadbirkorlik va kosmik texnologiyalar yoʻnalishlarini qamrab oldi; birinchi oʻrin uchun Apple MacBook Air, ikkinchi va uchinchi oʻrinlar uchun 20 million va 10 million soʻmlik pul mukofotlari berildi.',
  'Ферганский этап National AI Hackathon прошёл 20-23 мая 2026 года на площадке филиала IT Park в Фергане; региональным исполнительным партнёром выступила НКО AI Alliance. Мероприятие, открытое для жителей Ферганской области от 16 лет, охватывало треки здравоохранения, образования, предпринимательства и космических технологий; первое место получало MacBook Air от Apple, второе и третье — денежные призы в 20 и 10 миллионов сумов.',
  'The Fergana stage of the National AI Hackathon ran May 20-23, 2026 at the IT Park Fergana branch, organized by AI Alliance NGO as the regional implementing partner. Open to Fergana-region residents aged 16+, it covered healthcare, education, entrepreneurship and space-technology tracks, awarding an Apple MacBook Air for first place and cash prizes of 20 million and 10 million so''m for second and third.',
  'Fergana', 'offline', '2026-05-20'::date, '2026-05-23'::date,
  '1st place: Apple MacBook Air; 2nd place: 20 000 000 so''m; 3rd place: 10 000 000 so''m', array['Healthcare', 'Education', 'Entrepreneurship', 'Space technology']::text[], 'https://eventflow.uz/en/events/national-ai-hackathon-fergana', null, 'https://eventflow.uz/en/events/national-ai-hackathon-fergana',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [verified] IT Park GovTech AI Challenge
--   Registration deadline (July 23, 2026) and the $10,000 prize are confirmed
--   via the challenge listing on Starthubs. The September 25, 2026 demo-day
--   date is now independently corroborated by IT Park Uzbekistan's own
--   Telegram channel, which names the Tashkent demo-day session 'Ignyte AI
--   Challenge', held at CAEx Hall 3 as part of ICT Week Uzbekistan 2026 (Sept
--   22-25, 2026), with registration at ictweek.it-park.uz. Confidence upgraded
--   to verified accordingly. Note this is more a startup-challenge format
--   (applicants already have working products) than a from-scratch build
--   hackathon.
-- sources: https://starthubs.co/en/opp/it-park-govtech-ai-challenge | https://hackathons.uz/en/ | https://t.me/s/itpark_uz | https://ictweek.it-park.uz/
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  '2a75c807-a73d-5557-8a2c-0973f4c1a3ea', 'it-park-govtech-ai-challenge-2026', 'IT Park GovTech AI Challenge', '200d22ed-1601-518e-866a-9680aca12cdd',
  'IT Park GovTech AI Challenge — IT Park Uzbekistan tomonidan Ignyte platformasi orqali oʻtkaziladigan, Oʻzbekiston davlat sektori uchun AI yechimlarini — ish jarayonlarini avtomatlashtirishdan tortib fuqarolar uchun koʻp tilli chatbotlargacha — topishga qaratilgan global startap tanlovi. Arizalar qabuli 2026-yil 23-iyulda yakunlandi; 3-5 finalchi Toshkentdagi demo-kunida loyihalarini taqdim etadi, gʻolib esa 10 000 dollar va Oʻzbekiston davlat sektoriga chiqish imkoniyatini qoʻlga kiritadi.',
  'IT Park GovTech AI Challenge — глобальный стартап-конкурс, проводимый IT Park Uzbekistan через платформу Ignyte, направленный на поиск AI-решений для госсектора Узбекистана — от автоматизации рабочих процессов до многоязычных чат-ботов для граждан. Приём заявок завершился 23 июля 2026 года; 3-5 финалистов должны представить проекты на демо-дне в Ташкенте, победитель получит $10 000 и возможность выйти на рынок госсектора Узбекистана.',
  'The IT Park GovTech AI Challenge is a global startup competition run by IT Park Uzbekistan via the Ignyte challenge platform, seeking AI-driven solutions for Uzbekistan''s public sector -- from workflow automation and predictive governance to multilingual citizen chatbots. Applications closed July 23, 2026; three to five finalists are set to pitch at a Tashkent demo day, with the winner receiving $10,000 and a path to enter Uzbekistan''s public-sector market.',
  'Tashkent', 'hybrid', '2026-09-25'::date, '2026-09-25'::date,
  '$10 000', array['Public sector workflow automation', 'Predictive governance', 'Citizen engagement / multilingual chatbots', 'State-owned enterprise optimization', 'Accessibility']::text[], 'https://app.ignyte.ae/public/challenges/E46A8476-A931-F111-9A49-6045BD14D400', null, 'https://ictweek.it-park.uz/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [illustrative] NASA Space Apps Challenge 2026 — Tashkent (expected)
--   The global 2026 hackathon date (Nov 14-15, 2026) and the Aug 26, 2026
--   registration opening are confirmed on NASA's own program materials.
--   Tashkent's participation is NOT yet confirmed for 2026 specifically -- it
--   is inferred from a consistent multi-year hosting pattern (local Tashkent
--   event pages existed for 2023, 2024 and 2025). Marked 'illustrative' rather
--   than 'partial' because the Uzbekistan-specific claim for 2026 is a
--   well-grounded projection, not a corroborated fact; drop this entry if the
--   platform requires confirmed-only upcoming events.
-- sources: https://www.spaceappschallenge.org/2025/local-events/tashkent/ | https://gov.uz/en/uzspace/news/view/65760 | https://www.globalsouthopportunities.com/2026/08/23/nasa-2/
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  'a79e9fe0-e870-5025-8f3b-60b731e13751', 'nasa-space-apps-challenge-2026-tashkent', 'NASA Space Apps Challenge 2026 — Tashkent (expected)', '8fc43eac-ab15-5c9b-852a-0c78762b1c5b',
  'NASA''ning global Space Apps Challenge hakatoni — 190 dan ortiq davlatda mahalliy tadbirlar shaklida oʻtkaziladigan yillik ikki kunlik tadbir — 2026-yil 14-15-noyabr kunlariga rejalashtirilgan, roʻyxatdan oʻtish esa 2026-yil 26-avgustda boshlanadi. Toshkent kamida 2023-yildan beri har yili mahalliy tadbirni qabul qilib kelmoqda (tashkilotchi — Oʻzbekistonning kosmik agentligi Uzbekkosmos; bu rasmiy saytda 2024 va 2025-yillar uchun tasdiqlangan), shuning uchun 2026-yilgi Toshkent nashri ehtimoli yuqori, biroq bu tadqiqot tayyorlangan sanaga (2026-yil 25-avgust) qadar 2026-yilgi Toshkent mahalliy tadbir sahifasi hali eʼlon qilinmagan edi.',
  'Глобальный хакатон NASA Space Apps Challenge — ежегодное двухдневное мероприятие, проходящее в виде локальных ивентов в более чем 190 странах — запланирован на 14-15 ноября 2026 года, регистрация открывается 26 августа 2026 года. Ташкент принимает локальное мероприятие ежегодно по меньшей мере с 2023 года (организатор — Uzbekkosmos, космическое агентство Узбекистана; подтверждено на официальном сайте для 2024 и 2025 годов), поэтому ташкентская версия 2026 года весьма вероятна, однако страница локального ташкентского мероприятия на 2026 год на момент подготовки этого исследования (25 августа 2026) ещё не была опубликована.',
  'NASA''s global Space Apps Challenge -- an annual two-day hackathon run as local events across 190+ countries -- is scheduled for November 14-15, 2026, with registration opening August 26, 2026. Tashkent has hosted a local edition every year since at least 2023 (run by Uzbekkosmos, Uzbekistan''s space agency, most recently confirmed for 2024 and 2025 on the event''s official site), so a 2026 Tashkent edition is likely, though the local Tashkent event page for 2026 had not yet been published as of the date of this research (Aug 25, 2026).',
  'Tashkent', 'hybrid', '2026-11-14'::date, '2026-11-15'::date,
  null, array['Space technology', 'Earth observation', 'Climate', 'Data science']::text[], 'https://www.spaceappschallenge.org/', null, 'https://www.spaceappschallenge.org/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;

-- [partial] National AI Hackathon 2026 — Grand Final
--   The existence and approximate December 2026/Tashkent timing of the grand
--   final is corroborated at the month level by UzDaily and gov.uz coverage of
--   earlier regional stages. The specific December 1-24, 2026 date range used
--   here comes only from the hackathons.uz aggregator and could not be
--   independently confirmed on an official Ministry of Digital Technologies or
--   IT Park channel, so treat exact days with caution -- this is the dataset's
--   clearest genuinely upcoming event but with partial confidence on exact
--   dates.
-- sources: https://www.uzdaily.uz/en/ai-hackathon-in-healthcare-kicks-off-in-nukus/ | https://gov.uz/en/digital/news/view/153647 | https://hackathons.uz/en/
insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  'bacd9508-d52d-54ed-8103-49cc695f0efd', 'national-ai-hackathon-2026-grand-final', 'National AI Hackathon 2026 — Grand Final', '994ed103-717b-5623-8377-f9521c6ebee2',
  'Milliy AI-xakatonning Toshkentdagi gʻolib-finalida dasturning 2025-2026-yillardagi barcha mintaqaviy bosqichlari (Nukus, Samarqand, Buxoro, Navoiy, Qarshi va boshqalar) gʻoliblari sogʻliqni saqlash, kiberxavfsizlik, taʼlim va tadbirkorlik yoʻnalishlarida bellashishi kutilmoqda. Mintaqaviy bosqichlar haqidagi rasmiy va matbuot xabarlarida gʻolib-final 2026-yil dekabr oyida Toshkentda oʻtkazilishi rejalashtirilgani muntazam qayd etiladi, biroq aniq kunlar 2026-yil avgust oxirigacha rasman eʼlon qilinmagan.',
  'Ожидается, что ташкентский гранд-финал National AI Hackathon соберёт лучшие команды со всех региональных этапов программы 2025-2026 годов (Нукус, Самарканд, Бухара, Навои, Карши и другие) для соревнования по трекам здравоохранения, кибербезопасности, образования и предпринимательства. В публикациях о региональных этапах неоднократно указывается, что гранд-финал запланирован на декабрь 2026 года в Ташкенте, хотя точные даты официально не опубликованы по состоянию на конец августа 2026 года.',
  'The Tashkent grand final of the National AI Hackathon is expected to bring together the top teams from all of the program''s 2025-2026 regional stages (Nukus, Samarkand, Bukhara, Navoi, Qarshi and others) to compete in healthcare, cybersecurity, education and entrepreneurship tracks. Government and press coverage of the regional stages consistently states the grand final is planned for December 2026 in Tashkent, though an exact day range has not been officially published as of late August 2026.',
  'Tashkent', 'offline', '2026-12-01'::date, '2026-12-24'::date,
  null, array['Healthcare', 'Cybersecurity', 'Education', 'Entrepreneurship']::text[], 'https://ai-hackathon.uz/', null, 'https://ai-hackathon.uz/',
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;


-- ---------------------------------------------------------------------------
-- Admin bootstrap (PRD 7.8 / 16.3)
--
-- Promotes the profile whose email matches the ADMIN_EMAIL environment
-- variable. It is a no-op until that person has actually signed up, so it is
-- safe to run before or after the first sign-in — re-run it once they have.
--
-- Manual equivalent, if you would rather not use the env var:
--     update public.profiles set role = 'admin'
--      where id = (select id from auth.users where email = 'you@example.com');
-- ---------------------------------------------------------------------------

do $seed$
declare
  admin_email text := coalesce(nullif(current_setting('app.admin_email', true), ''), 'admin@hackathonlar.uz');
  promoted    int;
begin
  update public.profiles p
     set role = 'admin'
    from auth.users u
   where u.id = p.id
     and lower(u.email) = lower(admin_email);

  get diagnostics promoted = row_count;

  if promoted > 0 then
    raise notice 'Promoted % profile(s) to admin for %', promoted, admin_email;
  else
    raise notice 'No profile found for % yet — sign up with that email, then re-run this statement.', admin_email;
  end if;
end
$seed$;

commit;

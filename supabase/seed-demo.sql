-- ===========================================================================
-- hackathonlar.uz — DEMO DATA. LOCAL DEVELOPMENT ONLY.
--
-- GENERATED FILE. Edit supabase/seed-data/demo-reviews.json and run
-- `pnpm seed:generate`.
--
-- !! DO NOT RUN THIS AGAINST PRODUCTION !!
--
-- Every account created here is named "Demo foydalanuvchi N" and uses an
-- @example.invalid address precisely so that a fabricated opinion can never be
-- mistaken for a real participant's. These rows exist so that the score bars,
-- rating histogram, ranking rails, moderation queue and report queue have
-- something to render during development, visual QA and end-to-end tests.
--
-- To remove everything this file created:
--     delete from auth.users where email like '%@example.invalid';
-- (reviews, votes, reports and profiles cascade)
-- ===========================================================================

begin;

-- Password for every demo account: DemoParol2026

-- Demo foydalanuvchi 1 <demo1@example.invalid>
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae', 'authenticated', 'authenticated',
  'demo1@example.invalid', extensions.crypt('DemoParol2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', 'Demo foydalanuvchi 1'),
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae',
  jsonb_build_object('sub', 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae', 'email', 'demo1@example.invalid', 'email_verified', true),
  'email', 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;

-- Demo foydalanuvchi 2 <demo2@example.invalid>
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b', 'authenticated', 'authenticated',
  'demo2@example.invalid', extensions.crypt('DemoParol2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', 'Demo foydalanuvchi 2'),
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b',
  jsonb_build_object('sub', 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b', 'email', 'demo2@example.invalid', 'email_verified', true),
  'email', 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;

-- Demo foydalanuvchi 3 <demo3@example.invalid>
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'be7656cf-7649-5a24-8a28-b3997050e89c', 'authenticated', 'authenticated',
  'demo3@example.invalid', extensions.crypt('DemoParol2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', 'Demo foydalanuvchi 3'),
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), 'be7656cf-7649-5a24-8a28-b3997050e89c',
  jsonb_build_object('sub', 'be7656cf-7649-5a24-8a28-b3997050e89c', 'email', 'demo3@example.invalid', 'email_verified', true),
  'email', 'be7656cf-7649-5a24-8a28-b3997050e89c', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;

-- Demo foydalanuvchi 4 <demo4@example.invalid>
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '397ab719-6fc6-54f0-80c2-3392d8cab7ff', 'authenticated', 'authenticated',
  'demo4@example.invalid', extensions.crypt('DemoParol2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', 'Demo foydalanuvchi 4'),
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), '397ab719-6fc6-54f0-80c2-3392d8cab7ff',
  jsonb_build_object('sub', '397ab719-6fc6-54f0-80c2-3392d8cab7ff', 'email', 'demo4@example.invalid', 'email_verified', true),
  'email', '397ab719-6fc6-54f0-80c2-3392d8cab7ff', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;

-- Demo foydalanuvchi 5 <demo5@example.invalid>
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '7793fe86-ddd9-5cec-8d64-19a317966ebc', 'authenticated', 'authenticated',
  'demo5@example.invalid', extensions.crypt('DemoParol2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', 'Demo foydalanuvchi 5'),
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), '7793fe86-ddd9-5cec-8d64-19a317966ebc',
  jsonb_build_object('sub', '7793fe86-ddd9-5cec-8d64-19a317966ebc', 'email', 'demo5@example.invalid', 'email_verified', true),
  'email', '7793fe86-ddd9-5cec-8d64-19a317966ebc', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;

-- Demo foydalanuvchi 6 <demo6@example.invalid>
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '32fa1a32-0f51-5924-8254-1d6113b11abe', 'authenticated', 'authenticated',
  'demo6@example.invalid', extensions.crypt('DemoParol2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', 'Demo foydalanuvchi 6'),
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), '32fa1a32-0f51-5924-8254-1d6113b11abe',
  jsonb_build_object('sub', '32fa1a32-0f51-5924-8254-1d6113b11abe', 'email', 'demo6@example.invalid', 'email_verified', true),
  'email', '32fa1a32-0f51-5924-8254-1d6113b11abe', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;


-- The auth trigger creates profiles automatically; make the display names
-- explicit anyway so a re-run repairs them.

update public.profiles set display_name = 'Demo foydalanuvchi 1' where id = 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae';
update public.profiles set display_name = 'Demo foydalanuvchi 2' where id = 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b';
update public.profiles set display_name = 'Demo foydalanuvchi 3' where id = 'be7656cf-7649-5a24-8a28-b3997050e89c';
update public.profiles set display_name = 'Demo foydalanuvchi 4' where id = '397ab719-6fc6-54f0-80c2-3392d8cab7ff';
update public.profiles set display_name = 'Demo foydalanuvchi 5' where id = '7793fe86-ddd9-5cec-8d64-19a317966ebc';
update public.profiles set display_name = 'Demo foydalanuvchi 6' where id = '32fa1a32-0f51-5924-8254-1d6113b11abe';

-- ---------------------------------------------------------------------------
-- Reviews (25)
-- ---------------------------------------------------------------------------

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '82198f1f-cd40-5400-8e1e-881a4d589a46', h.id, 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae',
  5, 4, 4,
  5, 5,
  'Jadval aniq, sovrin oʻz vaqtida',
  'Roʻyxatdan oʻtishdan finalgacha hamma bosqich eʼlon qilingan sanada boʻldi. Har bosqich natijasi Telegram kanalida chiqdi, kechikish boʻlmadi. Final kuni jamoalarga 7 daqiqadan pitch vaqti berildi va bu qatʼiy nazorat qilindi. Sovrin pul mablagʻi vaʼda qilinganidek, taxminan ikki hafta ichida kartaga tushdi.',
  'Aniq jadval, natijalar oʻz vaqtida, sovrin kechikmadi, hakamlar soha vakillari edi.', 'Baholash varaqasi ochiq qilinmadi — faqat umumiy ball aytildi.',
  false, 'finalist', 'published',
  now() - interval '150 days', now() - interval '150 days'
from public.hackathons h
where h.slug = 'cbu-coding-hackathon-2026'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '1a1d5b1f-09af-5652-878f-f0eead752a60', h.id, 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b',
  4, 4, 3,
  5, 4,
  'Yaxshi tashkil etilgan, baholash biroz noaniq',
  'Umuman olganda kuchli hakaton. Mentorlar haqiqatan yordam berdi, texnik savollarga tez javob keldi. Lekin baholash mezonlari faqat final kuni ekranda koʻrsatildi, undan oldin qaysi mezon necha ball ekani aniq emas edi. Shu sabab baʼzi jamoalar demo oʻrniga slaydga koʻproq vaqt sarfladi.',
  'Mentorlik kuchli, texnik infratuzilma barqaror.', 'Baholash mezonlari oldindan eʼlon qilinmadi.',
  false, 'participant', 'published',
  now() - interval '146 days', now() - interval '146 days'
from public.hackathons h
where h.slug = 'cbu-coding-hackathon-2026'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '2196335d-7b43-5405-8a56-7c5d4a469533', h.id, 'be7656cf-7649-5a24-8a28-b3997050e89c',
  5, 5, 4,
  4, 5,
  'Har bir jamoaga javob qaytarildi',
  'Eng muhimi: finalga oʻtmagan jamoalarga ham alohida xat yozilgan. Bizning tanishlarimiz saralashdan oʻtmadi, lekin ularga qisqacha izoh bilan javob keldi. Oʻzbekistonda bu kamdan-kam uchraydi. Joy va texnik sharoit ham yaxshi edi, Wi-Fi butun tadbir davomida uzilmadi.',
  'Finalga oʻtmaganlarga ham javob berildi. Wi-Fi barqaror.', 'Sovrin topshirish marosimi biroz choʻzildi.',
  false, 'winner', 'published',
  now() - interval '141 days', now() - interval '141 days'
from public.hackathons h
where h.slug = 'cbu-coding-hackathon-2026'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '32a92259-acea-526b-8f20-d04f9e18b145', h.id, '397ab719-6fc6-54f0-80c2-3392d8cab7ff',
  4, 3, 4,
  5, 4,
  'Хорошая организация, слабая обратная связь',
  'Регистрация и отборочный этап прошли без задержек, площадка удобная, еда была. Но между отбором и финалом почти три недели не было никаких новостей — пришлось писать организаторам самим, чтобы узнать статус. Призы выплатили вовремя, к этому вопросов нет.',
  'Призовой фонд выплачен в срок, площадка удобная.', 'Три недели тишины между этапами.',
  false, 'participant', 'published',
  now() - interval '138 days', now() - interval '138 days'
from public.hackathons h
where h.slug = 'cbu-coding-hackathon-2026'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '07054137-7336-522c-8786-adbb994f9d98', h.id, 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b',
  3, 1, 2,
  2, 3,
  'Finalchilar roʻyxatini Instagramdan bildik',
  'Tadbirning oʻzi yomon emas edi, lekin keyin nima boʻlgani umuman tushunarsiz. Bizga «natijalar bir hafta ichida» deyishdi. Ikki hafta oʻtib hech qanday xabar boʻlmadi, keyin tasodifan Instagram postidan finalchilar allaqachon eʼlon qilinganini koʻrdik. Qatnashmagan jamoalarga hech kim yozmadi.',
  'Mavzu qiziqarli, mentorlar tajribali.', 'Natijalar haqida rasmiy xabar boʻlmadi. Finalga oʻtmaganlarga javob yoʻq.',
  false, 'participant', 'published',
  now() - interval '640 days', now() - interval '640 days'
from public.hackathons h
where h.slug = 'urban-tech-uzbekistan-2024-hackathon'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '1fbdae32-0dba-5793-8d39-b4616fc73be7', h.id, '7793fe86-ddd9-5cec-8d64-19a317966ebc',
  2, 1, 2,
  1, 3,
  'Sovrin vaʼda qilindi, olti oy kutdik',
  'Finalda ikkinchi oʻrinni oldik. Sahnada sertifikat berishdi va pul mablagʻi «bir oy ichida» oʻtkaziladi deyishdi. Olti oydan keyin ham hech narsa kelmadi. Bir necha marta yozdik, javob qaytmadi. Buni yozayotganimda ham masala hal boʻlmagan. Tashkiliy tomoni ham oxirgi kuni chalkashdi: pitch tartibi ikki marta oʻzgardi.',
  'Joy markazda edi, borish qulay.', 'Sovrin toʻlanmadi. Aloqaga chiqishning imkoni yoʻq.',
  false, 'finalist', 'published',
  now() - interval '636 days', now() - interval '636 days'
from public.hackathons h
where h.slug = 'urban-tech-uzbekistan-2024-hackathon'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '603de41b-e6e0-54a1-86bd-ffb59c98dee7', h.id, '32fa1a32-0f51-5924-8254-1d6113b11abe',
  3, 2, 3,
  2, 4,
  'Mentor sifatida: jamoalarga javob yetmadi',
  'Mentor sifatida qatnashdim. Jamoalar bilan ishlash yaxshi tashkil etilgandi, joy va texnika ham joyida edi. Ammo tadbirdan keyin jamoalar mendan natija haqida soʻrashdi — menda ham maʼlumot yoʻq edi. Tashkilotchilar mentorlar bilan ham aloqani uzib qoʻydi.',
  'Joy va texnik taʼminot yaxshi.', 'Tadbirdan keyingi aloqa umuman yoʻq.',
  false, 'mentor', 'published',
  now() - interval '630 days', now() - interval '630 days'
from public.hackathons h
where h.slug = 'urban-tech-uzbekistan-2024-hackathon'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '58ef8c23-6996-5d81-8f1e-b6808a0143eb', h.id, 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae',
  4, 3, 3,
  3, 4,
  'Maʼlumotlar sifati kutilganidan past',
  'Ochiq maʼlumotlar bilan ishlash gʻoyasi zoʻr, lekin berilgan datasetlarning yarmi eskirgan yoki toʻliq emas edi. Buni tadbir boshlangandan keyin bildik va birinchi kunning yarmi maʼlumotni tozalashga ketdi. Tashkiliy jihatdan hammasi joyida boʻldi, jadval buzilmadi.',
  'Jadval aniq, universitet binosi qulay.', 'Datasetlar oldindan tekshirilmagan.',
  false, 'participant', 'published',
  now() - interval '570 days', now() - interval '570 days'
from public.hackathons h
where h.slug = 'open-data-challenge-2025'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '4bb152cf-d85d-5826-84f7-b0a39013649b', h.id, 'be7656cf-7649-5a24-8a28-b3997050e89c',
  3, 3, 4,
  3, 3,
  'Baholash adolatli, qolgani oʻrtacha',
  'Hakamlar haqiqatan kodni koʻrishdi va savollari mazmunli edi — bu kamdan-kam boʻladi. Qolgan jihatlar oʻrtacha: ovqat kechikdi, zal sovuq edi, jadval bir necha marta ogʻzaki oʻzgartirildi. Sovrin eʼlon qilinganidek berildi, lekin bir oy kechikdi.',
  'Hakamlar texnik jihatdan kuchli.', 'Zal sovuq, jadval ogʻzaki oʻzgartirildi.',
  false, 'participant', 'published',
  now() - interval '566 days', now() - interval '566 days'
from public.hackathons h
where h.slug = 'open-data-challenge-2025'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '0c916c14-4deb-5019-8e55-3b05a6720172', h.id, '7793fe86-ddd9-5cec-8d64-19a317966ebc',
  4, 4, 3,
  2, 4,
  'Yaxshi tadbir, sovrin masalasi choʻzildi',
  'Tashkiliy jihatdan hech qanday shikoyat yoʻq — hamma narsa vaqtida, xabarlar muntazam keldi. Muammo faqat sovrinda: gʻoliblarga topshirish jarayoni juda uzoq davom etdi va hujjat toʻldirish talab qilindi, bu haqda oldindan aytilmagandi.',
  'Xabarlar muntazam keldi.', 'Sovrin uchun kutilmagan hujjatlar talab qilindi.',
  false, 'finalist', 'published',
  now() - interval '560 days', now() - interval '560 days'
from public.hackathons h
where h.slug = 'open-data-challenge-2025'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select 'e8689576-fc13-5b6a-8560-867491246cac', h.id, 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b',
  5, 4, 4,
  4, 5,
  'Viloyat bosqichi kutilganidan ancha yaxshi',
  'Samarqand bosqichida qatnashdim. Toshkentdan tashqarida oʻtkaziladigan tadbirlar odatda zaifroq boʻladi, bu esa aksincha edi: joy tayyor, texnika ishlaydi, jadval buzilmadi. Mentorlar Toshkentdan kelgan va haqiqatan yordam berishdi.',
  'Viloyatda shunday darajadagi tashkiliy ish kamdan-kam uchraydi.', 'Ikkinchi kuni ovqat kechikdi.',
  false, 'participant', 'published',
  now() - interval '210 days', now() - interval '210 days'
from public.hackathons h
where h.slug = 'national-ai-hackathon-samarkand-stage-2026'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '707c1e6f-c535-5775-8574-a66e624f7f01', h.id, '397ab719-6fc6-54f0-80c2-3392d8cab7ff',
  4, 4, 5,
  4, 4,
  'Baholash shaffof boʻldi',
  'Baholash mezonlari birinchi kuni ekranda koʻrsatildi va oxirigacha oʻzgarmadi. Har bir jamoa oʻz balini yoʻnalishlar boʻyicha koʻra oldi. Bu juda muhim — nima uchun yutqazganingizni bilish yutuqdan kam emas. Grand finalga yoʻllanma oldik.',
  'Mezonlar oldindan eʼlon qilindi va oʻzgarmadi.', 'Roʻyxatdan oʻtish sayti bir necha soat ishlamadi.',
  false, 'winner', 'published',
  now() - interval '206 days', now() - interval '206 days'
from public.hackathons h
where h.slug = 'national-ai-hackathon-samarkand-stage-2026'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '236645a4-e4b9-5974-8341-0c92868fbf6f', h.id, '32fa1a32-0f51-5924-8254-1d6113b11abe',
  5, 5, 4,
  3, 5,
  'Отличная коммуникация на всех этапах',
  'Организаторы писали в Telegram буквально на каждом шаге: подтверждение регистрации, напоминание за день, расписание на каждый день, результаты отбора. Никого не оставили без ответа. Площадка в Самарканде оказалась удобной, интернет не падал.',
  'Каждое сообщение приходило вовремя, никого не забыли.', 'Призовой фонд для регионального этапа скромный.',
  false, 'participant', 'published',
  now() - interval '200 days', now() - interval '200 days'
from public.hackathons h
where h.slug = 'national-ai-hackathon-samarkand-stage-2026'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '39807ea0-06d4-5891-8556-29706f8a61e3', h.id, 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae',
  4, 4, 4,
  3, 4,
  'Ixcham va tartibli hakaton',
  'Uch kunlik format qulay boʻldi. Jamoalar soni koʻp emasdi, shuning uchun har bir jamoa mentor bilan yetarlicha vaqt ishlay oldi. Yakuniy taqdimotlar oʻz vaqtida boshlandi va tugadi.',
  'Kichik format tufayli mentorlik sifatli.', 'Sovrin jamgʻarmasi eʼlon qilinganidan kichikroq boʻlib chiqdi.',
  false, 'participant', 'published',
  now() - interval '380 days', now() - interval '380 days'
from public.hackathons h
where h.slug = 'ai-hackathon-samarkand-2025'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '7b8e9865-7c89-5ddd-89a1-7672ac20013c', h.id, '7793fe86-ddd9-5cec-8d64-19a317966ebc',
  3, 3, 4,
  3, 4,
  'Koʻngilli sifatida: tayyorgarlik oxirgi kunga qoldi',
  'Koʻngilli boʻlib ishladim. Ishtirokchilar uchun hammasi silliq koʻrindi, lekin ichkarida tayyorgarlik oxirgi kuni shoshilinch qilindi. Badge va roʻyxatlar tadbir kuni ertalab bosildi. Baholash jarayoni esa yaxshi tuzilgan edi.',
  'Baholash jarayoni aniq tuzilgan.', 'Ichki tayyorgarlik oxirgi kunga qoldirildi.',
  false, 'volunteer', 'published',
  now() - interval '376 days', now() - interval '376 days'
from public.hackathons h
where h.slug = 'ai-hackathon-samarkand-2025'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '081a4f93-9ea4-53c4-8f36-3eb39410f540', h.id, 'be7656cf-7649-5a24-8a28-b3997050e89c',
  4, 3, 3,
  4, 4,
  'Katta tadbir, lekin oqim sekin',
  'Miqyosi katta va shunga yarasha byurokratiya ham koʻp edi. Roʻyxatdan oʻtish uchun bir nechta hujjat talab qilindi, tasdiqlash bir hafta davom etdi. Tadbirning oʻzi yaxshi oʻtdi, sovrinlar berildi. Baholash jarayoni esa yopiq edi, ball tafsilotlari aytilmadi.',
  'Sovrinlar haqiqatan berildi.', 'Roʻyxatdan oʻtish choʻzildi, baholash yopiq.',
  false, 'participant', 'published',
  now() - interval '700 days', now() - interval '700 days'
from public.hackathons h
where h.slug = 'president-tech-award-2024-hackathon'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '7bd7420a-da3a-5f37-8729-7d736c77a979', h.id, '32fa1a32-0f51-5924-8254-1d6113b11abe',
  5, 4, 4,
  5, 4,
  'Davlat darajasidagi tashkiliy ish',
  'Bunday miqyosdagi tadbir uchun tashkiliy ish kutilganidan yaxshi edi. Jadval eʼlon qilingan vaqtda bajarildi, finalchilar roʻyxati rasmiy kanalda chiqdi va bizga alohida qoʻngʻiroq qilishdi. Sovrin masalasida ham muammo boʻlmadi.',
  'Rasmiy kanal orqali barcha xabarlar berildi.', 'Zalda joy yetarli emasdi, baʼzilar tik turdi.',
  false, 'finalist', 'published',
  now() - interval '694 days', now() - interval '694 days'
from public.hackathons h
where h.slug = 'president-tech-award-2024-hackathon'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select 'e0b41ece-edb9-5ca3-8ec7-40a87e1b19a3', h.id, '397ab719-6fc6-54f0-80c2-3392d8cab7ff',
  3, 2, 3,
  2, 3,
  'Gʻoya yaxshi, ijro boʻsh',
  'Ekologiya va texnologiya mavzusi juda dolzarb, lekin tadbir tayyorgarliksiz oʻtdi. Ikki kunlik format uchun mavzu juda keng qoʻyilgandi, jamoalar nima qilish kerakligini oxirigacha tushunmadi. Natijalar haqida keyin xabar berilmadi.',
  'Mavzu dolzarb, ishtirokchilar faol.', 'Vazifa noaniq, natijalar eʼlon qilinmadi.',
  true, 'participant', 'published',
  now() - interval '430 days', now() - interval '430 days'
from public.hackathons h
where h.slug = 'ecology-art-technology-hackathon-2025'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '502f4bb8-c904-5b02-815b-1adb0d7af960', h.id, 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b',
  4, 3, 3,
  3, 4,
  'Ijodiy format, texnik tomoni zaif',
  'Sanʼat va texnologiyani birlashtirish gʻoyasi ishladi, taqdimotlar qiziqarli boʻldi. Lekin texnik jamoalar uchun baholash mezonlari mos emasdi — dizayn va hikoya kodga qaraganda koʻproq baholandi, bu oldindan aytilmagandi.',
  'Format nostandart, taqdimotlar qiziqarli.', 'Baholash mezonlari texnik jamoalarga mos emas.',
  false, 'participant', 'published',
  now() - interval '426 days', now() - interval '426 days'
from public.hackathons h
where h.slug = 'ecology-art-technology-hackathon-2025'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '269bf44b-17ee-5567-8549-429721486977', h.id, '7793fe86-ddd9-5cec-8d64-19a317966ebc',
  4, 4, 4,
  4, 3,
  'Universitet hakatoni uchun yaxshi daraja',
  'Talabalar hakatoni uchun juda yaxshi tashkil etilgan. Jadval aniq, mentorlar bor, natijalar oʻsha kuni eʼlon qilindi. Yagona kamchilik — auditoriyalar kichik edi va uzoq oʻtirish noqulay boʻldi.',
  'Natijalar oʻsha kuniyoq eʼlon qilindi.', 'Auditoriyalar tor, uzoq ishlash noqulay.',
  false, 'participant', 'published',
  now() - interval '520 days', now() - interval '520 days'
from public.hackathons h
where h.slug = 'navruz-hackathon-2025'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '1892b899-2303-567a-870f-477b2c366fd4', h.id, 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae',
  4, 4, 3,
  4, 4,
  'Ikki kunlik ixcham format',
  'Universitet ichidagi tadbir uchun yaxshi daraja. Roʻyxatdan oʻtish oson, jadval buzilmadi, ovqat bor edi. Hakamlar tarkibi kichik edi va baholash tez oʻtdi — baʼzi jamoalarga savol berilmadi ham.',
  'Tashkiliy jihatdan aniq, kutish vaqti kam.', 'Baholash juda tez oʻtdi, feedback yoʻq.',
  false, 'participant', 'published',
  now() - interval '150 days', now() - interval '150 days'
from public.hackathons h
where h.slug = 'cau-tech-hackathon-2026'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select 'ba776992-0e3b-55c7-8c65-db45297b3e0c', h.id, '32fa1a32-0f51-5924-8254-1d6113b11abe',
  1, 1, 1,
  1, 1,
  'Bu sharh qoidabuzarlik uchun yashirilgan',
  'Bu yozuv moderatsiya oqimini sinash uchun qoʻyilgan namuna. Haqiqiy saytda bu yerda qoidalarga zid matn boʻlar edi va moderator uni yashirgan boʻlardi. Yashirilgan sharh reytingga taʼsir qilmaydi va omma uchun koʻrinmaydi.',
  null, null,
  false, 'participant', 'hidden',
  now() - interval '148 days', now() - interval '148 days'
from public.hackathons h
where h.slug = 'cau-tech-hackathon-2026'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select 'cf236b17-ed63-5f41-8ff2-21f15d72ac36', h.id, 'be7656cf-7649-5a24-8a28-b3997050e89c',
  5, 5, 5,
  4, 5,
  'Eng puxta tashkil etilgan tadbirlardan biri',
  'Mentor sifatida bir necha hakatonlarda qatnashganman, bu eng tartiblilaridan biri edi. Har bir jamoaga alohida mentor biriktirildi, jadval daqiqama-daqiqa bajarildi, ishtirokchilarga oldindan tayyorgarlik materiallari yuborildi. Natijalar oʻsha kuni eʼlon qilindi va har bir jamoa yozma izoh oldi.',
  'Har bir jamoa yozma izoh oldi. Tayyorgarlik materiallari oldindan berildi.', 'Sovrin jamgʻarmasi katta emas, lekin bu oldindan aytilgandi.',
  true, 'mentor', 'published',
  now() - interval '655 days', now() - interval '655 days'
from public.hackathons h
where h.slug = 'technovation-girls-yandex-hackathon-fergana-2024'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '11a8baee-128a-5edb-875f-ade70046b5b4', h.id, 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b',
  4, 3, 4,
  3, 4,
  'Ochilish bosqichi — birinchi blin boʻlmadi',
  'Milliy dasturning birinchi bosqichi boʻlgani uchun baʼzi narsalar chalkash boʻlishini kutgandim, lekin asosiy jarayon silliq oʻtdi. Sogʻliqni saqlash yoʻnalishi boʻyicha real maʼlumotlar berildi, bu katta plyus. Xabarlar esa kech keldi — jadval bir kun oldin eʼlon qilindi.',
  'Real maʼlumotlar bilan ishlash imkoni.', 'Jadval juda kech eʼlon qilindi.',
  false, 'participant', 'published',
  now() - interval '320 days', now() - interval '320 days'
from public.hackathons h
where h.slug = 'national-ai-hackathon-nukus-stage-2025'
on conflict (id) do nothing;

insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select '34fc4324-f9db-5507-853b-4c1107074f9f', h.id, '397ab719-6fc6-54f0-80c2-3392d8cab7ff',
  3, 2, 3,
  3, 3,
  'Nukusda qatnashish uchun logistika ogʻir',
  'Tadbirning oʻzi oʻrtacha darajada oʻtdi. Asosiy muammo — boshqa viloyatdan kelganlar uchun hech qanday yordam koʻrsatilmadi, yashash joyi haqida maʼlumot ham berilmadi. Bu haqda oldindan soʻraganimizda javob olmadik.',
  'Mavzu va yoʻnalishlar qiziqarli.', 'Boshqa viloyatdan kelganlarga logistika yordami yoʻq.',
  false, 'participant', 'published',
  now() - interval '316 days', now() - interval '316 days'
from public.hackathons h
where h.slug = 'national-ai-hackathon-nukus-stage-2025'
on conflict (id) do nothing;


-- Helpful votes

insert into public.review_votes (review_id, user_id)
values ('1fbdae32-0dba-5793-8d39-b4616fc73be7', 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('1fbdae32-0dba-5793-8d39-b4616fc73be7', 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('1fbdae32-0dba-5793-8d39-b4616fc73be7', 'be7656cf-7649-5a24-8a28-b3997050e89c')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('1fbdae32-0dba-5793-8d39-b4616fc73be7', '397ab719-6fc6-54f0-80c2-3392d8cab7ff')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('07054137-7336-522c-8786-adbb994f9d98', '32fa1a32-0f51-5924-8254-1d6113b11abe')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('07054137-7336-522c-8786-adbb994f9d98', 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('2196335d-7b43-5405-8a56-7c5d4a469533', 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('2196335d-7b43-5405-8a56-7c5d4a469533', 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('2196335d-7b43-5405-8a56-7c5d4a469533', '7793fe86-ddd9-5cec-8d64-19a317966ebc')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('82198f1f-cd40-5400-8e1e-881a4d589a46', '397ab719-6fc6-54f0-80c2-3392d8cab7ff')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('58ef8c23-6996-5d81-8f1e-b6808a0143eb', 'be7656cf-7649-5a24-8a28-b3997050e89c')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('707c1e6f-c535-5775-8574-a66e624f7f01', 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('707c1e6f-c535-5775-8574-a66e624f7f01', '32fa1a32-0f51-5924-8254-1d6113b11abe')
on conflict (review_id, user_id) do nothing;
insert into public.review_votes (review_id, user_id)
values ('cf236b17-ed63-5f41-8ff2-21f15d72ac36', '7793fe86-ddd9-5cec-8d64-19a317966ebc')
on conflict (review_id, user_id) do nothing;


-- Open reports, so the admin report queue is not empty during QA

insert into public.review_reports (review_id, user_id, reason)
values ('ba776992-0e3b-55c7-8c65-db45297b3e0c', 'd0b0e6e6-5a26-536d-892a-3f6c26dd898b', 'Sharhda haqorat va asossiz ayblovlar bor.')
on conflict (review_id, user_id) do nothing;
insert into public.review_reports (review_id, user_id, reason)
values ('e0b41ece-edb9-5ca3-8ec7-40a87e1b19a3', '7793fe86-ddd9-5cec-8d64-19a317966ebc', 'Menimcha bu odam tadbirda qatnashmagan — tafsilotlar mos kelmaydi.')
on conflict (review_id, user_id) do nothing;


-- Official organizer responses (admin-authored, PRD 8)

insert into public.official_responses (review_id, body, author_label)
values (
  '1fbdae32-0dba-5793-8d39-b4616fc73be7',
  'Sharh uchun rahmat va kechikish uchun uzr soʻraymiz. Sovrin toʻlovlari homiy tomonidan amalga oshirilishi kerak edi va bu jarayon kutilganidan uzoq davom etdi. Barcha gʻoliblar bilan bogʻlanmoqdamiz. Keyingi tadbirlarda toʻlov muddatini shartnomada qatʼiy belgilaymiz.',
  'Urban.Tech jamoasi rasmiy javobi'
)
on conflict (review_id) do update set body = excluded.body, author_label = excluded.author_label;


-- A pending submission and a rejected one, so /admin has a non-empty queue and
-- /profile can show every submission state.

insert into public.hackathons (
  id, slug, name, organizer_id, description_uz, description_ru, description_en,
  city, format, start_date, end_date, prize_pool, tracks, website, telegram,
  registration_url, status, rejection_reason, submitted_by
)
select '5ded6ddd-1dc8-5526-8ff0-f568f27242ad', 'demo-pending-fintech-hackathon-2026', 'Demo: Fintech Hackathon Toshkent 2026', o.id,
  'DEMO YOZUV — moderatsiya navbatini sinash uchun. Bu foydalanuvchi tomonidan yuborilgan va hali tasdiqlanmagan hakaton namunasi.', 'DEMO-ЗАПИСЬ — для проверки очереди модерации.', 'DEMO RECORD — used to exercise the moderation queue.',
  'Tashkent', 'offline', '2026-10-10'::date, '2026-10-12'::date,
  '50 000 000 soʻm', array['Fintech', 'Open banking']::text[], null, null,
  null, 'pending', null, 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae'
from public.organizers o
where o.slug = 'it-park-uzbekistan'
on conflict (slug) do nothing;

insert into public.hackathons (
  id, slug, name, organizer_id, description_uz, description_ru, description_en,
  city, format, start_date, end_date, prize_pool, tracks, website, telegram,
  registration_url, status, rejection_reason, submitted_by
)
select '66ea08dd-c1d7-52b9-8cd6-e92176980559', 'demo-rejected-hackathon-2025', 'Demo: rad etilgan hakaton', o.id,
  'DEMO YOZUV — rad etilgan holatni koʻrsatish uchun.', 'DEMO-ЗАПИСЬ — для отображения статуса «отклонено».', 'DEMO RECORD — used to show the rejected state on the profile page.',
  null, 'online', '2025-05-01'::date, '2025-05-02'::date,
  null, '{}'::text[], null, null,
  null, 'rejected', 'Tadbir haqida ochiq manba topilmadi. Rasmiy havola qoʻshib qayta yuboring.', 'd698aaf5-6bc9-56ee-8a44-7cac591c90ae'
from public.organizers o
where o.slug = 'it-park-uzbekistan'
on conflict (slug) do nothing;

commit;

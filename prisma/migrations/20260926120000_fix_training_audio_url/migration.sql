-- v1.0.2.9 — اصلاح مسیر فایل صوتی قسمت «Air Travel»
-- هنگام مهاجرت رسانه‌ها به Backblaze B2 (v1.0.2.8) نام این فایل
-- تغییر کرد (فاصله‌ها از نام حذف شدند)، ولی مقدار ذخیره‌شده در
-- دیتابیس با نام قدیمی ماند و پخش صوت با خطای 404 شکست می‌خورد.
-- این مایگریشن مسیر را با نام واقعی فایل در باکت هماهنگ می‌کند.
UPDATE `ListeningEpisode`
SET `audioUrl` = '/training/audio/2008-03-12-6-minute-english-air-travel.mp3'
WHERE `audioUrl` = '/training/audio/2008-03-12 - 6 Minute English - Air travel.mp3';

-- =============================================
-- سطح‌بندی سه‌گانه بازی هنگ‌من: EASY / MEDIUM / HARD
-- تبدیل مقادیر قدیمی سطح کلمات به مقادیر جدید
-- (برای دیتابیس‌هایی که با نسخه 1.0.0.0 seed شده‌اند)
-- =============================================

-- مبتدی → آسان
UPDATE `GameWord` SET `level` = 'EASY' WHERE `level` = 'BEGINNER';

-- پایه → متوسط
UPDATE `GameWord` SET `level` = 'MEDIUM' WHERE `level` = 'ELEMENTARY';

-- متوسط قدیمی → سخت
UPDATE `GameWord` SET `level` = 'HARD' WHERE `level` = 'INTERMEDIATE';

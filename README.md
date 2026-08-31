# Flex English

<p align="center">
  <strong>پلتفرم آموزش زبان انگلیسی برای فارسی‌زبانان</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql" alt="MySQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/NextAuth-4-D100D1?logo=next.js" alt="NextAuth" />
</p>

---

## معرفی پروژه

**Flex English** یه پلتفرم کامل آموزش زبان انگلیسیه که مخصوص فارسی‌زبانان طراحی شده. این پروژه شامل سیستم دوره‌های آموزشی، تمرین شنیداری، کتابخانه PDF، سیستم گیمیفیکیشن (XP و استریک روزهای متوالی) و داشبورد تحلیلی هست.

## ویژگی‌ها

### سیستم آموزشی
- **۱۲ دوره** در ۴ دسته‌بندی (گرامر، مکالمه، لغات، لیسنینگ)
- **۶۰ درس** با سه نوع محتوا: آموزشی (TEACH)، تمرین (PRACTICE)، آزمون (QUIZ)
- **۵ سطح** از مبتدی تا پیشرفته
- سیستم ثبت نام و ردیابی پیشرفت در هر درس

### تمرین شنیداری
- پخش‌کننده فایل صوتی داخلی
- تمرین جای‌خالی در رونویس (Fill-in-the-blank)
- سیستم امتیازدهی ۳ ستاره‌ای
- محاسبه XP بر اساس عملکرد

### گیمیفیکیشن
- **سیستم XP** برای هر درس و تمرین
- **استریک روزهای متوالی** (شبیه Duolingo)
- نمایش شعله استریک در سایدبار و نوار بالا
- هشدار انیمیشن‌دار استریک هنگام ورود

### داشبورد
- نمودار پیشرفت ماهانه
- آمار عملکرد روزانه و هفتگی
- ۵ کارت عملکردی (دوره‌ها، درس‌ها، XP روزانه، XP هفتگی، XP شنیداری)
- ویرایش پروفایل کاربر

### کتابخانه
- کتاب‌های PDF با جلد و سطح‌بندی
- خواننده PDF داخلی
- سازماندهی بر اساس سطح زبان

### دیگر ویژگی‌ها
- احراز هویت با NextAuth (Credentials + JWT)
- طراحی RTL فارسی با تم تاریک
- انیمیشن‌ها با Framer Motion
- ریسپانسیو (موبایل و دسکتاپ)

---

## تکنولوژی‌ها

| تکنولوژی | نسخه | کاربرد |
|:---|:---:|:---|
| Next.js (App Router) | 16 | فریمورک فرانت‌اند |
| React | 19 | کتابخانه UI |
| TypeScript | 5 | تایپ‌گذاری |
| Prisma ORM | 6 | ارتباط با دیتابیس |
| MySQL | 8 | دیتابیس |
| NextAuth | 4 | احراز هویت |
| Tailwind CSS | 4 | استایل‌دهی |
| Framer Motion | 12 | انیمیشن |
| Lucide React | - | آیکون‌ها |
| bcryptjs | - | هش رمز عبور |

---

## مدل‌های دیتابیس

```
user              ← کاربران (نام، ایمیل، رمز، آواتار)
course            ← دوره‌ها (عنوان، سطح، رنگ، ترتیب)
lesson            ← درس‌ها (محتوا، ویدیو، XP، نوع)
lessonprogress    ← پیشرفت درس (کاربر ← درس)
enrollment        ← ثبت‌نام دوره (کاربر ← دوره)
streak            ← استریک (روزهای متوالی)
exercise          ← تمرینات (چندگزینه‌ای، جای‌خالی، مطابقت)
Book              ← کتاب‌های PDF
ListeningEpisode  ← اپیزودهای شنیداری (صوتی، رونویس، جای‌خالی‌ها)
ListeningProgress ← پیشرفت شنیداری (کاربر ← اپیزود)
```

---

## پیش‌نیازها

- **Node.js** نسخه 18 یا بالاتر
- **MySQL** نسخه 8 (محلی یا ابری)
- **npm** یا **yarn**

---

## نصب و راه‌اندازی

### ۱. کلون کردن پروژه

```bash
git clone https://github.com/Alikley/Learn-English.git
cd Learn-English
```

### ۲. نصب وابستگی‌ها

```bash
npm install
```

### ۳. ساخت دیتابیس

```sql
CREATE DATABASE English CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### ۴. تنظیم متغیرهای محیطی

فایل `.env` رو ایجاد کنید:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/English"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="یک-رشته-تصادفی-امنیتی"
```

### ۵. اجرای مایگریشن‌ها

```bash
npx prisma migrate deploy
```

### ۶. وارد کردن داده‌های اولیه

```bash
npx tsx prisma/seed.ts
```

این دستور ۱۲ دوره (با ۶۰ درس)، ۲ کتاب PDF و ۱ اپیزود شنیداری ایجاد می‌کنه.

### ۷. اجرای پروژه

```bash
npm run dev
```

پروژه در آدرس [http://localhost:3000](http://localhost:3000) در دسترس خواهد بود.

---

## دیپلوی روی Vercel

### ۱. تنظیم دیتابیس ابری

برای دیپلوی نیاز به یه دیتابیس MySQL ابری دارید (مثل Aiven یا Railway).

### ۲. مایگریشن روی دیتابیس ابری

```bash
# ویندوز (PowerShell)
$env:DATABASE_URL = "mysql://user:pass@host:port/dbname?ssl-mode=REQUIRED"

# لینوکس/مک
export DATABASE_URL="mysql://user:pass@host:port/dbname?ssl-mode=REQUIRED"

npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### ۳. تنظیم متغیرهای محیطی در Vercel

| متغیر | مقدار | نوع |
|:---|:---|:---:|
| `DATABASE_URL` | آدرس دیتابیس ابری | Secret |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Secret |
| `NEXTAUTH_SECRET` | یه رشته تصادفی قوی | Secret |

---

## ساختار پروژه

```
my-app/
├── app/                    # صفحات و API Routes
│   ├── api/                # 15 اندپوینت API
│   ├── components/         # کامپوننت‌های UI
│   ├── context/            # React Context (Auth, Notification)
│   ├── hook/               # Custom Hooks
│   ├── dashboard/          # داشبورد
│   ├── courses/            # دوره‌ها و درس‌ها
│   ├── training/           # تمرین شنیداری
│   ├── library/            # کتابخانه PDF
│   └── (auth)/             # ورود و ثبت‌نام
├── prisma/                 # Prisma Schema, Seed, Migrations
├── lib/                    # ابزارهای سمت سرور
├── types/                  # تایپ‌های TypeScript
├── data/                   # داده‌های درس
├── public/                 # فایل‌های استاتیک (صوتی، PDF، تصاویر)
└── .env                    # متغیرهای محیطی
```

---

## اسکریپت‌ها

| دستور | توضیح |
|:---|:---|
| `npm run dev` | اجرای سرور توسعه |
| `npm run build` | بیلد پروداکشن |
| `npm run start` | اجرای سرور پروداکشن |
| `npm run lint` | بررسی خطاهای کد |
| `npx prisma migrate deploy` | اعمال مایگریشن‌های دیتابیس |
| `npx tsx prisma/seed.ts` | وارد کردن داده‌های اولیه |
| `npx prisma studio` | باز کردن مدیریت دیتابیس در مرورگر |

---

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

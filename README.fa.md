<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,35:171717,70:303030,100:050505&height=190&section=header&text=AION&fontSize=54&fontColor=ffffff&fontAlignY=38&desc=AI%20ORIENTED%20INTERACTION%20NOTATION&descAlignY=62&descSize=13" width="100%" />

<br/>

<img src="https://img.shields.io/badge/NEXT.JS-111111?style=for-the-badge&logo=nextdotjs&logoColor=white" /> <img src="https://img.shields.io/badge/TYPESCRIPT-111111?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/VERCEL-111111?style=for-the-badge&logo=vercel&logoColor=white" /> <img src="https://img.shields.io/github/stars/TheROMZ52/AION?style=for-the-badge&color=111111&labelColor=050505&logo=github" /> <img src="https://img.shields.io/github/last-commit/TheROMZ52/AION?style=for-the-badge&color=111111&labelColor=050505" />

<br/>

### یه زبان جمع‌وجور برای توضیح رفتار هوش مصنوعی؛ چون گفتنِ «عادی رفتار کن» همیشه جواب نمی‌ده.

<img src="https://skillicons.dev/icons?i=ts,nextjs,react,nodejs,vercel&theme=dark" />

</div>

---

**AI Oriented Interaction Notation** یک زبان فشرده برای توصیف شخصیت هوش مصنوعی، شیوهٔ ارتباط، روابط، ترجیحات، حافظه، زمینه و اصول رفتاری پایدار است.

---

## 01 / وضعیت پروژه

AION در حال حاضر دارای زنجیرهٔ قطعی زیر است:

`parser → semantic analysis → IR → printer/prompt`

همچنین از حل زمینه‌محور دستورهای `REACT` و یک HTTP API برای اتصال عامل‌های هوش مصنوعی پشتیبانی می‌کند.

---

## 02 / لایه‌های زبان

- `MIND` — شخصیت پایهٔ هوش مصنوعی
- `VOICE` — لحن و سبک ارتباط
- `BOND` — مدل رابطه
- `PREF` — ترجیحات متعلق به کاربر
- `MEMORY` — وضعیت پایدار و نشست فعلی
- `PERSONA` — قوانین رفتاری پایدار
- `PRIME` — اصول بنیادین و پایدار
- `REACT` — بازنویسی‌های موقت وابسته به زمینه

---

## 03 / مدل اجرا

`MIND` رفتار پایه را تعریف می‌کند. دستورهای `REACT` بر اساس زمینهٔ فعلی ارزیابی می‌شوند و بدون تغییر دادن شخصیت پایه، تغییرات موقت را روی آن اعمال می‌کنند.

قواعد عمومی `ANY` زودتر از انتخابگرهای اختصاصی‌تر اجرا می‌شوند؛ بنابراین قواعد دقیق‌تر می‌توانند رفتار عمومی را بازنویسی کنند.

---

## 04 / API عامل هوش مصنوعی

مسیر کامپایلر برای اتصال ماشین‌ها:

```http
POST /api/agent
Content-Type: application/json
```

نمونهٔ درخواست:

```json
{
  "description": "یک هوش مصنوعی گرم و خودمونی بساز که وقتی کاربر ناراحت است شوخی نکند."
}
```

پاسخ شامل AION اعتبارسنجی‌شده و پرامپت قطعی زمان اجرا است:

```json
{
  "ok": true,
  "api_version": "1",
  "compiler_version": "1.5",
  "aion": "...",
  "prompt": "...",
  "valid": true
}
```

برای شناسایی قابلیت‌های API، از `GET /api/agent` استفاده کن. فایل مانیفست ثابت نیز در مسیر `/aion-agent.json` قرار دارد.

همچنین می‌توان با ارسال توضیح طبیعی و URL-encoded در پارامتر `?prompt=` از درخواست GET برای کامپایل استفاده کرد.

حداکثر طول ورودی API برابر با ۴۰۰۰ نویسه است و CORS برای اتصال ابزارها و عامل‌های خارجی فعال است.

---

## 05 / توسعه

```bash
npm install
npm run build
```

این پروژه از شاخهٔ `main` به Vercel مستقر می‌شود.

---

<div align="center">

<a href="https://github.com/TheROMZ52?tab=repositories"><img src="https://img.shields.io/badge/MORE%20PROJECTS-111111?style=for-the-badge&logo=github&logoColor=white" /></a>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,50:202020,100:050505&height=110&section=footer" width="100%" />

<sub>© TheROMZ52 • ساخته‌شده با کد، کنجکاوی و تعداد مشکوکی تب باز.</sub>

</div>

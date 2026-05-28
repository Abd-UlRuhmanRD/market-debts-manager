# دفتر ديون السوق

تطبيق Next.js 15 + TypeScript لإدارة ديون سوق صغير بواجهة عربية RTL. التخزين يتم عبر Prisma على Neon PostgreSQL.

## التشغيل المحلي

1. ثبّت الحزم:

   ```bash
   npm install
   ```

2. أنشئ ملف `.env.local` من `.env.example` وضع رابط Neon:

   ```env
   DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-nameless-forest-aphuw5c9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

   لا تستخدم `channel_binding=require` مع Prisma.

3. أنشئ الجداول على Neon:

   ```bash
   npx prisma db push
   ```

4. شغّل التطبيق:

   ```bash
   npm run dev
   ```

5. افتح:

   ```text
   http://localhost:3000
   ```

## أوامر مهمة

```bash
npx prisma generate
npx prisma db push
npm run dev
npm run build
```

## Netlify

ملف `netlify.toml` يستخدم `@netlify/plugin-nextjs`. في Netlify أضف:

| المتغير | القيمة |
| --- | --- |
| `DATABASE_URL` | رابط Neon إلى قاعدة `neondb` مع `sslmode=require` |
| `NODE_VERSION` | `20` |

لا تحتاج إلى `netlify/functions` منفصلة؛ Route Handlers داخل `app/api/*` تتحول إلى serverless تلقائياً.

## GitHub

من داخل `E:\Programming\Programming\mat`:

```bash
git init
git add .
git commit -m "Build market debt manager with Next and Prisma"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

لا ترفع `.env` أو `.env.local`. ارفع `.env.example` فقط.

## البنية

```text
app/
  api/
    people/route.ts
    summary/route.ts
    transactions/route.ts
  layout.tsx
  page.tsx
  globals.css
components/
  Dashboard.tsx
  DebtSection.tsx
  PersonCard.tsx
  TransactionModal.tsx
lib/
  api/debts.ts
  debts-repository.ts
  format.ts
  prisma.ts
prisma/
  schema.prisma
```

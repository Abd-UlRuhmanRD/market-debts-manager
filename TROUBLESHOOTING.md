# ملاحظات التحقق

إذا فشل الاتصال بقاعدة البيانات:

1. افتح Neon Console وتأكد أن قاعدة `neondb` فعالة وليست Paused.
2. انسخ رابط Pooled connection واحذف منه `channel_binding=require`.
3. تأكد أن `.env.local` يحتوي فقط:

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
   ```

4. شغّل:

   ```bash
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

5. في Netlify أضف `DATABASE_URL` نفسه في Environment variables قبل النشر.

# القرآن الكريم

تطبيق قرآن كريم عربي حديث مبني بـ React + Vite + TypeScript + Tailwind CSS، مع دعم القراءة والاستماع والبحث والعلامات المرجعية والتفسير والأذكار والتسبيح ومواقيت الصلاة وPWA.

## المصادر
- نص القرآن والبيانات والتلاوات: **Al Quran Cloud / Islamic Network**. الواجهة تستخدم `quran-uthmani` للنص العربي وواجهات الصوت/CDN الرسمية التابعة للخدمة. راجع: https://alquran.cloud/api و https://alquran.cloud/cdn و https://alquran.cloud/terms-and-conditions
- مواقيت الصلاة والتاريخ الهجري: **AlAdhan API**. راجع: https://aladhan.com/prayer-times-api

لا يتم توليد النص القرآني أو التفسير بواسطة الذكاء الاصطناعي. يتم جلب النص من المصدر الخارجي مباشرة، مع caching عبر PWA.

## التشغيل
```bash
npm install
npm run dev
```

## Production
```bash
npm run build
npm run preview
```

## Environment Variables
لا توجد أسرار مطلوبة حاليًا. الواجهات المستخدمة لا تتطلب API key. يوجد `.env.example` لتوثيق ذلك.

## PWA
تم إعداد Service Worker وWeb App Manifest عبر `vite-plugin-pwa`. بعد build يمكن تثبيت التطبيق من المتصفح الذي يدعم PWA.

## الملاحظات
- LocalStorage يحفظ الإعدادات والعلامات المرجعية وآخر قراءة والمدينة لمواقيت الصلاة.
- البيانات الثقيلة لا تُحمّل إلا عند فتح السورة/الميزة المطلوبة.
- الصوت يُبث من CDN خارجي ولا يتم تخزين جميع الملفات داخل المشروع.

## Audio Sources

Quran text is loaded from Al Quran Cloud. Recitation playback uses EveryAyah's public audio files for the supported reciters in the app, including Maher Al-Muaiqly, Yasser Ad-Dussary, Saood Ash-Shuraym, and Saad Al-Ghamdi. The app builds verse-by-verse playlists using the stable `SSSAAA.mp3` EveryAyah path, which avoids relying on unavailable surah-level identifiers.

Sources:
- https://alquran.cloud/api
- https://alquran.cloud/cdn
- https://everyayah.com/data/

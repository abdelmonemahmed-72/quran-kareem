# وضع Offline الكامل

التطبيق الآن لا يستخدم أي API أثناء التشغيل.

## 1) تجهيز القرآن وبيانات المصحف

من مجلد المشروع:

```powershell
npm install
npm run offline:prepare
```

هذا يضع القرآن وبيانات السور وخريطة صفحات المصحف داخل `public/data`.

## 2) تجهيز التلاوات

لتحميل كل القراء الموجودين في التطبيق:

```powershell
$env:OFFLINE_RECITERS="all"
npm run offline:audio
```

هذا تنزيل ضخم جدًا لأن كل قارئ يحتوي على ملفات الآيات كاملة.

للتجربة أولًا بقارئ واحد:

```powershell
$env:OFFLINE_RECITERS="Alafasy_128kbps"
npm run offline:audio
```

## 3) البناء

```powershell
npm run build
npm run cap:sync
```

ثم:

```powershell
cd android
./gradlew assembleDebug
```

## مهم

التطبيق بعد تضمين الملفات المحلية يعمل بدون إنترنت: القرآن، البحث، الأذكار، التسبيح، الإعدادات، الصلاة بالحساب المحلي، والتلاوات التي تم تنزيلها محليًا.

التفسير أزيل من التطبيق كما طلبت.

مصدر نص القرآن: `risan/quran-json`، ومصدر خريطة صفحات المصحف: `Mushaf-Learning/quran-text`. راجع تراخيص المصادر قبل إعادة توزيع البيانات الصوتية والنصية.

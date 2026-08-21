# تحويل القرآن الكريم إلى APK بدون Android Studio

المشروع الآن مجهز باستخدام Capacitor.

## محليًا عبر VS Code

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

> يحتاج جهاز البناء إلى Java وAndroid SDK/Build Tools. لا تحتاج إلى فتح Android Studio.

## بدون تثبيت Android SDK

ارفع المشروع إلى GitHub، ثم شغّل GitHub Actions من تبويب **Actions** واختر **Build Quran Kareem APK**. في نهاية التشغيل ستجد APK في Artifacts.

## بيانات التطبيق

- App name: القرآن الكريم
- Package ID: `com.qurankareem.app`
- Web directory: `dist`

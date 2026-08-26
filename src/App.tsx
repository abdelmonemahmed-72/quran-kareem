import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppProvider } from "./contexts/AppContext";
import AppLayout from "./layouts/AppLayout";

import Home from "./pages/Home";
import Quran from "./pages/Quran";
import Surah from "./pages/Surah";
import SearchPage from "./pages/SearchPage";
import Bookmarks from "./pages/Bookmarks";
import Azkar from "./pages/Azkar";
import Tasbeeh from "./pages/Tasbeeh";
import Prayer from "./pages/Prayer";
import Settings from "./pages/Settings";
import Download from "./pages/Download";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* صفحات مستقلة */}
          <Route path="/download" element={<Download />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* صفحات التطبيق */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />

            {/* القرآن */}
            <Route path="/quran" element={<Quran />} />
            <Route path="/quran/:id" element={<Surah />} />

            {/* البحث والمحفوظات */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookmarks" element={<Bookmarks />} />


            {/* الأذكار والتسبيح */}
            <Route path="/azkar" element={<Azkar />} />
            <Route path="/tasbeeh" element={<Tasbeeh />} />

            {/* الصلاة */}
            <Route path="/prayer" element={<Prayer />} />

            {/* الإعدادات */}
            <Route path="/settings" element={<Settings />} />

            {/* أي رابط غير معروف */}
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
import { Trash2, Sun, Moon, Monitor, Globe2 } from "lucide-react";
import { useApp } from "../contexts/AppContext";

export default function Settings() {
  const { settings, setSettings, bookmarks } = useApp();

  const patch = (p: any) =>
    setSettings({
      ...settings,
      ...p,
    });

  const clear = () => {
    if (confirm("هل تريد حذف جميع العلامات المرجعية؟")) {
      localStorage.removeItem("quran-bookmarks");
      location.reload();
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <div className="text-sm text-gold">
          تخصيص التجربة
        </div>

        <h1 className="text-3xl font-extrabold">
          الإعدادات
        </h1>
      </div>

      <div className="space-y-5">

        {/* المظهر */}
        <section className="surface">
          <h2 className="font-bold">المظهر</h2>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["light", "فاتح", Sun],
              ["dark", "داكن", Moon],
              ["system", "النظام", Monitor],
            ].map(([v, l, I]: any) => (
              <button
                key={v}
                className={`setting-choice ${
                  settings.theme === v ? "selected" : ""
                }`}
                onClick={() => patch({ theme: v })}
              >
                <I size={18} />
                {l}
              </button>
            ))}
          </div>
        </section>

        {/* اللغة */}
        <section className="surface">
          <h2 className="font-bold">اللغة</h2>

          <div className="mt-4 flex gap-2">
            <button
              className={`setting-choice flex-1 ${
                settings.language === "ar"
                  ? "selected"
                  : ""
              }`}
              onClick={() => patch({ language: "ar" })}
            >
              <Globe2 size={17} />
              العربية
            </button>

            <button
              className={`setting-choice flex-1 ${
                settings.language === "en"
                  ? "selected"
                  : ""
              }`}
              onClick={() => patch({ language: "en" })}
            >
              <Globe2 size={17} />
              English
            </button>
          </div>

          <p className="mt-3 text-xs text-muted">
            واجهة English الأساسية ستظل قابلة للتوسع مع
            الحفاظ على أسماء السور بالعربية والإنجليزية.
          </p>
        </section>

        {/* القراءة */}
        <section className="surface">
          <h2 className="font-bold">القراءة</h2>

          <label className="label">
            حجم الخط: {settings.fontSize}px
          </label>

          <input
            className="w-full accent-gold"
            type="range"
            min="20"
            max="44"
            value={settings.fontSize}
            onChange={(e) =>
              patch({
                fontSize: +e.target.value,
              })
            }
          />

          <label className="label">
            تباعد الأسطر: {settings.lineHeight}
          </label>

          <input
            className="w-full accent-gold"
            type="range"
            min="1.6"
            max="3"
            step=".1"
            value={settings.lineHeight}
            onChange={(e) =>
              patch({
                lineHeight: +e.target.value,
              })
            }
          />

          <label className="label">
            نوع الخط
          </label>

          <select
            className="input"
            value={settings.fontFamily}
            onChange={(e) =>
              patch({
                fontFamily: e.target.value,
              })
            }
          >
            <option value="amiri">Amiri</option>
            <option value="naskh">
              Noto Naskh Arabic
            </option>
            <option value="system">System</option>
          </select>
        </section>

        {/* البيانات */}
        <section className="surface">
          <h2 className="font-bold">
            البيانات
          </h2>

          <p className="mt-2 text-sm text-muted">
            لديك {bookmarks.length} علامة مرجعية محفوظة
            محليًا.
          </p>

          <button
            className="btn-danger mt-4"
            onClick={clear}
          >
            <Trash2 size={16} />
            حذف العلامات المرجعية
          </button>
        </section>

      </div>
    </div>
  );
}
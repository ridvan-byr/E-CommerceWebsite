"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, AlertCircle } from "lucide-react";
import { fetchCategory, updateCategory } from "@/lib/api/categoriesApi";
import { ApiRequestError } from "@/lib/api/client";

export default function CategoryEditPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  const [form, setForm] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadInit, setLoadInit] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadInit(true);
      setNotFound(false);
      try {
        const c = await fetchCategory(categoryId);
        if (cancelled) return;
        setForm({ name: c.name });
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoadInit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const redirectToCategoriesAfterCategorySave = (categoryName: string) => {
    const name = categoryName.trim() || "Kategori";
    try {
      sessionStorage.setItem(
        "ecommerce_categories_flash",
        JSON.stringify({ variant: "category-update", categoryName: name }),
      );
    } catch {
      /* ignore */
    }
    router.push("/categories");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Kategori adı zorunludur.";
    else if (form.name.length < 2) errs.name = "En az 2 karakter olmalıdır.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setApiError(null);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const updated = await updateCategory(categoryId, {
        name: form.name.trim(),
      });
      const displayName = updated.name?.trim() || form.name.trim() || "Kategori";
      redirectToCategoriesAfterCategorySave(displayName);
    } catch (err) {
      setApiError(
        err instanceof ApiRequestError ? err.message : "Güncelleme başarısız."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadInit) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-slate-500 text-sm">Yükleniyor…</div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/categories" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          Kategorilere Dön
        </Link>
        <div className="flex flex-col items-center gap-4 py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <h2 className="text-slate-900 font-bold text-lg">Kategori bulunamadı</h2>
          <p className="text-slate-500 text-sm">ID: #{categoryId} ile eşleşen bir kategori bulunamadı.</p>
          <Link href="/categories" className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all inline-flex items-center">
            Kategorilere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/categories" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
        <ArrowLeft size={16} />
        Kategorilere Dön
      </Link>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm">{apiError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Tag size={17} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-indigo-900 font-semibold text-sm">Kategori düzenle</h2>
            <p className="text-indigo-600 text-xs">ID: #{categoryId}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Tag size={17} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Kategori adı</h2>
              <p className="text-slate-400 text-xs">Liste ve filtrelerde bu ad görünür</p>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Kategori adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Örn: Elektronik, Giyim…"
              className={`w-full h-11 px-4 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.name ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/categories"
            className="flex-1 h-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Kaydet"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

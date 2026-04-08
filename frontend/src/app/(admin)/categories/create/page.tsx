"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle, Tag } from "lucide-react";
import { createCategory } from "@/lib/api/categoriesApi";
import { ApiRequestError } from "@/lib/api/client";

export default function CategoryCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Kategori adı zorunludur.";
    else if (form.name.length < 2) errs.name = "En az 2 karakter olmalıdır.";
    if (!form.description.trim()) errs.description = "Açıklama zorunludur.";
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
      await createCategory({
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl: form.image.trim() || null,
      });
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 1200));
      router.push("/categories");
    } catch (err) {
      setApiError(
        err instanceof ApiRequestError ? err.message : "Kayıt oluşturulamadı."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/categories" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
        <ArrowLeft size={16} />
        Kategorilere Dön
      </Link>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm">{apiError}</div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-700 text-sm font-medium">Kategori başarıyla oluşturuldu! Yönlendiriliyorsunuz...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Tag size={17} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Kategori Bilgileri</h2>
              <p className="text-slate-400 text-xs">Temel kategori bilgilerini girin</p>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Kategori Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Örn: Elektronik, Giyim..."
              className={`w-full h-11 px-4 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.name ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.name}</p>}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Kategori hakkında kısa bir açıklama..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.description}</p>}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <Upload size={17} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Kategori Görseli</h2>
              <p className="text-slate-400 text-xs">Kategoriyi temsil eden bir görsel yükleyin</p>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Görsel URL</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {form.image ? (
            <div className="relative">
              <img src={form.image} alt="Önizleme" className="w-full h-48 object-cover rounded-xl border border-slate-200" onError={(e) => (e.currentTarget.src = "")} />
              <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">Önizleme</span>
            </div>
          ) : (
            <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-50">
              <Upload size={24} className="text-slate-300" />
              <p className="text-slate-400 text-sm">Görsel URL girerek önizleme yapın</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/categories"
            className="flex-1 h-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Kategori Oluştur"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

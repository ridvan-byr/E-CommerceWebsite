"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { createCategory } from "@/lib/api/categoriesApi";
import { ApiRequestError } from "@/lib/api/client";
import FadeUp from "@/components/FadeUp";

export default function CategoryCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
      const created = await createCategory({
        name: form.name.trim(),
      });
      const displayName = created.name?.trim() || form.name.trim() || "Kategori";
      try {
        sessionStorage.setItem(
          "ecommerce_categories_flash",
          JSON.stringify({ variant: "category-create", categoryName: displayName }),
        );
      } catch {
        /* ignore */
      }
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
      <FadeUp delay={0}>
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft size={16} />
          Kategorilere Dön
        </Link>
      </FadeUp>

      {apiError && (
        <FadeUp delay={0}>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {apiError}
          </div>
        </FadeUp>
      )}

      <FadeUp delay={80}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="admin-card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-700/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
              <Tag size={17} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-50">Yeni kategori</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Yalnızca kategori adı yeterlidir</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Kategori adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Örn: Elektronik, Giyim…"
              className={`h-11 w-full rounded-xl border px-4 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 dark:placeholder:text-slate-500 ${errors.name ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30" : "border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/categories"
            className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
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
              "Kategori oluştur"
            )}
          </button>
        </div>
      </form>
      </FadeUp>
    </div>
  );
}

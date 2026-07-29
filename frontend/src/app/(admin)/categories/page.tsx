"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Package, Tag } from "lucide-react";
import { fetchCategories, deleteCategory } from "@/lib/api/categoriesApi";
import type { CategoryDto } from "@/lib/api/types";
import { ApiRequestError } from "@/lib/api/client";
import { useToast } from "@/components/Toast";
import FadeUp from "@/components/FadeUp";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("ecommerce_categories_flash");
      if (!raw) return;
      sessionStorage.removeItem("ecommerce_categories_flash");
      const data = JSON.parse(raw) as { variant?: string; categoryName?: string };
      if (!data.categoryName) return;
      if (data.variant === "category-create") {
        toast.success(`"${data.categoryName}" oluşturuldu.`, "Kategori eklendi");
      } else if (data.variant === "category-update") {
        toast.success(`"${data.categoryName}" güncellendi.`, "Kategori güncellendi");
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchCategories();
      setCategories(list);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: number) => {
    setDeleting(true);
    const removed = categories.find((c) => c.categoryId === id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.categoryId !== id));
      setDeleteId(null);
      toast.success(
        removed ? `"${removed.name}" silindi.` : "Kategori silindi.",
        "Silindi",
      );
    } catch (e) {
      toast.error(
        e instanceof ApiRequestError ? e.message : "Kategori silinemedi.",
        "Silme başarısız",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FadeUp delay={0}>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            placeholder="Kategori adına göre ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        <Link
          href="/categories/create"
          className="flex items-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 whitespace-nowrap"
        >
          <Plus size={17} />
          Yeni kategori
        </Link>
      </div>
      </FadeUp>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="font-medium text-red-600 underline dark:text-red-400"
          >
            Tekrar dene
          </button>
        </div>
      )}

      <FadeUp delay={80}>
      {loading ? (
        <div className="space-y-4">
          <div className="overflow-hidden admin-card-soft">
            <div className="divide-y divide-slate-100 dark:divide-slate-700/70">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="skeleton h-11 w-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-40" />
                    <div className="skeleton h-3 w-16" />
                  </div>
                  <div className="skeleton h-6 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/80 dark:bg-slate-800/60">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Ürün sayısı
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Oluşturulma
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Oluşturan
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/70">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                            <Package size={24} className="text-slate-500 dark:text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Arama kriterine uygun kategori bulunamadı.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((category) => (
                      <tr
                        key={category.categoryId}
                        className="group transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
                              <Tag size={20} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{category.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{category.categoryId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{category.productCount}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">ürün</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(category.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {category.createdBy?.trim() || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/categories/${category.categoryId}`}
                              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                            >
                              <Edit2 size={13} />
                              Düzenle
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteId(category.categoryId)}
                              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            >
                              <Trash2 size={13} />
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      </FadeUp>

      {deleteId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60">
          <div className="admin-card w-full max-w-sm animate-fade-in p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50">
              <Trash2 size={22} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-50">Kategoriyi sil</h3>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex h-10 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-60"
              >
                {deleting ? "Siliniyor…" : "Evet, sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

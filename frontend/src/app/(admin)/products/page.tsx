"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  SlidersHorizontal,
  Eye,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { searchProducts, deleteProduct } from "@/lib/api/productsApi";
import { fetchCategories } from "@/lib/api/categoriesApi";
import type { ProductDto } from "@/lib/api/types";
import type { CategoryDto } from "@/lib/api/types";
import { ApiRequestError } from "@/lib/api/client";
import { getProductStatusInfo } from "@/lib/productStatus";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [listFlash, setListFlash] = useState<{ productName: string } | null>(null);
  const [toastEnter, setToastEnter] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("ecommerce_products_flash");
      if (!raw) return;
      sessionStorage.removeItem("ecommerce_products_flash");
      const data = JSON.parse(raw) as { variant?: string; productName?: string };
      if (!data.productName || data.variant !== "product-update") return;
      setListFlash({ productName: data.productName });
    } catch {
      /* ignore */
    }
  }, []);

  const closeToast = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setToastExiting(true);
    window.setTimeout(() => {
      setListFlash(null);
      setToastExiting(false);
      setToastEnter(false);
    }, 280);
  }, []);

  useEffect(() => {
    if (!listFlash) return;
    setToastExiting(false);
    setToastEnter(false);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setToastEnter(true));
    });
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    autoCloseTimerRef.current = setTimeout(() => {
      autoCloseTimerRef.current = null;
      closeToast();
    }, 2000);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [listFlash, closeToast]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetchCategories(),
        searchProducts({
          search: search.trim() || undefined,
          categoryId:
            selectedCategory === "all" ? undefined : Number(selectedCategory),
          status: selectedStatus === "all" ? undefined : selectedStatus,
          page: 1,
          pageSize: 200,
        }),
      ]);
      setCategories(catRes);
      setProducts(prodRes.items);
      setTotalCount(prodRes.totalCount);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedStatus]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.productId !== id));
      setDeleteId(null);
    } catch (e) {
      alert(e instanceof ApiRequestError ? e.message : "Silinemedi");
    } finally {
      setDeleting(false);
    }
  };

  const img = (p: ProductDto) =>
    p.imageUrl?.trim() || "https://placehold.co/96x96/e2e8f0/64748b?text=Ü";

  return (
    <>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            placeholder="Ürün adı, SKU veya barkod ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        <Link
          href="/products/create"
          className="flex items-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 whitespace-nowrap"
        >
          <Plus size={17} />
          Yeni Ürün
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
          <SlidersHorizontal size={15} />
          <span className="text-sm font-medium">Filtrele:</span>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={String(c.categoryId)}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-9 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
          <option value="draft">Taslak</option>
        </select>
        {(selectedCategory !== "all" || selectedStatus !== "all" || search) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
              setSelectedStatus("all");
            }}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:border-slate-600 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Temizle
          </button>
        )}
      </div>

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

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-slate-600 dark:text-slate-400">
          <Loader2 className="animate-spin" size={22} />
          <span className="text-sm">Ürünler yükleniyor…</span>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-4 dark:border-slate-700/80">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-50">{products.length}</span> kayıt (toplam:{" "}
              {totalCount})
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90 dark:border-slate-700/80 dark:bg-slate-800/60">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Ürün
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Fiyat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Puan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/70">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                          <Package size={24} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Kayıt yok veya filtreye uygun ürün bulunamadı.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const status = getProductStatusInfo(product.status);
                    return (
                      <tr key={product.productId} className="transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={img(product)}
                              alt={product.name}
                              className="h-12 w-12 flex-shrink-0 rounded-xl bg-slate-100 object-cover dark:bg-slate-800"
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{product.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {product.sku}
                                {product.barcode ? <span className="text-slate-300 dark:text-slate-600"> · </span> : null}
                                {product.barcode ? (
                                  <span className="font-mono">{product.barcode}</span>
                                ) : null}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex h-6 items-center rounded-lg bg-slate-100 px-2.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {product.categoryName ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                              ₺{Number(product.price).toLocaleString("tr-TR")}
                            </span>
                            {product.isDiscount && product.originalPrice != null && (
                              <p className="text-xs text-slate-400 line-through dark:text-slate-500">
                                ₺{Number(product.originalPrice).toLocaleString("tr-TR")}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-sm font-semibold ${
                              product.stock === 0
                                ? "text-red-600 dark:text-red-400"
                                : product.stock < 30
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {product.stock === 0 ? "Tükendi" : product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">—</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-3 py-4 sm:px-6">
                          <div className="flex max-w-[220px] flex-wrap items-center justify-end gap-1.5 sm:max-w-none sm:flex-nowrap sm:gap-2">
                            <Link
                              href={`/products/${product.productId}/preview`}
                              className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-600 transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-400 sm:gap-1.5 sm:px-3 sm:text-xs"
                            >
                              <Eye size={13} />
                              Görüntüle
                            </Link>
                            <Link
                              href={`/products/${product.productId}`}
                              className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 sm:gap-1.5 sm:px-3 sm:text-xs"
                            >
                              <Edit2 size={13} />
                              Düzenle
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteId(product.productId)}
                              className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400 sm:gap-1.5 sm:px-3 sm:text-xs"
                            >
                              <Trash2 size={13} />
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/60">
          <div className="admin-card w-full max-w-sm p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50">
              <Trash2 size={22} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-50">Ürünü Sil</h3>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
                {deleting ? "Siliniyor…" : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {listFlash && (
        <div
          className="fixed bottom-4 right-4 z-[80] max-w-[min(calc(100vw-2rem),17.5rem)] pointer-events-none sm:bottom-6 sm:right-6"
          aria-live="polite"
        >
          <div
            role="status"
            className={[
              "pointer-events-auto overflow-hidden rounded-xl border border-emerald-200/90 bg-white/95 text-emerald-950 shadow-lg shadow-slate-900/8 dark:border-emerald-800/80 dark:bg-slate-900/95 dark:text-emerald-100 dark:shadow-black/20",
              "transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              toastEnter && !toastExiting ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            ].join(" ")}
          >
            <div className="flex gap-2.5 p-3 pr-2">
              <CheckCircle
                className="mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400"
                size={18}
                strokeWidth={2}
                aria-hidden
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-xs font-semibold leading-tight text-emerald-900 dark:text-emerald-100">
                  Ürün bilgileri kaydedildi
                </p>
                <p className="mt-1 text-[11px] leading-snug text-emerald-800/85 dark:text-emerald-300/90">
                  <span className="font-medium">&quot;{listFlash.productName}&quot;</span> kaydedildi.
                </p>
              </div>
              <button
                type="button"
                onClick={closeToast}
                className="shrink-0 rounded-lg p-1 text-emerald-700/80 transition-colors hover:bg-emerald-100/80 hover:text-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-100"
                aria-label="Kapat"
              >
                <X size={15} />
              </button>
            </div>
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-emerald-100/90 dark:bg-emerald-900/50">
              <div
                className="h-full w-full origin-left rounded-full bg-emerald-500/85"
                style={{ animation: "toast-progress 2s linear forwards" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Edit2,
  X,
  Package,
  Eye,
  Loader2,
} from "lucide-react";
import { searchProducts } from "@/lib/api/productsApi";
import { fetchCategories } from "@/lib/api/categoriesApi";
import type { ProductDto } from "@/lib/api/types";
import type { CategoryDto } from "@/lib/api/types";
import { getProductStatusInfo } from "@/lib/productStatus";
import { resolveImageUrl } from "@/lib/imageUrl";
import FadeUp from "@/components/FadeUp";

const img = (p: ProductDto) =>
  resolveImageUrl(p.imageUrl) || "https://placehold.co/96x96/e2e8f0/64748b?text=Ü";

export default function ProductSearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const minP = minPrice.trim() ? Number(minPrice) : undefined;
    const maxP = maxPrice.trim() ? Number(maxPrice) : undefined;
    const minS = minStock.trim() ? Number(minStock) : undefined;
    const sortParam =
      sortBy === "name" ? undefined : sortBy === "price_asc" || sortBy === "price_desc" || sortBy === "stock" ? sortBy : undefined;

    try {
      const [catRes, prodRes] = await Promise.all([
        fetchCategories(),
        searchProducts({
          search: query.trim() || undefined,
          categoryId: selectedCategory === "all" ? undefined : Number(selectedCategory),
          status: selectedStatus === "all" ? undefined : selectedStatus,
          minPrice: minP !== undefined && !Number.isNaN(minP) ? minP : undefined,
          maxPrice: maxP !== undefined && !Number.isNaN(maxP) ? maxP : undefined,
          minStock: minS !== undefined && !Number.isNaN(minS) && minS >= 0 ? Math.floor(minS) : undefined,
          sortBy: sortParam,
          page: 1,
          pageSize: 200,
        }),
      ]);
      setCategories(catRes);
      setProducts(prodRes.items);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Yüklenemedi");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, selectedStatus, minPrice, maxPrice, minStock, sortBy]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const hasFilters =
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    minPrice ||
    maxPrice ||
    minStock ||
    sortBy !== "name";

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setMinPrice("");
    setMaxPrice("");
    setMinStock("");
    setSortBy("name");
  };

  return (
    <div className="space-y-6">
      <FadeUp delay={0}>
      <div className="admin-card p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün adı, SKU, barkod veya açıklama ile ara..."
              autoFocus
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all ${showFilters || hasFilters ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/90"}`}
          >
            <SlidersHorizontal size={16} />
            Filtreler
            {hasFilters && <span className="w-2 h-2 bg-indigo-600 rounded-full" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-700 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200"
              >
                <option value="all">Tümü</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={String(c.categoryId)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Durum
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200"
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="draft">Taslak</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Min Fiyat (₺)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Max Fiyat (₺)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="999999"
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Min Stok
              </label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="0"
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200"
              />
            </div>
            {hasFilters && (
              <div className="flex items-end col-span-2 sm:col-span-1">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-9 w-full rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="shrink-0 font-medium text-red-600 underline dark:text-red-400"
          >
            Tekrar dene
          </button>
        </div>
      )}

      <div className="flex items-center justify-end flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="name">İsme Göre</option>
            <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="stock">Stok: Fazladan Aza</option>
          </select>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-600 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>
      </FadeUp>

      <FadeUp delay={80}>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-slate-600 dark:text-slate-400">
          <Loader2 className="animate-spin" size={22} />
          <span className="text-sm">Ürünler yükleniyor…</span>
        </div>
      ) : products.length === 0 ? (
        <div className="admin-card p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Package size={28} className="text-slate-500 dark:text-slate-400" />
          </div>
          <p className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Sonuç Bulunamadı</p>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Arama kriterlerinizi değiştirmeyi deneyin.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              clearFilters();
            }}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-indigo-50 px-4 text-sm font-medium text-indigo-600 transition-all hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950"
          >
            <X size={14} /> Aramayı Temizle
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, i) => {
            const status = getProductStatusInfo(product.status);
            return (
              <FadeUp key={product.productId} delay={i * 40} distance={20} className="flex flex-col">
              <div className="admin-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col flex-1">
                {/* Görsel */}
                <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={img(product)}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  <span
                    className={`absolute top-2.5 right-2.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${status.className}`}
                  >
                    {status.label}
                  </span>
                  {product.isDiscount && product.originalPrice != null && (
                    <span className="absolute top-2.5 left-2.5 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-sm">
                      -%{Math.round((1 - product.price / product.originalPrice) * 100)}
                    </span>
                  )}
                </div>

                {/* İçerik */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {product.categoryName ?? "—"}
                    </span>
                    {product.barcode && (
                      <>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
                        <span
                          className="truncate font-mono text-[10px] text-slate-500 dark:text-slate-400"
                          title={product.barcode}
                        >
                          {product.barcode}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="mb-1 line-clamp-2 flex-1 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
                    {product.name}
                  </h3>
                  <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                    Stok:{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{product.stock}</span>
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/80">
                    <div>
                      <span className="text-base font-bold leading-none text-slate-900 dark:text-slate-50">
                        ₺{product.price.toLocaleString("tr-TR")}
                      </span>
                      {product.isDiscount && product.originalPrice != null && (
                        <p className="mt-0.5 text-xs text-slate-400 line-through dark:text-slate-500">
                          ₺{product.originalPrice.toLocaleString("tr-TR")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Link
                        href={`/products/${product.productId}/preview`}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-all hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-400 dark:hover:bg-sky-950"
                        title="Önizle"
                      >
                        <Eye size={13} />
                      </Link>
                      <Link
                        href={`/products/${product.productId}`}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-all hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950"
                        title="Düzenle"
                      >
                        <Edit2 size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              </FadeUp>
            );
          })}
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700/70">
            {products.map((product) => {
              const status = getProductStatusInfo(product.status);
              return (
                <div
                  key={product.productId}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/40"
                >
                  <img
                    src={img(product)}
                    alt={product.name}
                    className="h-14 w-14 flex-shrink-0 rounded-xl bg-slate-100 object-cover dark:bg-slate-800"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{product.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {product.sku}
                      {product.barcode ? (
                        <>
                          {" "}
                          · <span className="font-mono">{product.barcode}</span>
                        </>
                      ) : null}
                      {" · "}
                      {product.categoryName ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                      ₺{product.price.toLocaleString("tr-TR")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Stok: {product.stock}</p>
                  </div>
                  <div className="ml-2 flex items-center gap-1.5">
                    <Link
                      href={`/products/${product.productId}/preview`}
                      className="flex h-8 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-400"
                    >
                      <Eye size={13} />
                    </Link>
                    <Link
                      href={`/products/${product.productId}`}
                      className="flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                    >
                      <Edit2 size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </FadeUp>
    </div>
  );
}

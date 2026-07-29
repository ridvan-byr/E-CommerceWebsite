"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Tag,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  Clock,
  AlertCircle,
  Sparkles,
  PlusCircle,
  Search as SearchIcon,
  Layers,
} from "lucide-react";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { searchProducts } from "@/lib/api/productsApi";
import type { CategoryDto, ProductDto } from "@/lib/api/types";
import { ApiRequestError } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/currentUser";
import { dashboardStats, recentOrders } from "@/lib/mockData";
import { getProductStatusInfo } from "@/lib/productStatus";
import { resolveImageUrl } from "@/lib/imageUrl";
import FadeUp from "@/components/FadeUp";

const CATEGORY_BAR_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

const orderStatusStyles: Record<string, string> = {
  completed:
    "bg-emerald-50 text-emerald-700 ring-emerald-200/50 dark:bg-emerald-950/45 dark:text-emerald-300 dark:ring-emerald-800/40",
  processing:
    "bg-blue-50 text-blue-700 ring-blue-200/50 dark:bg-blue-950/45 dark:text-blue-300 dark:ring-blue-800/40",
  shipped:
    "bg-indigo-50 text-indigo-700 ring-indigo-200/50 dark:bg-indigo-950/45 dark:text-indigo-300 dark:ring-indigo-800/40",
  pending:
    "bg-amber-50 text-amber-700 ring-amber-200/50 dark:bg-amber-950/45 dark:text-amber-300 dark:ring-amber-800/40",
  cancelled:
    "bg-slate-100 text-slate-600 ring-slate-200/60 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-600/50",
};
const orderStatusLabels: Record<string, string> = {
  completed: "Tamamlandı",
  processing: "İşleniyor",
  shipped: "Kargoda",
  pending: "Bekliyor",
  cancelled: "İptal",
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

/* ---------------------------------------------------------------- */
/* Sayfa                                                             */
/* ---------------------------------------------------------------- */

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useCurrentUser();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [topProducts, setTopProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [cats, topResp] = await Promise.all([
          fetchCategories(),
          searchProducts({ sortBy: "stock", page: 1, pageSize: 5 }),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setTopProducts(topResp.items);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiRequestError
            ? err.message
            : "Kontrol paneli verileri alınamadı.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCategoryProductCount = categories.reduce(
    (sum, c) => sum + (c.productCount ?? 0),
    0,
  );

  const nameForHero = useMemo(() => {
    if (profileLoading && !profile) return greeting();
    if (!profile) return "Hoş geldin";
    const n = profile.name?.trim();
    return n ? `${greeting()}, ${n}` : greeting();
  }, [profile, profileLoading]);

  return (
    <div className="space-y-6">
      {/* Hero greeting card */}
      <FadeUp delay={0}>
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-indigo-50/70 p-6 text-slate-900 shadow-[0_10px_40px_-15px_rgb(15_23_42/0.1)] dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 dark:text-white dark:shadow-[0_10px_40px_-20px_rgb(15_23_42/0.6)] lg:p-8">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.2] dark:hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden opacity-[0.06] dark:block"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-500/30"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/25"
        />

        <div className="relative flex flex-col gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-700 ring-1 ring-indigo-200/90 dark:bg-white/10 dark:text-indigo-200 dark:ring-white/10">
              <Sparkles size={12} />
              Yönetim paneli
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-[34px]">
              {nameForHero}
            </h1>
            <p className="mt-2 max-w-lg text-[14px] text-slate-600 dark:text-slate-300">
              Bugün mağazanızda neler olup bittiğine hızlıca göz atın. Kategorilerinizi ve ürünlerinizi
              aşağıdan yönetebilirsiniz.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/products/create"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <PlusCircle size={15} />
                Yeni Ürün
              </Link>
              <Link
                href="/products/search"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-transparent dark:bg-white/5 dark:text-white dark:shadow-none dark:ring-1 dark:ring-white/15 dark:hover:bg-white/10"
              >
                <SearchIcon size={15} />
                Ürün Ara
              </Link>
              <Link
                href="/categories/create"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-transparent dark:bg-white/5 dark:text-white dark:shadow-none dark:ring-1 dark:ring-white/15 dark:hover:bg-white/10"
              >
                <Layers size={15} />
                Yeni Kategori
              </Link>
            </div>
          </div>
        </div>
      </section>
      </FadeUp>

      {loadError && (
        <FadeUp delay={50}>
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <AlertCircle size={16} />
            <span className="flex-1">{loadError}</span>
          </div>
        </FadeUp>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Orders (mock) */}
        <FadeUp delay={80} className="xl:col-span-2">
        <div className="overflow-hidden admin-card-soft h-full">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-700/80 sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h2 className="font-display font-semibold text-slate-900 dark:text-slate-50">
                  Son Siparişler
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Sipariş modülü eklenene kadar örnek veridir
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800 ring-1 ring-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/50">
                Örnek
              </span>
            </div>
            <Link
              href="/orders"
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Tüm siparişler <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/70">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/70 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-600/70">
                    <ShoppingCart size={16} className="text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {order.customer}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {order.product}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                    ₺{order.amount.toLocaleString("tr-TR")}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${orderStatusStyles[order.status] ?? ""}`}
                  >
                    {orderStatusLabels[order.status] ?? order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </FadeUp>

        {/* Category Overview (live) */}
        <FadeUp delay={160}>
        <div className="overflow-hidden admin-card-soft">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-700/80">
            <div>
              <h2 className="font-display font-semibold text-slate-900 dark:text-slate-50">
                Kategoriler
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Ürün dağılımı</p>
            </div>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Tümü <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4 p-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-3.5 w-28" />
                    <div className="skeleton h-3 w-10" />
                  </div>
                  <div className="skeleton h-1.5 w-full" />
                </div>
              ))
            ) : categories.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                Henüz kategori yok.
              </p>
            ) : (
              categories.map((cat, i) => {
                const pct =
                  totalCategoryProductCount > 0
                    ? Math.round((cat.productCount / totalCategoryProductCount) * 100)
                    : 0;
                return (
                  <div key={cat.categoryId}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <Link
                        href={`/categories/${cat.categoryId}`}
                        className="text-sm font-medium text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                      >
                        {cat.name}
                      </Link>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {cat.productCount} ürün · %{pct}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          CATEGORY_BAR_COLORS[i % CATEGORY_BAR_COLORS.length]
                        } transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        </FadeUp>
      </div>

      {/* Top Products (live) */}
      <FadeUp delay={100}>
      <div className="overflow-hidden admin-card-soft">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/80">
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-slate-50">
              Öne Çıkan Ürünler
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Stoğu en yüksek 5 ürün</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Tüm Ürünler <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/60">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Ürün
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Fiyat
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Stok
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/70">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="skeleton h-10 w-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton h-3 w-40" />
                          <div className="skeleton h-2.5 w-24" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : topProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Henüz ürün yok.
                  </td>
                </tr>
              ) : (
                topProducts.map((product) => {
                  const status = getProductStatusInfo(product.status);
                  const image =
                    resolveImageUrl(product.imageUrl) ||
                    "https://placehold.co/80x80/e2e8f0/64748b?text=Ü";
                  return (
                    <tr
                      key={product.productId}
                      className="transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/products/${product.productId}/preview`}
                          className="group flex items-center gap-3"
                        >
                          <img
                            src={image}
                            alt={product.name}
                            className="h-10 w-10 flex-shrink-0 rounded-xl bg-slate-100 object-cover ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-600/70"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {product.categoryName ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          ₺{Number(product.price).toLocaleString("tr-TR")}
                        </span>
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
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </FadeUp>

      <FadeUp delay={60}>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock size={12} />
          <span>
            Son güncelleme:{" "}
            {new Date().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </FadeUp>
    </div>
  );
}

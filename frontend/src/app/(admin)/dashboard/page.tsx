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
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
  processing: "bg-blue-50 text-blue-700 ring-blue-200/50",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200/50",
  pending: "bg-amber-50 text-amber-700 ring-amber-200/50",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200/60",
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
            : "Dashboard verileri alınamadı.",
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
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 lg:p-8 text-white shadow-[0_10px_40px_-20px_rgb(15_23_42/0.6)]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-violet-500/25 blur-3xl"
        />

        <div className="relative flex flex-col gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-200 ring-1 ring-white/10">
              <Sparkles size={12} />
              Admin Console
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-[34px]">
              {nameForHero}
            </h1>
            <p className="mt-2 max-w-lg text-[14px] text-slate-300">
              Bugün mağazanızda neler olup bittiğine hızlıca göz atın. Kategorilerinizi ve ürünlerinizi
              aşağıdan yönetebilirsiniz.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/products/create"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[13px] font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
              >
                <PlusCircle size={15} />
                Yeni Ürün
              </Link>
              <Link
                href="/products/search"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/10"
              >
                <SearchIcon size={15} />
                Ürün Ara
              </Link>
              <Link
                href="/categories/create"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/10"
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
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle size={16} />
            <span className="flex-1">{loadError}</span>
          </div>
        </FadeUp>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Orders (mock) */}
        <FadeUp delay={80} className="xl:col-span-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm h-full">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h2 className="font-display font-semibold text-slate-900">
                  Son Siparişler
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Sipariş modülü eklenene kadar örnek veridir
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-100">
                mock
              </span>
            </div>
            <Link
              href="/orders"
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Tüm siparişler <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/60"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/70">
                    <ShoppingCart size={16} className="text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {order.customer}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {order.product}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-slate-900">
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
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-display font-semibold text-slate-900">
                Kategoriler
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">Ürün dağılımı</p>
            </div>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
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
              <p className="py-4 text-center text-sm text-slate-400">
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
                        className="text-sm font-medium text-slate-700 transition-colors hover:text-indigo-600"
                      >
                        {cat.name}
                      </Link>
                      <span className="text-[11px] font-medium text-slate-500">
                        {cat.productCount} ürün · %{pct}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
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
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-display font-semibold text-slate-900">
              Öne Çıkan Ürünler
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">Stoğu en yüksek 5 ürün</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
          >
            Tüm Ürünler <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Ürün
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Fiyat
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Stok
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
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
                    className="px-6 py-12 text-center text-sm text-slate-400"
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
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/products/${product.productId}/preview`}
                          className="group flex items-center gap-3"
                        >
                          <img
                            src={image}
                            alt={product.name}
                            className="h-10 w-10 flex-shrink-0 rounded-xl object-cover ring-1 ring-slate-200/70 bg-slate-100"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400">{product.sku}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {product.categoryName ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          ₺{Number(product.price).toLocaleString("tr-TR")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            product.stock === 0
                              ? "text-red-600"
                              : product.stock < 30
                                ? "text-amber-600"
                                : "text-slate-700"
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
        <div className="flex items-center gap-2 text-xs text-slate-400">
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

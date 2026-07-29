"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit2,
  Package,
  Tag,
  DollarSign,
  Layers,
  Clock,
  User,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { fetchProduct } from "@/lib/api/productsApi";
import type { ProductDto } from "@/lib/api/types";
import { getProductStatusInfo } from "@/lib/productStatus";

export default function ProductPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const [product, setProduct] = useState<ProductDto | null | undefined>(undefined);
  const [loadErr, setLoadErr] = useState(false);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const p = await fetchProduct(productId);
        if (!c) setProduct(p);
      } catch {
        if (!c) {
          setProduct(null);
          setLoadErr(true);
        }
      }
    })();
    return () => {
      c = true;
    };
  }, [productId]);

  if (product === undefined) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center text-sm text-slate-600 dark:text-slate-400">
        Yükleniyor…
      </div>
    );
  }

  if (!product || loadErr) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft size={16} /> Geri
        </button>
        <div className="admin-card flex flex-col items-center gap-4 py-16">
          <AlertCircle size={24} className="text-red-500 dark:text-red-400" />
          <h2 className="font-bold text-slate-900 dark:text-slate-50">Ürün bulunamadı</h2>
        </div>
      </div>
    );
  }

  const status = getProductStatusInfo(product.status);
  const discountPercent =
    product.isDiscount && product.originalPrice
      ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
      : 0;

  const img = product.imageUrl?.trim() || "https://placehold.co/600x600/e2e8f0/64748b?text=Ürün";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft size={16} /> Geri
        </button>
        <Link
          href={`/products/${product.productId}`}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <Edit2 size={15} /> Düzenle
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="admin-card relative overflow-hidden">
            <img src={img} alt={product.name} className="aspect-square w-full object-cover" />
            {product.isDiscount && product.originalPrice != null && (
              <div className="absolute left-4 top-4 rounded-xl bg-red-500 px-3 py-1.5 text-sm font-bold text-white">
                %{discountPercent} İNDİRİM
              </div>
            )}
            <div className="absolute right-4 top-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${status.className}`}
              >
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <div className="mb-2 flex items-center gap-2">
                <Package size={14} className="text-slate-400 dark:text-slate-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Stok</span>
              </div>
              <p
                className={`text-xl font-bold ${
                  product.stock === 0
                    ? "text-red-600 dark:text-red-400"
                    : product.stock < 30
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-slate-900 dark:text-slate-50"
                }`}
              >
                {product.stock === 0 ? "Tükendi" : product.stock}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Puan</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">API’de yok</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-3">
          <div className="admin-card p-6">
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>
            {product.barcode && (
              <p className="mb-1 font-mono text-xs text-slate-600 dark:text-slate-400">Barkod: {product.barcode}</p>
            )}
            <h1 className="text-2xl font-bold leading-tight text-slate-900 dark:text-slate-50">{product.name}</h1>
            {product.categoryName && (
              <div className="mt-3 flex items-center gap-2">
                <Tag size={14} className="text-indigo-500 dark:text-indigo-400" />
                <span className="rounded-lg bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {product.categoryName}
                </span>
              </div>
            )}
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{product.description}</p>
          </div>

          <div className="admin-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-50">Fiyat</h2>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                ₺{Number(product.price).toLocaleString("tr-TR")}
              </span>
              {product.isDiscount && product.originalPrice != null && (
                <>
                  <span className="mb-0.5 text-lg text-slate-400 line-through dark:text-slate-500">
                    ₺{Number(product.originalPrice).toLocaleString("tr-TR")}
                  </span>
                  <span className="mb-0.5 inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <TrendingDown size={14} />%{discountPercent}
                  </span>
                </>
              )}
            </div>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="admin-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Layers size={16} className="text-sky-600 dark:text-sky-400" />
                <h2 className="font-semibold text-slate-900 dark:text-slate-50">Özellikler</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/70">
                {product.features.map((f) => (
                  <div key={f.productFeatureId} className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{f.featureName}</span>
                    <span className="rounded-lg bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="admin-card p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Clock size={15} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Oluşturulma</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {new Date(product.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
              {product.createdBy && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    <User size={15} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Oluşturan</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{product.createdBy}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

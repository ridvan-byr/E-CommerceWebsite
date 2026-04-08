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

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: "Aktif", className: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  inactive: { label: "Pasif", className: "text-red-600 bg-red-50 border-red-200", dot: "bg-red-500" },
  draft: { label: "Taslak", className: "text-slate-600 bg-slate-100 border-slate-200", dot: "bg-slate-400" },
};

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
      <div className="max-w-4xl mx-auto py-20 text-center text-slate-500 text-sm">Yükleniyor…</div>
    );
  }

  if (!product || loadErr) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm"
        >
          <ArrowLeft size={16} /> Geri
        </button>
        <div className="flex flex-col items-center gap-4 py-16 bg-white rounded-2xl border border-slate-200">
          <AlertCircle size={24} className="text-red-500" />
          <h2 className="text-slate-900 font-bold">Ürün bulunamadı</h2>
        </div>
      </div>
    );
  }

  const status = statusConfig[product.status] ?? statusConfig.active;
  const discountPercent =
    product.isDiscount && product.originalPrice
      ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
      : 0;

  const img = product.imageUrl?.trim() || "https://placehold.co/600x600/e2e8f0/64748b?text=Ürün";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm"
        >
          <ArrowLeft size={16} /> Geri
        </button>
        <Link
          href={`/products/${product.productId}`}
          className="inline-flex items-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
        >
          <Edit2 size={15} /> Düzenle
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <img src={img} alt={product.name} className="w-full aspect-square object-cover" />
            {product.isDiscount && product.originalPrice != null && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                %{discountPercent} İNDİRİM
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${status.className}`}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-slate-400" />
                <span className="text-slate-500 text-xs font-medium">Stok</span>
              </div>
              <p
                className={`text-xl font-bold ${product.stock === 0 ? "text-red-600" : product.stock < 30 ? "text-amber-600" : "text-slate-900"}`}
              >
                {product.stock === 0 ? "Tükendi" : product.stock}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-slate-500 text-xs font-medium mb-2">Puan</p>
              <p className="text-slate-400 text-sm">API’de yok</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-slate-400 text-xs font-medium mb-1">SKU: {product.sku}</p>
            {product.barcode && (
              <p className="text-slate-500 text-xs font-mono mb-1">Barkod: {product.barcode}</p>
            )}
            <h1 className="text-slate-900 text-2xl font-bold leading-tight">{product.name}</h1>
            {product.categoryName && (
              <div className="flex items-center gap-2 mt-3">
                <Tag size={14} className="text-indigo-500" />
                <span className="text-indigo-600 text-sm font-medium bg-indigo-50 px-3 py-1 rounded-lg">
                  {product.categoryName}
                </span>
              </div>
            )}
            <p className="text-slate-600 text-sm leading-relaxed mt-4">{product.description}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={16} className="text-emerald-600" />
              <h2 className="text-slate-900 font-semibold">Fiyat</h2>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-slate-900 text-3xl font-bold">
                ₺{Number(product.price).toLocaleString("tr-TR")}
              </span>
              {product.isDiscount && product.originalPrice != null && (
                <>
                  <span className="text-slate-400 text-lg line-through mb-0.5">
                    ₺{Number(product.originalPrice).toLocaleString("tr-TR")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-50 px-2.5 py-1 rounded-lg mb-0.5">
                    <TrendingDown size={14} />%{discountPercent}
                  </span>
                </>
              )}
            </div>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} className="text-sky-600" />
                <h2 className="text-slate-900 font-semibold">Özellikler</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {product.features.map((f) => (
                  <div key={f.productFeatureId} className="flex items-center justify-between py-3">
                    <span className="text-slate-500 text-sm">{f.featureName}</span>
                    <span className="text-slate-900 text-sm font-medium bg-slate-50 px-3 py-1 rounded-lg">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Clock size={15} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Oluşturulma</p>
                  <p className="text-slate-700 text-sm font-medium">
                    {new Date(product.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
              {product.createdBy && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                    <User size={15} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Oluşturan</p>
                    <p className="text-slate-700 text-sm font-medium">{product.createdBy}</p>
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

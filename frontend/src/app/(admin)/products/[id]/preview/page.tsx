"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Star, Package, Tag, DollarSign,
  Layers, Clock, User, AlertCircle, ShoppingCart, TrendingDown,
} from "lucide-react";
import { products, categories } from "@/lib/mockData";

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: "Aktif", className: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  inactive: { label: "Pasif", className: "text-red-600 bg-red-50 border-red-200", dot: "bg-red-500" },
  draft: { label: "Taslak", className: "text-slate-600 bg-slate-100 border-slate-200", dot: "bg-slate-400" },
};

export default function ProductPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Geri Dön
        </button>
        <div className="flex flex-col items-center gap-4 py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <h2 className="text-slate-900 font-bold text-lg">Ürün Bulunamadı</h2>
          <p className="text-slate-500 text-sm">ID: #{productId} ile eşleşen bir ürün bulunamadı.</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[product.status];
  const category = categories.find((c) => c.id === product.categoryId);
  const discountPercent = product.isDiscount && product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Geri Dön
        </button>
        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          <Edit2 size={15} /> Düzenle
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - Image */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            {product.isDiscount && product.originalPrice && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                %{discountPercent} İNDİRİM
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${status.className}`}>
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-slate-400" />
                <span className="text-slate-500 text-xs font-medium">Stok</span>
              </div>
              <p className={`text-xl font-bold ${product.stock === 0 ? "text-red-600" : product.stock < 30 ? "text-amber-600" : "text-slate-900"}`}>
                {product.stock === 0 ? "Tükendi" : product.stock}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-slate-500 text-xs font-medium">Puan</span>
              </div>
              <p className="text-xl font-bold text-slate-900">
                {product.rating} <span className="text-slate-400 text-sm font-normal">({product.reviewCount})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right - Details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Title & Category */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-slate-400 text-xs font-medium mb-1">SKU: {product.sku}</p>
                {product.barcode && (
                  <p className="text-slate-500 text-xs font-mono mb-1">Barkod: {product.barcode}</p>
                )}
                <h1 className="text-slate-900 text-2xl font-bold leading-tight">{product.name}</h1>
              </div>
            </div>

            {category && (
              <div className="flex items-center gap-2 mb-5">
                <Tag size={14} className="text-indigo-500" />
                <span className="text-indigo-600 text-sm font-medium bg-indigo-50 px-3 py-1 rounded-lg">
                  {category.name}
                </span>
              </div>
            )}

            <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Price */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={16} className="text-emerald-600" />
              <h2 className="text-slate-900 font-semibold">Fiyat Bilgisi</h2>
            </div>

            <div className="flex items-end gap-4">
              <span className="text-slate-900 text-3xl font-bold">
                ₺{product.price.toLocaleString("tr-TR")}
              </span>
              {product.isDiscount && product.originalPrice && (
                <>
                  <span className="text-slate-400 text-lg line-through mb-0.5">
                    ₺{product.originalPrice.toLocaleString("tr-TR")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-50 px-2.5 py-1 rounded-lg mb-0.5">
                    <TrendingDown size={14} />
                    %{discountPercent}
                  </span>
                </>
              )}
            </div>

            {product.isDiscount && product.originalPrice && (
              <p className="text-emerald-600 text-sm mt-2 font-medium">
                ₺{(product.originalPrice - product.price).toLocaleString("tr-TR")} tasarruf
              </p>
            )}
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} className="text-sky-600" />
                <h2 className="text-slate-900 font-semibold">Ürün Özellikleri</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between py-3">
                    <span className="text-slate-500 text-sm">{feature.name}</span>
                    <span className="text-slate-900 text-sm font-medium bg-slate-50 px-3 py-1 rounded-lg">
                      {feature.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Clock size={15} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Oluşturulma</p>
                  <p className="text-slate-700 text-sm font-medium">
                    {new Date(product.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
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

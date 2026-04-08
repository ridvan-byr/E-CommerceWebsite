"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Image,
  CheckCircle,
  Plus,
  X,
  Layers,
} from "lucide-react";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { fetchFeatureDefinitions } from "@/lib/api/featuresApi";
import { createProduct } from "@/lib/api/productsApi";
import { createProductFeature } from "@/lib/api/productFeaturesApi";
import type { CategoryDto, FeatureDefinitionDto } from "@/lib/api/types";
import { ApiRequestError } from "@/lib/api/client";

type FeatureRow = { localId: number; featureId: number; value: string };

export default function ProductCreatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [featureCatalog, setFeatureCatalog] = useState<FeatureDefinitionDto[]>([]);
  const [catalogLoadError, setCatalogLoadError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    categoryId: "",
    barcode: "",
    image: "",
    status: "active",
    isDiscount: false,
  });
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [newFeatureId, setNewFeatureId] = useState("");
  const [newFeatureValue, setNewFeatureValue] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, feats] = await Promise.all([
          fetchCategories(),
          fetchFeatureDefinitions(),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setFeatureCatalog(feats.filter((f) => !f.isDeleted));
        }
      } catch {
        if (!cancelled) setCatalogLoadError("Kategori veya özellik listesi yüklenemedi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addFeature = () => {
    const fid = Number(newFeatureId);
    if (!fid || !newFeatureValue.trim()) return;
    if (features.some((r) => r.featureId === fid)) return;
    setFeatures((prev) => [
      ...prev,
      { localId: Date.now(), featureId: fid, value: newFeatureValue.trim() },
    ]);
    setNewFeatureId("");
    setNewFeatureValue("");
  };

  const removeFeature = (localId: number) => {
    setFeatures((prev) => prev.filter((f) => f.localId !== localId));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Ürün adı zorunludur.";
    if (!form.description.trim()) e.description = "Açıklama zorunludur.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Geçerli bir stok miktarı giriniz.";
    if (!form.categoryId) e.categoryId = "Kategori seçimi zorunludur.";
    const bc = form.barcode.trim();
    if (bc && !/^[0-9]{8,14}$/.test(bc)) {
      e.barcode = "Barkod boş bırakılabilir veya 8–14 haneli rakam olmalıdır.";
    }
    if (form.isDiscount) {
      const list = Number(form.price);
      const sale = Number(form.discountPrice);
      if (!form.price || isNaN(list) || list <= 0) e.price = "Liste fiyatı geçerli olmalıdır.";
      if (!form.discountPrice || isNaN(sale) || sale <= 0)
        e.discountPrice = "İndirimli satış fiyatı geçerli olmalıdır.";
      if (!isNaN(list) && !isNaN(sale) && sale >= list) {
        e.discountPrice = "İndirimli fiyat, liste fiyatından düşük olmalıdır.";
      }
    } else {
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
        e.price = "Geçerli bir fiyat giriniz.";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setApiError(null);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const categoryId = Number(form.categoryId);
      const listPrice = Number(form.price);
      const salePrice = form.isDiscount ? Number(form.discountPrice) : listPrice;
      const payload = {
        categoryId,
        name: form.name.trim(),
        description: form.description.trim(),
        price: salePrice,
        originalPrice: form.isDiscount ? listPrice : null,
        isDiscount: form.isDiscount,
        stock: Number(form.stock),
        status: form.status,
        imageUrl: form.image.trim() || null,
        barcode: form.barcode.trim() || null,
      };
      const created = await createProduct(payload);
      for (let i = 0; i < features.length; i++) {
        const row = features[i];
        await createProductFeature(created.productId, {
          featureId: row.featureId,
          value: row.value,
          sortOrder: i,
        });
      }
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 900));
      router.push("/products");
    } catch (err) {
      setApiError(
        err instanceof ApiRequestError ? err.message : "Ürün kaydedilemedi."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full h-11 px-4 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors[field] ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`;

  const usedFeatureIds = new Set(features.map((f) => f.featureId));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} /> Ürünlere Dön
      </Link>

      {catalogLoadError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm">
          {catalogLoadError}
        </div>
      )}

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm">{apiError}</div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-700 text-sm font-medium">
            Ürün başarıyla oluşturuldu! Yönlendiriliyorsunuz...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Package size={17} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Temel Bilgiler</h2>
              <p className="text-slate-400 text-xs">Ürünün temel bilgilerini girin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Ürün Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Örn: iPhone 15 Pro..."
                className={inputClass("name")}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.name}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Ürün hakkında detaylı bir açıklama..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1.5">⚠ {errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Stok kodu (SKU)</label>
              <div className="w-full min-h-11 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm">
                Kayıt sonrası sunucu otomatik atar (PRD-…).
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Barkod <span className="text-slate-400 font-normal">(isteğe bağlı)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.barcode}
                onChange={(e) => set("barcode", e.target.value.replace(/\D/g, ""))}
                placeholder="8–14 haneli rakam"
                maxLength={14}
                className={inputClass("barcode")}
              />
              {errors.barcode && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.barcode}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={`w-full h-11 px-4 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${errors.categoryId ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              >
                <option value="">Kategori seçin...</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={String(c.categoryId)}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-xs mt-1.5">⚠ {errors.categoryId}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign size={17} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Fiyat & Stok</h2>
              <p className="text-slate-400 text-xs">İndirimde liste fiyatı ve satış fiyatı ayrı girilir</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                {form.isDiscount ? "Liste fiyatı (₺) *" : "Satış fiyatı (₺) *"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  ₺
                </span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="0.00"
                  className={`w-full h-11 pl-8 pr-4 rounded-xl border text-slate-800 text-sm ${errors.price ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.price}</p>}
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Stok *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                placeholder="0"
                className={inputClass("stock")}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.stock}</p>}
            </div>

            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isDiscount}
                  onChange={(e) => set("isDiscount", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                />
                <span className="text-slate-700 text-sm font-medium">İndirim</span>
              </label>
            </div>
          </div>

          {form.isDiscount && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <label className="block text-amber-900 text-sm font-medium">
                İndirimli satış fiyatı (₺) *
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₺</span>
                <input
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) => set("discountPrice", e.target.value)}
                  placeholder="0.00"
                  className={`w-full h-11 pl-8 pr-4 rounded-xl border border-amber-300 bg-white text-sm ${errors.discountPrice ? "ring-2 ring-red-200" : ""}`}
                />
              </div>
              {errors.discountPrice && (
                <p className="text-red-600 text-xs">⚠ {errors.discountPrice}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
              <Layers size={17} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Ürün Özellikleri</h2>
              <p className="text-slate-400 text-xs">
                Önce <strong>Özellikler</strong> kataloğunda tanımlı bir özellik seçin; değerini yazın.
              </p>
            </div>
          </div>

          {features.length > 0 && (
            <ul className="space-y-2">
              {features.map((row) => {
                const name =
                  featureCatalog.find((f) => f.featureId === row.featureId)?.name ?? `#${row.featureId}`;
                return (
                  <li
                    key={row.localId}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{name}</p>
                      <p className="text-sm text-slate-800">{row.value}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(row.localId)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X size={18} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="block text-slate-700 text-xs font-medium mb-1.5">Katalog özelliği</label>
              <select
                value={newFeatureId}
                onChange={(e) => setNewFeatureId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              >
                <option value="">Seçin...</option>
                {featureCatalog
                  .filter((f) => !usedFeatureIds.has(f.featureId))
                  .map((f) => (
                    <option key={f.featureId} value={String(f.featureId)}>
                      {f.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-slate-700 text-xs font-medium mb-1.5">Değer</label>
              <input
                type="text"
                value={newFeatureValue}
                onChange={(e) => setNewFeatureValue(e.target.value)}
                placeholder="Örn: 256 GB"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addFeature}
              disabled={!newFeatureId || !newFeatureValue.trim()}
              className="h-10 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Plus size={15} />
              Ekle
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <Image size={17} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Görsel & Durum</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Görsel URL</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://..."
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </div>
            {form.image ? (
              <img
                src={form.image}
                alt=""
                className="w-48 h-48 object-cover rounded-xl border border-slate-200"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Yayın durumu</label>
              <div className="flex gap-3">
                {["active", "inactive", "draft"].map((s) => {
                  const labels: Record<string, string> = {
                    active: "Aktif",
                    inactive: "Pasif",
                    draft: "Taslak",
                  };
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("status", s)}
                      className={`flex-1 h-10 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.status === s
                          ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                          : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/products"
            className="flex-1 h-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Ürün Oluştur"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

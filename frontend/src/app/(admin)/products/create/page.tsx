"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  DollarSign,
  ImageIcon,
  CheckCircle,
  Plus,
  X,
  Layers,
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { createProduct } from "@/lib/api/productsApi";
import { createProductFeature } from "@/lib/api/productFeaturesApi";
import type { CategoryDto } from "@/lib/api/types";
import { ApiRequestError } from "@/lib/api/client";
import { isValidGtinOrEmpty, isValidSku } from "@/lib/gtin";

type FeatureRow = { localId: number; name: string; value: string };

export default function ProductCreatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [catalogLoadError, setCatalogLoadError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
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
  const [newFeatureName, setNewFeatureName] = useState("");
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
        const cats = await fetchCategories();
        if (!cancelled) setCategories(cats);
      } catch {
        if (!cancelled) setCatalogLoadError("Kategori listesi yüklenemedi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addFeature = () => {
    const label = newFeatureName.trim();
    if (!label || !newFeatureValue.trim()) return;
    if (features.some((r) => r.name.trim().toLowerCase() === label.toLowerCase())) {
      alert("Bu özellik adı zaten eklendi.");
      return;
    }
    setFeatures((prev) => [
      ...prev,
      { localId: Date.now(), name: label, value: newFeatureValue.trim() },
    ]);
    setNewFeatureName("");
    setNewFeatureValue("");
  };

  const removeFeature = (localId: number) => {
    setFeatures((prev) => prev.filter((f) => f.localId !== localId));
  };

  // REVIEW [D4] Bu validate() fonksiyonu büyük olasılıkla products/[id]/page.tsx
  // (edit sayfası) içinde de neredeyse aynı şekilde tekrar ediyor. Bir kuralı
  // değiştirmek istediğinde iki sayfayı da güncellemek zorunda kalırsın, biri
  // unutulur, formlar farklı davranmaya başlar.
  //
  // Doğru yer: ortak bir validator. Örneğin lib/validators/productValidator.ts:
  //
  //     // lib/validators/productValidator.ts
  //     export type ProductFormErrors = Record<string, string>;
  //     export function validateProductForm(form: ProductFormShape): ProductFormErrors {
  //       const e: ProductFormErrors = {};
  //       if (!form.name.trim()) e.name = "Ürün adı zorunludur.";
  //       // ... (diğer kurallar)
  //       return e;
  //     }
  //
  // Create ve Edit sayfaları aynı fonksiyonu çağırır. Frontend validation
  // her zaman backend ile aynı kuralları doğrulamalı (CreateProductDto
  // ne diyorsa); bu kuralları tek dosyada tutmak senkron tutmayı kolaylaştırır.
  //
  // Genel sezgi: aynı şeyi iki sayfada gördüysen, üçüncüsünde de göreceksin.
  // İki yerde tekrarladığın anda ortak bir yere çıkar.
  //
  // Anahtar kelime: "DRY in React", "form validation library (zod, yup)".
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Ürün adı zorunludur.";
    if (!form.description.trim()) e.description = "Açıklama zorunludur.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Geçerli bir stok miktarı giriniz.";
    if (!form.categoryId) e.categoryId = "Kategori seçimi zorunludur.";
    if (!isValidSku(form.sku)) {
      e.sku =
        "SKU zorunludur (2–50 karakter): harf/rakam ve . _ - / (ör. NIKE-AIR-42-BLK).";
    }
    const bc = form.barcode.trim();
    if (bc && !isValidGtinOrEmpty(form.barcode)) {
      e.barcode =
        "Geçerli GTIN girin (8, 12, 13 veya 14 hane, doğru check digit) veya boş bırakın.";
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
        sku: form.sku.trim(),
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
          name: row.name,
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
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Stok kodu (SKU) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="Örn: SAM-GS24U-512-BLK"
                maxLength={50}
                autoComplete="off"
                className={inputClass("sku")}
              />
              <p className="text-slate-400 text-[11px] mt-1">
                Mağaza içi benzersiz kod; harf, rakam ve . _ - / kullanılabilir.
              </p>
              {errors.sku && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.sku}</p>}
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Barkod (GTIN) <span className="text-slate-400 font-normal">(isteğe bağlı)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.barcode}
                onChange={(e) => set("barcode", e.target.value.replace(/\D/g, ""))}
                placeholder="EAN-13 / GTIN (check digit dahil)"
                maxLength={14}
                className={inputClass("barcode")}
              />
              <p className="text-slate-400 text-[11px] mt-1">
                GS1 barkodu; 8, 12, 13 veya 14 hane, doğrulama hanesi kontrol edilir.
              </p>
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
                Özellik adı ve değerini yazıp listeye ekleyin; ürün kaydedildiğinde sunucuya yazılır.
              </p>
            </div>
          </div>

          {features.length > 0 && (
            <ul className="space-y-2">
              {features.map((row) => {
                return (
                  <li
                    key={row.localId}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{row.name}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end">
            <div>
              <label className="block text-slate-700 text-xs font-medium mb-1.5">Özellik adı</label>
              <input
                type="text"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="Örn: RAM, Renk"
                maxLength={100}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-medium mb-1.5">Değer</label>
              <input
                type="text"
                value={newFeatureValue}
                onChange={(e) => setNewFeatureValue(e.target.value)}
                placeholder="Örn: 8 GB, Siyah"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addFeature}
              disabled={!newFeatureName.trim() || !newFeatureValue.trim()}
              className="h-10 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 sm:shrink-0"
            >
              <Plus size={15} />
              Ekle
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <ImageIcon size={17} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Görsel & Durum</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-3">Ürün Görseli</label>
              <ImageUpload
                value={form.image}
                onChange={(url) => set("image", url)}
                disabled={loading}
              />
            </div>
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

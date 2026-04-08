"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Image,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Layers,
} from "lucide-react";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { fetchFeatureDefinitions } from "@/lib/api/featuresApi";
import { fetchProduct, updateProduct } from "@/lib/api/productsApi";
import {
  createProductFeature,
  deleteProductFeature,
  updateProductFeature,
} from "@/lib/api/productFeaturesApi";
import type { CategoryDto, FeatureDefinitionDto, ProductDto, ProductFeatureDto } from "@/lib/api/types";
import { ApiRequestError } from "@/lib/api/client";
import Link from "next/link";

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [featureCatalog, setFeatureCatalog] = useState<FeatureDefinitionDto[]>([]);
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [featureRows, setFeatureRows] = useState<ProductFeatureDto[]>([]);
  const [loadInit, setLoadInit] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
  const [newFeatureId, setNewFeatureId] = useState("");
  const [newFeatureValue, setNewFeatureValue] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [featureBusy, setFeatureBusy] = useState<number | null>(null);

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const load = useCallback(async () => {
    setLoadInit(true);
    setNotFound(false);
    try {
      const [cats, feats, p] = await Promise.all([
        fetchCategories(),
        fetchFeatureDefinitions(),
        fetchProduct(productId),
      ]);
      setCategories(cats);
      setFeatureCatalog(feats.filter((f) => !f.isDeleted));
      setProduct(p);
      const hasDisc = p.isDiscount && p.originalPrice != null;
      setForm({
        name: p.name,
        description: p.description ?? "",
        price: hasDisc ? String(p.originalPrice) : String(p.price),
        discountPrice: hasDisc ? String(p.price) : "",
        stock: String(p.stock),
        categoryId: String(p.categoryId),
        barcode: p.barcode ?? "",
        image: p.imageUrl ?? "",
        status: p.status,
        isDiscount: hasDisc,
      });
      setFeatureRows(p.features ?? []);
    } catch {
      setNotFound(true);
    } finally {
      setLoadInit(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Ürün adı zorunludur.";
    if (!form.description.trim()) e.description = "Açıklama zorunludur.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Geçerli stok giriniz.";
    if (!form.categoryId) e.categoryId = "Kategori seçin.";
    const bc = form.barcode.trim();
    if (bc && !/^[0-9]{8,14}$/.test(bc)) e.barcode = "Barkod 8–14 haneli rakam olmalıdır.";
    if (form.isDiscount) {
      const list = Number(form.price);
      const sale = Number(form.discountPrice);
      if (!form.price || isNaN(list) || list <= 0) e.price = "Liste fiyatı geçersiz.";
      if (!form.discountPrice || isNaN(sale) || sale <= 0) e.discountPrice = "İndirimli fiyat geçersiz.";
      if (!isNaN(list) && !isNaN(sale) && sale >= list)
        e.discountPrice = "İndirimli fiyat liste fiyatından düşük olmalıdır.";
    } else {
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
        e.price = "Fiyat geçersiz.";
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
      const listPrice = Number(form.price);
      const salePrice = form.isDiscount ? Number(form.discountPrice) : listPrice;
      const updated = await updateProduct(productId, {
        categoryId: Number(form.categoryId),
        name: form.name.trim(),
        description: form.description.trim(),
        price: salePrice,
        originalPrice: form.isDiscount ? listPrice : null,
        isDiscount: form.isDiscount,
        stock: Number(form.stock),
        status: form.status,
        imageUrl: form.image.trim() || null,
        barcode: form.barcode.trim() || null,
      });
      setProduct(updated);
      setFeatureRows(updated.features ?? []);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setApiError(err instanceof ApiRequestError ? err.message : "Güncelleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const usedFeatureIds = new Set(featureRows.map((r) => r.featureId));

  const saveFeatureRow = async (row: ProductFeatureDto, value: string, sortOrder: number) => {
    setFeatureBusy(row.productFeatureId);
    try {
      const u = await updateProductFeature(productId, row.productFeatureId, {
        value: value.trim(),
        sortOrder,
      });
      setFeatureRows((prev) => prev.map((x) => (x.productFeatureId === u.productFeatureId ? u : x)));
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Kaydedilemedi");
    } finally {
      setFeatureBusy(null);
    }
  };

  const removeFeatureRow = async (row: ProductFeatureDto) => {
    if (!confirm("Bu özelliği kaldırmak istiyor musunuz?")) return;
    setFeatureBusy(row.productFeatureId);
    try {
      await deleteProductFeature(productId, row.productFeatureId);
      setFeatureRows((prev) => prev.filter((x) => x.productFeatureId !== row.productFeatureId));
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Silinemedi");
    } finally {
      setFeatureBusy(null);
    }
  };

  const addFeature = async () => {
    const fid = Number(newFeatureId);
    if (!fid || !newFeatureValue.trim()) return;
    setFeatureBusy(-1);
    try {
      const created = await createProductFeature(productId, {
        featureId: fid,
        value: newFeatureValue.trim(),
        sortOrder: featureRows.length,
      });
      setFeatureRows((prev) => [...prev, created]);
      setNewFeatureId("");
      setNewFeatureValue("");
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Eklenemedi");
    } finally {
      setFeatureBusy(null);
    }
  };

  const inputClass = (field: string) =>
    `w-full h-11 px-4 rounded-xl border text-slate-800 text-sm ${errors[field] ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`;

  if (loadInit) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-slate-500 text-sm">Yükleniyor…</div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
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
          <Link href="/products" className="text-indigo-600 text-sm font-medium">
            Ürün listesine dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm"
      >
        <ArrowLeft size={16} /> Geri
      </button>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm">{apiError}</div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle size={20} className="text-emerald-600" />
          <p className="text-emerald-700 text-sm font-medium">Ürün bilgileri kaydedildi.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <Package size={17} className="text-indigo-600" />
          <div>
            <h2 className="text-indigo-900 font-semibold text-sm">Ürün düzenle</h2>
            <p className="text-indigo-600 text-xs">
              #{product.productId} · {product.sku}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Temel</h3>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass("name")}
            placeholder="Ürün adı"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${errors.description ? "border-red-300" : "border-slate-200"}`}
            placeholder="Açıklama"
          />
          {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className={inputClass("categoryId")}
          >
            {categories.map((c) => (
              <option key={c.categoryId} value={String(c.categoryId)}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={form.barcode}
            onChange={(e) => set("barcode", e.target.value.replace(/\D/g, ""))}
            placeholder="Barkod"
            maxLength={14}
            className={inputClass("barcode")}
          />
          {errors.barcode && <p className="text-red-500 text-xs">{errors.barcode}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Fiyat & stok</h3>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDiscount}
              onChange={(e) => set("isDiscount", e.target.checked)}
            />
            İndirim
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium">
                {form.isDiscount ? "Liste fiyatı" : "Satış fiyatı"}
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className={inputClass("price")}
              />
              {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
            </div>
            {form.isDiscount && (
              <div>
                <label className="text-xs text-slate-500 font-medium">İndirimli satış</label>
                <input
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) => set("discountPrice", e.target.value)}
                  className={inputClass("discountPrice")}
                />
                {errors.discountPrice && (
                  <p className="text-red-500 text-xs">{errors.discountPrice}</p>
                )}
              </div>
            )}
            <div>
              <label className="text-xs text-slate-500 font-medium">Stok</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                className={inputClass("stock")}
              />
              {errors.stock && <p className="text-red-500 text-xs">{errors.stock}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Image size={18} className="text-purple-600" />
            <h3 className="font-semibold text-slate-900">Görsel & durum</h3>
          </div>
          <input
            type="url"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="Görsel URL"
            className={inputClass("image")}
          />
          <div className="flex gap-2">
            {["active", "inactive", "draft"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("status", s)}
                className={`flex-1 h-9 rounded-lg border text-sm font-medium ${
                  form.status === s ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60"
        >
          {loading ? "Kaydediliyor…" : "Ürün bilgilerini kaydet"}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-sky-600" />
          <h3 className="font-semibold text-slate-900">Özellikler</h3>
        </div>
        <p className="text-xs text-slate-500">
          Değişiklikleri satır satır kaydedin veya yeni özellik ekleyin.
        </p>
        {featureRows.map((row, index) => (
          <FeatureRowEditor
            key={row.productFeatureId}
            row={row}
            index={index}
            busy={featureBusy === row.productFeatureId}
            onSave={(val) => saveFeatureRow(row, val, index)}
            onDelete={() => removeFeatureRow(row)}
          />
        ))}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end pt-2 border-t border-slate-100">
          <select
            value={newFeatureId}
            onChange={(e) => setNewFeatureId(e.target.value)}
            className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Özellik seç…</option>
            {featureCatalog
              .filter((f) => !usedFeatureIds.has(f.featureId))
              .map((f) => (
                <option key={f.featureId} value={String(f.featureId)}>
                  {f.name}
                </option>
              ))}
          </select>
          <input
            type="text"
            value={newFeatureValue}
            onChange={(e) => setNewFeatureValue(e.target.value)}
            placeholder="Değer"
            className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm"
          />
          <button
            type="button"
            onClick={() => void addFeature()}
            disabled={featureBusy === -1 || !newFeatureId || !newFeatureValue.trim()}
            className="h-10 px-4 bg-sky-600 text-white text-sm font-medium rounded-xl disabled:opacity-50"
          >
            {featureBusy === -1 ? "…" : "Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureRowEditor({
  row,
  index,
  busy,
  onSave,
  onDelete,
}: {
  row: ProductFeatureDto;
  index: number;
  busy: boolean;
  onSave: (v: string) => void;
  onDelete: () => void;
}) {
  const [val, setVal] = useState(row.value);
  useEffect(() => {
    setVal(row.value);
  }, [row.value, row.productFeatureId]);

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex-1 min-w-[140px]">
        <p className="text-xs text-slate-500">
          {row.featureName} <span className="text-slate-400">(sıra {index})</span>
        </p>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="mt-1 w-full h-9 px-2 rounded-lg border border-slate-200 text-sm"
        />
      </div>
      <button
        type="button"
        disabled={busy || val === row.value}
        onClick={() => onSave(val)}
        className="h-9 px-3 rounded-lg bg-indigo-600 text-white text-xs font-medium disabled:opacity-50"
      >
        Kaydet
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onDelete}
        className="h-9 px-3 rounded-lg border border-red-200 text-red-600 text-xs"
      >
        Sil
      </button>
    </div>
  );
}

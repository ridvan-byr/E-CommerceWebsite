"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Image,
  AlertCircle,
  X,
  Layers,
  GripVertical,
  CheckCircle,
} from "lucide-react";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { fetchProduct, updateProduct } from "@/lib/api/productsApi";
import {
  createProductFeature,
  deleteProductFeature,
  updateProductFeature,
} from "@/lib/api/productFeaturesApi";
import type { CategoryDto, ProductDto, ProductFeatureDto } from "@/lib/api/types";
import { ApiRequestError } from "@/lib/api/client";
import { isValidGtinOrEmpty, isValidSku } from "@/lib/gtin";
import Link from "next/link";

const PRODUCT_STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  draft: "Taslak",
};

type FeatureBanner = { variant: "error" | "warning" | "success"; message: string };

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [featureRows, setFeatureRows] = useState<ProductFeatureDto[]>([]);
  const [loadInit, setLoadInit] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureValue, setNewFeatureValue] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [featureBusy, setFeatureBusy] = useState<number | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);
  const [featureBanner, setFeatureBanner] = useState<FeatureBanner | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const dragFromIndex = useRef<number | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const showFeatureBanner = useCallback((b: FeatureBanner, autoClearMs?: number) => {
    setFeatureBanner(b);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    if (autoClearMs && b.variant === "success") {
      bannerTimer.current = setTimeout(() => setFeatureBanner(null), autoClearMs);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
    };
  }, []);

  const load = useCallback(async () => {
    setLoadInit(true);
    setNotFound(false);
    try {
      const [cats, p] = await Promise.all([fetchCategories(), fetchProduct(productId)]);
      setCategories(cats);
      setProduct(p);
      const hasDisc = p.isDiscount && p.originalPrice != null;
      setForm({
        name: p.name,
        description: p.description ?? "",
        sku: p.sku ?? "",
        price: hasDisc ? String(p.originalPrice) : String(p.price),
        discountPrice: hasDisc ? String(p.price) : "",
        stock: String(p.stock),
        categoryId: String(p.categoryId),
        barcode: p.barcode ?? "",
        image: p.imageUrl ?? "",
        status: p.status,
        isDiscount: hasDisc,
      });
      const feats = p.features ?? [];
      setFeatureRows([...feats].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      setNotFound(true);
    } finally {
      setLoadInit(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const redirectToProductsAfterProductFieldsSave = (productName: string) => {
    const name = productName.trim() || "Ürün";
    try {
      sessionStorage.setItem(
        "ecommerce_products_flash",
        JSON.stringify({ variant: "product-update", productName: name }),
      );
    } catch {
      /* ignore */
    }
    router.push("/products");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Ürün adı zorunludur.";
    if (!form.description.trim()) e.description = "Açıklama zorunludur.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Geçerli stok giriniz.";
    if (!form.categoryId) e.categoryId = "Kategori seçin.";
    if (!isValidSku(form.sku)) {
      e.sku = "SKU zorunludur (2–50 karakter): harf/rakam ve . _ - /.";
    }
    const bc = form.barcode.trim();
    if (bc && !isValidGtinOrEmpty(form.barcode)) {
      e.barcode = "Geçerli GTIN (check digit) veya boş.";
    }
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
        sku: form.sku.trim(),
        price: salePrice,
        originalPrice: form.isDiscount ? listPrice : null,
        isDiscount: form.isDiscount,
        stock: Number(form.stock),
        status: form.status,
        imageUrl: form.image.trim() || null,
        barcode: form.barcode.trim() || null,
      });
      const displayName = updated.name?.trim() || form.name.trim() || "Ürün";
      redirectToProductsAfterProductFieldsSave(displayName);
    } catch (err) {
      setApiError(err instanceof ApiRequestError ? err.message : "Güncelleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const reorderFeatures = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || reorderBusy) return;
    setReorderBusy(true);
    setFeatureBanner(null);
    const prev = [...featureRows];
    const next = [...featureRows];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    const reindexed = next.map((r, i) => ({ ...r, sortOrder: i }));
    setFeatureRows(reindexed);
    try {
      await Promise.all(
        reindexed.map((r, i) =>
          updateProductFeature(productId, r.productFeatureId, {
            value: r.value,
            sortOrder: i,
          }),
        ),
      );
      showFeatureBanner({ variant: "success", message: "Sıra kaydedildi." }, 2800);
    } catch (err) {
      setFeatureRows(prev);
      showFeatureBanner({
        variant: "error",
        message: err instanceof ApiRequestError ? err.message : "Sıra güncellenemedi.",
      });
    } finally {
      setReorderBusy(false);
      setDropTargetIndex(null);
    }
  };

  const saveFeatureRow = async (
    row: ProductFeatureDto,
    featureName: string,
    value: string,
    sortOrder: number,
  ) => {
    setFeatureBusy(row.productFeatureId);
    setFeatureBanner(null);
    try {
      const nameT = featureName.trim();
      const nameChanged = nameT !== row.featureName.trim();
      const u = await updateProductFeature(productId, row.productFeatureId, {
        value: value.trim(),
        sortOrder,
        ...(nameChanged ? { name: nameT } : {}),
      });
      setFeatureRows((prev) => prev.map((x) => (x.productFeatureId === u.productFeatureId ? u : x)));
      showFeatureBanner({ variant: "success", message: "Özellik kaydedildi." }, 2500);
    } catch (err) {
      showFeatureBanner({
        variant: "error",
        message: err instanceof ApiRequestError ? err.message : "Kaydedilemedi.",
      });
    } finally {
      setFeatureBusy(null);
    }
  };

  const confirmRemoveFeatureRow = async (row: ProductFeatureDto) => {
    setFeatureBusy(row.productFeatureId);
    setPendingDeleteId(null);
    setFeatureBanner(null);
    try {
      await deleteProductFeature(productId, row.productFeatureId);
      const filtered = featureRows.filter((x) => x.productFeatureId !== row.productFeatureId);
      const reindexed = filtered.map((r, i) => ({ ...r, sortOrder: i }));
      setFeatureRows(reindexed);
      if (reindexed.length > 0) {
        await Promise.all(
          reindexed.map((r, i) =>
            updateProductFeature(productId, r.productFeatureId, {
              value: r.value,
              sortOrder: i,
            }),
          ),
        );
      }
      showFeatureBanner({ variant: "success", message: "Özellik kaldırıldı." }, 2500);
    } catch (err) {
      await load();
      showFeatureBanner({
        variant: "error",
        message: err instanceof ApiRequestError ? err.message : "Silinemedi.",
      });
    } finally {
      setFeatureBusy(null);
    }
  };

  const addFeature = async () => {
    const label = newFeatureName.trim();
    if (!label || !newFeatureValue.trim()) return;
    if (featureRows.some((r) => r.featureName.trim().toLowerCase() === label.toLowerCase())) {
      showFeatureBanner({
        variant: "warning",
        message: "Bu özellik adı bu üründe zaten var.",
      });
      return;
    }
    setFeatureBusy(-1);
    setFeatureBanner(null);
    try {
      const created = await createProductFeature(productId, {
        name: label,
        value: newFeatureValue.trim(),
        sortOrder: featureRows.length,
      });
      setFeatureRows((prev) => [...prev, created]);
      setNewFeatureName("");
      setNewFeatureValue("");
      showFeatureBanner({ variant: "success", message: "Özellik eklendi." }, 2500);
    } catch (err) {
      showFeatureBanner({
        variant: "error",
        message: err instanceof ApiRequestError ? err.message : "Eklenemedi.",
      });
    } finally {
      setFeatureBusy(null);
    }
  };

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    if (reorderBusy) {
      e.preventDefault();
      return;
    }
    dragFromIndex.current = index;
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIndex(index);
  };

  const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    const from = raw !== "" ? Number(raw) : dragFromIndex.current;
    dragFromIndex.current = null;
    setDropTargetIndex(null);
    if (from == null || Number.isNaN(from)) return;
    void reorderFeatures(from, toIndex);
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
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex gap-3 items-start"
        >
          <AlertCircle className="shrink-0 text-red-600 mt-0.5" size={18} />
          <p className="flex-1">{apiError}</p>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="shrink-0 p-1 rounded-lg text-red-700 hover:bg-red-100"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
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
          <label className="block text-slate-600 text-xs font-medium">SKU *</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            maxLength={50}
            className={inputClass("sku")}
            placeholder="Stok kodu"
          />
          {errors.sku && <p className="text-red-500 text-xs">{errors.sku}</p>}
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
            {(["active", "inactive", "draft"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("status", s)}
                className={`flex-1 h-9 rounded-lg border text-sm font-medium ${
                  form.status === s ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-200"
                }`}
              >
                {PRODUCT_STATUS_LABELS[s] ?? s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-sky-600" />
              <h3 className="font-semibold text-slate-900">Özellikler</h3>
            </div>
            {reorderBusy && (
              <span className="text-xs text-slate-500">Sıra kaydediliyor…</span>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sol tutamacı sürükleyerek sırayı değiştirin. Satır kayıtları anında sunucuya yazılır; ürünün genel
            alanları için en alttaki «Ürün bilgilerini kaydet» kullanılır.
          </p>

          {featureBanner && (
            <div
              role="status"
              className={`rounded-xl border px-3 py-2.5 text-sm flex gap-2.5 items-start ${
                featureBanner.variant === "error"
                  ? "bg-red-50 border-red-200 text-red-900"
                  : featureBanner.variant === "warning"
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : "bg-emerald-50 border-emerald-200 text-emerald-950"
              }`}
            >
              {featureBanner.variant === "success" ? (
                <CheckCircle className="shrink-0 mt-0.5 text-emerald-600" size={18} />
              ) : (
                <AlertCircle
                  className={`shrink-0 mt-0.5 ${
                    featureBanner.variant === "error" ? "text-red-600" : "text-amber-600"
                  }`}
                  size={18}
                />
              )}
              <p className="flex-1 min-w-0 leading-snug">{featureBanner.message}</p>
              <button
                type="button"
                onClick={() => setFeatureBanner(null)}
                className="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="space-y-3">
            {featureRows.map((row, index) => (
              <div
                key={row.productFeatureId}
                onDragOver={handleDragOver(index)}
                onDrop={handleDrop(index)}
                className={`rounded-2xl transition-shadow ${
                  dropTargetIndex === index ? "ring-2 ring-sky-400 ring-offset-2" : ""
                }`}
              >
                <FeatureRowEditor
                  row={row}
                  index={index}
                  busy={featureBusy === row.productFeatureId}
                  reorderBusy={reorderBusy}
                  pendingDelete={pendingDeleteId === row.productFeatureId}
                  onDragStart={handleDragStart(index)}
                  onDragEnd={() => setDropTargetIndex(null)}
                  onSave={(featureName, val) => saveFeatureRow(row, featureName, val, index)}
                  onRequestDelete={() => setPendingDeleteId(row.productFeatureId)}
                  onCancelDelete={() => setPendingDeleteId(null)}
                  onConfirmDelete={() => void confirmRemoveFeatureRow(row)}
                />
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-600 mb-2">Yeni özellik</p>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Özellik adı</label>
                <input
                  type="text"
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  placeholder="Örn: Renk, RAM"
                  maxLength={100}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Değer</label>
                <input
                  type="text"
                  value={newFeatureValue}
                  onChange={(e) => setNewFeatureValue(e.target.value)}
                  placeholder="Örn: Siyah, 8 GB"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                />
              </div>
              <button
                type="button"
                onClick={() => void addFeature()}
                disabled={
                  featureBusy === -1 ||
                  reorderBusy ||
                  !newFeatureName.trim() ||
                  !newFeatureValue.trim()
                }
                className="h-10 px-4 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 sm:shrink-0 transition-colors"
              >
                {featureBusy === -1 ? "…" : "Ekle"}
              </button>
            </div>
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
    </div>
  );
}

function FeatureRowEditor({
  row,
  index,
  busy,
  reorderBusy,
  pendingDelete,
  onDragStart,
  onDragEnd,
  onSave,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  row: ProductFeatureDto;
  index: number;
  busy: boolean;
  reorderBusy: boolean;
  pendingDelete: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onSave: (featureName: string, value: string) => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const [name, setName] = useState(row.featureName);
  const [val, setVal] = useState(row.value);
  useEffect(() => {
    setName(row.featureName);
    setVal(row.value);
  }, [row.featureName, row.value, row.productFeatureId]);

  const unchanged =
    name.trim() === row.featureName.trim() && val === row.value;

  return (
    <div className="group relative flex gap-3 sm:gap-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-shadow">
      <button
        type="button"
        draggable={!reorderBusy && !busy}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        disabled={reorderBusy || busy}
        className="flex shrink-0 w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-grab active:cursor-grabbing disabled:opacity-40 disabled:cursor-not-allowed touch-none"
        aria-label="Sürükleyerek sırayı değiştir"
        title="Sürükle"
      >
        <GripVertical size={18} />
      </button>

      <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500">Özellik adı</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            disabled={busy}
            className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Değer</label>
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            disabled={busy}
            className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400"
          />
        </div>
        <p className="sm:col-span-2 text-[11px] text-slate-400">Liste sırası: {index + 1}</p>
      </div>

      <div className="flex shrink-0 flex-col sm:flex-row gap-2 justify-end sm:items-end">
        {pendingDelete ? (
          <div className="flex flex-col gap-2 items-end sm:items-stretch min-w-[140px]">
            <p className="text-xs text-slate-600 text-right sm:text-left">Kaldırılsın mı?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancelDelete}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={busy}
                className="flex-1 h-9 px-3 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Evet
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={busy || reorderBusy || unchanged || !name.trim()}
              onClick={() => onSave(name, val)}
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Kaydet
            </button>
            <button
              type="button"
              disabled={busy || reorderBusy}
              onClick={onRequestDelete}
              className="h-9 px-4 rounded-xl border border-red-200 bg-white text-red-600 text-xs font-medium hover:bg-red-50 whitespace-nowrap"
            >
              Sil
            </button>
          </>
        )}
      </div>
    </div>
  );
}

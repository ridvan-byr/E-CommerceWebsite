"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Package, DollarSign, Image, CheckCircle, AlertCircle,
  Plus, X, Layers, Tag, GripVertical, Pencil, Check,
} from "lucide-react";
import { products, categories } from "@/lib/mockData";

interface Feature {
  id: number;
  name: string;
  value: string;
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [form, setForm] = useState({
    name: "", description: "", price: "", discountPrice: "",
    stock: "", categoryId: "", sku: "", barcode: "", image: "", status: "active",
    isDiscount: false,
  });
  const [features, setFeatures] = useState<Feature[]>([]);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureValue, setNewFeatureValue] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const hasDiscount = product.isDiscount && !!product.originalPrice;
      setForm({
        name: product.name,
        description: product.description,
        price: hasDiscount ? product.originalPrice!.toString() : product.price.toString(),
        discountPrice: hasDiscount ? product.price.toString() : "",
        stock: product.stock.toString(),
        categoryId: product.categoryId.toString(),
        sku: product.sku,
        barcode: product.barcode ?? "",
        image: product.image,
        status: product.status,
        isDiscount: hasDiscount,
      });
      if (product.features) {
        setFeatures(product.features.map((f, i) => ({ id: i + 1, ...f })));
      }
    } else {
      setNotFound(true);
    }
  }, [productId]);

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Ürün adı zorunludur.";
    if (!form.description.trim()) e.description = "Açıklama zorunludur.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Geçerli bir fiyat giriniz.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Geçerli bir stok miktarı giriniz.";
    if (!form.categoryId) e.categoryId = "Kategori seçimi zorunludur.";
    if (!form.sku.trim()) e.sku = "SKU kodu zorunludur.";
    const bc = form.barcode.trim();
    if (bc && !/^[0-9]{8,14}$/.test(bc)) {
      e.barcode = "Barkod boş bırakılabilir veya 8–14 haneli rakam olmalıdır.";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 1500));
    router.push("/products");
  };

  const [editingFeatureId, setEditingFeatureId] = useState<number | null>(null);
  const [editFeatureName, setEditFeatureName] = useState("");
  const [editFeatureValue, setEditFeatureValue] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addFeature = () => {
    if (!newFeatureName.trim() || !newFeatureValue.trim()) return;
    setFeatures((prev) => [
      ...prev,
      { id: Date.now(), name: newFeatureName.trim(), value: newFeatureValue.trim() },
    ]);
    setNewFeatureName("");
    setNewFeatureValue("");
  };

  const removeFeature = (id: number) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const startEdit = (feature: Feature) => {
    setEditingFeatureId(feature.id);
    setEditFeatureName(feature.name);
    setEditFeatureValue(feature.value);
  };

  const saveEdit = () => {
    if (!editFeatureName.trim() || !editFeatureValue.trim()) return;
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === editingFeatureId ? { ...f, name: editFeatureName.trim(), value: editFeatureValue.trim() } : f
      )
    );
    setEditingFeatureId(null);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFeatures((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const inputClass = (field: string) =>
    `w-full h-11 px-4 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors[field] ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`;

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          Geri Dön
        </button>
        <div className="flex flex-col items-center gap-4 py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <h2 className="text-slate-900 font-bold text-lg">Ürün Bulunamadı</h2>
          <p className="text-slate-500 text-sm">ID: #{productId} ile eşleşen bir ürün bulunamadı.</p>
          <button onClick={() => router.back()} className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all inline-flex items-center">
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Geri Dön
      </button>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-700 text-sm font-medium">Ürün başarıyla güncellendi! Yönlendiriliyorsunuz...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Package size={17} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-indigo-900 font-semibold text-sm">Ürün Düzenleniyor</h2>
            <p className="text-indigo-600 text-xs">
              ID: #{productId} &bull; SKU: {form.sku}
              {form.barcode ? <> &bull; Barkod: {form.barcode}</> : null}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Package size={17} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Temel Bilgiler</h2>
              <p className="text-slate-400 text-xs">Ürünün temel bilgilerini düzenleyin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 text-sm font-medium mb-2">Ürün Adı <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Örn: iPhone 15 Pro..." className={inputClass("name")} />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.name}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 text-sm font-medium mb-2">Açıklama <span className="text-red-500">*</span></label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Ürün hakkında detaylı bir açıklama..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.description}</p>}
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">SKU Kodu <span className="text-red-500">*</span></label>
              <input type="text" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="Örn: APL-IP15-256" className={inputClass("sku")} />
              {errors.sku && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.sku}</p>}
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Barkod <span className="text-slate-400 font-normal">(isteğe bağlı)</span></label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={form.barcode}
                onChange={(e) => set("barcode", e.target.value.replace(/\D/g, ""))}
                placeholder="8–14 haneli rakam"
                maxLength={14}
                className={inputClass("barcode")}
              />
              {errors.barcode && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.barcode}</p>}
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Kategori <span className="text-red-500">*</span></label>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={`w-full h-11 px-4 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer ${errors.categoryId ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
              >
                <option value="">Kategori seçin...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.categoryId}</p>}
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign size={17} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Fiyat & Stok</h2>
              <p className="text-slate-400 text-xs">Ürün fiyatı ve stok bilgilerini düzenleyin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Fiyat (₺) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₺</span>
                <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" className={`w-full h-11 pl-8 pr-4 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.price ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`} />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.price}</p>}
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Stok Miktarı <span className="text-red-500">*</span></label>
              <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="0" className={inputClass("stock")} />
              {errors.stock && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.stock}</p>}
            </div>

            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isDiscount}
                    onChange={(e) => set("isDiscount", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                </div>
                <span className="text-slate-700 text-sm font-medium group-hover:text-slate-900 transition-colors">
                  İndirim
                </span>
              </label>
            </div>
          </div>

          {form.isDiscount && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-amber-600" />
                <span className="text-amber-800 text-sm font-semibold">İndirim Bilgileri</span>
              </div>
              <div>
                <label className="block text-amber-800 text-sm font-medium mb-2">İndirimli Satış Fiyatı (₺) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₺</span>
                  <input
                    type="number"
                    value={form.discountPrice}
                    onChange={(e) => set("discountPrice", e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 pl-8 pr-4 rounded-xl border border-amber-300 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                  🎉 İndirim oranı: %{Math.round((1 - Number(form.discountPrice) / Number(form.price)) * 100)}
                </div>
              )}
              {form.price && form.discountPrice && Number(form.discountPrice) >= Number(form.price) && (
                <p className="text-red-600 text-xs font-medium">⚠ İndirimli fiyat, liste fiyatından düşük olmalıdır.</p>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
              <Layers size={17} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Ürün Özellikleri</h2>
              <p className="text-slate-400 text-xs">Renk, ağırlık, malzeme gibi özellikler ekleyin</p>
            </div>
          </div>

          {features.length > 0 && (
            <div className="space-y-1.5">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  draggable={editingFeatureId !== feature.id}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                  className={`flex items-center gap-2 p-3 rounded-xl group transition-all ${
                    dragOverIndex === index ? "bg-sky-50 border-2 border-dashed border-sky-300" :
                    dragIndex === index ? "opacity-40 bg-slate-100" : "bg-slate-50"
                  }`}
                >
                  <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
                    <GripVertical size={16} />
                  </div>

                  {editingFeatureId === feature.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editFeatureName}
                        onChange={(e) => setEditFeatureName(e.target.value)}
                        className="flex-1 h-8 px-2.5 rounded-lg border border-sky-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editFeatureValue}
                        onChange={(e) => setEditFeatureValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        className="flex-1 h-8 px-2.5 rounded-lg border border-sky-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-all flex-shrink-0"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingFeatureId(null)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 transition-all flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <span className="text-slate-500 text-sm font-medium">{feature.name}</span>
                        <span className="text-slate-800 text-sm">{feature.value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => startEdit(feature)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFeature(feature.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-slate-700 text-xs font-medium mb-1.5">Özellik Adı</label>
              <input
                type="text"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="Örn: Renk, Ağırlık..."
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-slate-700 text-xs font-medium mb-1.5">Değer</label>
              <input
                type="text"
                value={newFeatureValue}
                onChange={(e) => setNewFeatureValue(e.target.value)}
                placeholder="Örn: Kırmızı, 2.5kg..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="button"
              onClick={addFeature}
              disabled={!newFeatureName.trim() || !newFeatureValue.trim()}
              className="h-10 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus size={15} />
              Ekle
            </button>
          </div>
        </div>

        {/* Image & Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <Image size={17} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Görsel & Durum</h2>
              <p className="text-slate-400 text-xs">Ürün görseli ve yayın durumunu düzenleyin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 text-sm font-medium mb-2">Görsel URL</label>
              <input type="url" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://example.com/image.jpg" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
            </div>

            {form.image && (
              <div className="sm:col-span-2">
                <img src={form.image} alt="Önizleme" className="w-48 h-48 object-cover rounded-xl border border-slate-200" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-slate-700 text-sm font-medium mb-2">Yayın Durumu</label>
              <div className="flex gap-3">
                {["active", "inactive", "draft"].map((s) => {
                  const labels: Record<string, string> = { active: "Aktif", inactive: "Pasif", draft: "Taslak" };
                  const colors: Record<string, string> = {
                    active: "border-emerald-500 bg-emerald-50 text-emerald-700",
                    inactive: "border-red-300 bg-red-50 text-red-600",
                    draft: "border-slate-300 bg-slate-50 text-slate-600",
                  };
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("status", s)}
                      className={`flex-1 h-10 rounded-xl border-2 text-sm font-semibold transition-all ${form.status === s ? colors[s] : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}`}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 h-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">İptal</button>
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, DollarSign, Image, Tag, CheckCircle, ToggleLeft } from "lucide-react";
import { categories } from "@/lib/mockData";

export default function ProductCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", description: "", price: "", originalPrice: "",
    stock: "", categoryId: "", sku: "", image: "", status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Ürün adı zorunludur.";
    if (!form.description.trim()) e.description = "Açıklama zorunludur.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Geçerli bir fiyat giriniz.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Geçerli bir stok miktarı giriniz.";
    if (!form.categoryId) e.categoryId = "Kategori seçimi zorunludur.";
    if (!form.sku.trim()) e.sku = "SKU kodu zorunludur.";
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

  const inputClass = (field: string) =>
    `w-full h-11 px-4 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors[field] ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Ürünlere Dön
      </Link>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-700 text-sm font-medium">Ürün başarıyla oluşturuldu! Yönlendiriliyorsunuz...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
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
              <p className="text-slate-400 text-xs">Ürün fiyatı ve stok bilgileri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Satış Fiyatı (₺) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₺</span>
                <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" className={`w-full h-11 pl-8 pr-4 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.price ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`} />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.price}</p>}
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">İndirim Öncesi Fiyat (₺)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₺</span>
                <input type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="0.00" className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Stok Miktarı <span className="text-red-500">*</span></label>
              <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="0" className={inputClass("stock")} />
              {errors.stock && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.stock}</p>}
            </div>
          </div>

          {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 text-sm font-medium">
                🎉 İndirim oranı: %{Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)}
              </span>
            </div>
          )}
        </div>

        {/* Image & Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <Image size={17} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold">Görsel & Durum</h2>
              <p className="text-slate-400 text-xs">Ürün görseli ve yayın durumu</p>
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
          <Link href="/products" className="flex-1 h-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">İptal</Link>
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Ürün Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
}

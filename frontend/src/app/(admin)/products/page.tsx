"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Package, SlidersHorizontal, Star, Eye } from "lucide-react";
import { products as initialProducts, categories } from "@/lib/mockData";

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: "Aktif", className: "text-emerald-700 bg-emerald-50", dot: "bg-emerald-500" },
  inactive: { label: "Pasif", className: "text-red-600 bg-red-50", dot: "bg-red-500" },
  draft: { label: "Taslak", className: "text-slate-600 bg-slate-100", dot: "bg-slate-400" },
};

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ürün adı veya SKU ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <Link
          href="/products/create"
          className="flex items-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 whitespace-nowrap"
        >
          <Plus size={17} />
          Yeni Ürün
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-slate-500">
          <SlidersHorizontal size={15} />
          <span className="text-sm font-medium">Filtrele:</span>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
          <option value="draft">Taslak</option>
        </select>
        {(selectedCategory !== "all" || selectedStatus !== "all" || search) && (
          <button
            onClick={() => { setSearch(""); setSelectedCategory("all"); setSelectedStatus("all"); }}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-red-500 hover:bg-red-50 text-sm font-medium transition-all"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-500 text-sm">
            <span className="text-slate-900 font-semibold">{filtered.length}</span> ürün listeleniyor
          </p>
          <div className="flex gap-2 text-xs text-slate-400">
            <span className="px-2 py-1 bg-slate-50 rounded-lg">Toplam stok: {filtered.reduce((s, p) => s + p.stock, 0)}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-6 py-3">Ürün</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Kategori</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Fiyat</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Stok</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Puan</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Durum</th>
                <th className="text-right text-slate-500 text-xs font-semibold uppercase tracking-wide px-6 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Package size={24} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 text-sm">Arama kriterine uygun ürün bulunamadı.</p>
                      <button onClick={() => { setSearch(""); setSelectedCategory("all"); setSelectedStatus("all"); }} className="text-indigo-600 text-sm font-medium hover:text-indigo-700">Filtreleri Temizle</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const status = statusConfig[product.status];
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                          <div>
                            <p className="text-slate-900 text-sm font-semibold">{product.name}</p>
                            <p className="text-slate-400 text-xs">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center h-6 px-2.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">{product.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <span className="text-slate-900 text-sm font-bold">₺{product.price.toLocaleString("tr-TR")}</span>
                          {product.isDiscount && product.originalPrice && (
                            <p className="text-slate-400 text-xs line-through">₺{product.originalPrice.toLocaleString("tr-TR")}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-semibold ${product.stock === 0 ? "text-red-600" : product.stock < 30 ? "text-amber-600" : "text-slate-700"}`}>
                          {product.stock === 0 ? "Tükendi" : product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={13} className="text-amber-400 fill-amber-400" />
                          <span className="text-slate-700 text-sm font-medium">{product.rating}</span>
                          <span className="text-slate-400 text-xs">({product.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.id}/preview`}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-sky-600 border border-slate-200 hover:border-sky-200 text-xs font-medium transition-all"
                          >
                            <Eye size={13} />
                            Görüntüle
                          </Link>
                          <Link
                            href={`/products/${product.id}`}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-xs font-medium transition-all"
                          >
                            <Edit2 size={13} />
                            Düzenle
                          </Link>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs font-medium transition-all"
                          >
                            <Trash2 size={13} />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg mb-2">Ürünü Sil</h3>
            <p className="text-slate-500 text-sm mb-6">Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">İptal</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

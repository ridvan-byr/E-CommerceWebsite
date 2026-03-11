"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Package, MoreHorizontal } from "lucide-react";
import { categories as initialCategories } from "@/lib/mockData";

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
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
            placeholder="Kategori ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <Link
          href="/categories/create"
          className="flex items-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 whitespace-nowrap"
        >
          <Plus size={17} />
          Yeni Kategori
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Toplam Kategori", value: categories.length, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Toplam Ürün", value: categories.reduce((s, c) => s + c.productCount, 0), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "En Çok Ürün", value: Math.max(...categories.map((c) => c.productCount)), color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Ortalama Ürün", value: Math.round(categories.reduce((s, c) => s + c.productCount, 0) / categories.length), color: "text-sky-600", bg: "bg-sky-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-xs font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-slate-500 text-sm">
            <span className="text-slate-900 font-semibold">{filtered.length}</span> kategori listeleniyor
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-6 py-3">Kategori</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Açıklama</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Ürün Sayısı</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Oluşturulma</th>
                <th className="text-right text-slate-500 text-xs font-semibold uppercase tracking-wide px-6 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Package size={24} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 text-sm">Arama kriterine uygun kategori bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-11 h-11 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div>
                          <p className="text-slate-900 text-sm font-semibold">{category.name}</p>
                          <p className="text-slate-400 text-xs">ID: #{category.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-600 text-sm max-w-xs truncate">{category.description}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 text-sm font-semibold">{category.productCount}</span>
                        <span className="text-slate-400 text-xs">ürün</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-500 text-sm">
                        {new Date(category.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/categories/${category.id}`}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-xs font-medium transition-all"
                        >
                          <Edit2 size={13} />
                          Düzenle
                        </Link>
                        <button
                          onClick={() => setDeleteId(category.id)}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs font-medium transition-all"
                        >
                          <Trash2 size={13} />
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg mb-2">Kategoriyi Sil</h3>
            <p className="text-slate-500 text-sm mb-6">
              Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

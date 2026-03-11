"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Grid3X3, List, Star, Edit2, X, Package } from "lucide-react";
import { products, categories } from "@/lib/mockData";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Aktif", className: "text-emerald-700 bg-emerald-50" },
  inactive: { label: "Pasif", className: "text-red-600 bg-red-50" },
  draft: { label: "Taslak", className: "text-slate-600 bg-slate-100" },
};

export default function ProductSearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    let filtered = products.filter((p) => {
      const q = query.toLowerCase();
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
      const matchMin = !minPrice || p.price >= Number(minPrice);
      const matchMax = !maxPrice || p.price <= Number(maxPrice);
      const matchStock = !minStock || p.stock >= Number(minStock);
      return matchQuery && matchCategory && matchStatus && matchMin && matchMax && matchStock;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock") return b.stock - a.stock;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [query, selectedCategory, selectedStatus, minPrice, maxPrice, minStock, sortBy]);

  const hasFilters = selectedCategory !== "all" || selectedStatus !== "all" || minPrice || maxPrice || minStock;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setMinPrice("");
    setMaxPrice("");
    setMinStock("");
    setSortBy("name");
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün adı, SKU veya açıklama ile ara..."
              autoFocus
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-12 px-4 rounded-xl border text-sm font-medium transition-all ${showFilters || hasFilters ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <SlidersHorizontal size={16} />
            Filtreler
            {hasFilters && <span className="w-2 h-2 bg-indigo-600 rounded-full" />}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-slate-600 text-xs font-medium mb-1.5">Kategori</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                <option value="all">Tümü</option>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-medium mb-1.5">Durum</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="draft">Taslak</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-medium mb-1.5">Min Fiyat (₺)</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-medium mb-1.5">Max Fiyat (₺)</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="999999" className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-medium mb-1.5">Min Stok</label>
              <input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="0" className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {hasFilters && (
              <div className="flex items-end col-span-2 sm:col-span-1">
                <button onClick={clearFilters} className="w-full h-9 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all">
                  Temizle
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600 text-sm">
          <span className="text-slate-900 font-semibold">{results.length}</span> sonuç bulundu
          {query && <span className="text-slate-400"> — &quot;{query}&quot; için</span>}
        </p>
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
            <option value="name">İsme Göre</option>
            <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="stock">Stok: Fazladan Aza</option>
            <option value="rating">En Yüksek Puan</option>
          </select>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            <button onClick={() => setViewMode("grid")} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600"}`}>
              <Grid3X3 size={14} />
            </button>
            <button onClick={() => setViewMode("list")} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600"}`}>
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold text-lg mb-2">Sonuç Bulunamadı</p>
          <p className="text-slate-400 text-sm mb-4">Arama kriterlerinizi değiştirmeyi deneyin.</p>
          <button onClick={() => { setQuery(""); clearFilters(); }} className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-all">
            <X size={14} /> Aramayı Temizle
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((product) => {
            const status = statusConfig[product.status];
            return (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                  {product.originalPrice && (
                    <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">
                      -%{Math.round((1 - product.price / product.originalPrice) * 100)}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-slate-500 text-xs mb-1">{product.category}</p>
                  <h3 className="text-slate-900 font-semibold text-sm leading-tight mb-2 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-slate-600 text-xs font-medium">{product.rating}</span>
                    <span className="text-slate-400 text-xs">({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-900 font-bold text-base">₺{product.price.toLocaleString("tr-TR")}</span>
                      {product.originalPrice && <p className="text-slate-400 text-xs line-through">₺{product.originalPrice.toLocaleString("tr-TR")}</p>}
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      className="flex items-center gap-1 h-8 px-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-all"
                    >
                      <Edit2 size={12} /> Düzenle
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {results.map((product) => {
              const status = statusConfig[product.status];
              return (
                <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors">
                  <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-semibold text-sm">{product.name}</p>
                    <p className="text-slate-400 text-xs">{product.sku} · {product.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-slate-600 text-xs">{product.rating}</span>
                  </div>
                  <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>{status.label}</span>
                  <div className="text-right">
                    <p className="text-slate-900 font-bold text-sm">₺{product.price.toLocaleString("tr-TR")}</p>
                    <p className="text-slate-400 text-xs">Stok: {product.stock}</p>
                  </div>
                  <Link href={`/products/${product.id}`} className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs font-medium transition-all ml-2">
                    <Edit2 size={13} /> Düzenle
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

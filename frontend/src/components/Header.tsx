"use client";

import { usePathname } from "next/navigation";
import { Bell, Settings } from "lucide-react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Genel bakış ve istatistikler" },
  "/categories": { title: "Kategori Listesi", subtitle: "Tüm kategorileri görüntüle ve yönet" },
  "/categories/create": { title: "Yeni Kategori", subtitle: "Yeni bir kategori oluştur" },
  "/products": { title: "Ürün Listesi", subtitle: "Tüm ürünleri görüntüle ve yönet" },
  "/products/create": { title: "Yeni Ürün", subtitle: "Yeni bir ürün oluştur" },
  "/products/search": { title: "Ürün Ara", subtitle: "Gelişmiş arama ve filtreleme" },
};

export default function Header() {
  const pathname = usePathname();

  const getPageInfo = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.includes("/categories/") && !pathname.includes("create")) {
      return { title: "Kategori Düzenle", subtitle: "Kategori bilgilerini güncelle" };
    }
    if (pathname.includes("/products/") && !pathname.includes("create") && !pathname.includes("search")) {
      return { title: "Ürün Düzenle", subtitle: "Ürün bilgilerini güncelle" };
    }
    return { title: "Sayfa", subtitle: "" };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-slate-900 font-semibold text-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
          <Settings size={18} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md ml-1 cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}

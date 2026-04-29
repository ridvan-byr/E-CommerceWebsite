"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, Menu } from "lucide-react";
import { useCurrentUser } from "@/lib/currentUser";
import UserAvatar from "@/components/UserAvatar";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Genel bakış ve istatistikler" },
  "/orders": { title: "Müşteri siparişleri", subtitle: "Sipariş arama ve liste (mock veri)" },
  "/settings": { title: "Hesap ayarları", subtitle: "Profil, güvenlik ve şifre yönetimi" },
  "/categories": { title: "Kategori Listesi", subtitle: "Tüm kategorileri görüntüle ve yönet" },
  "/categories/create": { title: "Yeni Kategori", subtitle: "Yeni bir kategori oluştur" },
  "/products": { title: "Ürün Listesi", subtitle: "Tüm ürünleri görüntüle ve yönet" },
  "/products/create": { title: "Yeni Ürün", subtitle: "Yeni bir ürün oluştur" },
  "/products/search": { title: "Ürün Ara", subtitle: "Gelişmiş arama ve filtreleme" },
};

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { profile, loading } = useCurrentUser();

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
    <header className="sticky top-0 z-50 flex h-auto min-h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        aria-label="Menüyü aç"
      >
        <Menu size={22} strokeWidth={2} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold leading-tight text-slate-900 sm:text-lg">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{subtitle}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <button className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
          aria-label="Hesap ayarları"
        >
          <Settings size={18} />
        </Link>

        <div className="ml-1 border-l border-slate-200 pl-2 sm:ml-1 sm:pl-3">
          <UserAvatar profile={profile} loading={loading} size={36} className="text-sm cursor-pointer" />
        </div>
      </div>
    </header>
  );
}

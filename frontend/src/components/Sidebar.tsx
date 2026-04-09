"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  PlusCircle,
  Package,
  Search,
  LogOut,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navGroups = [
  {
    label: "Genel",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Kategoriler",
    items: [
      { href: "/categories", label: "Kategori Listesi", icon: Tag },
      { href: "/categories/create", label: "Kategori Ekle", icon: PlusCircle },
    ],
  },
  {
    label: "Ürünler",
    items: [
      { href: "/products", label: "Ürün Listesi", icon: Package },
      { href: "/products/create", label: "Ürün Ekle", icon: PlusCircle },
      { href: "/products/search", label: "Ürün Ara", icon: Search },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href === "/categories" && pathname.startsWith("/categories/") && !pathname.startsWith("/categories/create")) return true;
    if (href === "/products" && pathname.startsWith("/products/") && !pathname.startsWith("/products/create") && !pathname.startsWith("/products/search")) return true;
    return false;
  };

  return (
    <aside
      style={{ width: collapsed ? 72 : 260 }}
      className="fixed top-0 left-0 h-screen bg-slate-900 flex flex-col z-50 border-r border-slate-800 transition-all duration-300 ease-in-out overflow-hidden"
    >
      {/* Logo */}
      <div className="relative h-[72px] border-b border-slate-800 flex-shrink-0">
        {/* Expanded */}
        <div
          className={`absolute inset-0 flex items-center justify-between px-3 transition-all duration-200 ${
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100 delay-100"
          }`}
        >
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <Image
              src="/i.webp"
              alt="GelAl.com"
              width={36}
              height={36}
              className="w-9 h-9 flex-shrink-0 rounded-xl object-cover"
              priority
            />
            <div className="min-w-0">
              <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
                GelAl.com
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles size={10} className="text-indigo-400" />
                <span className="text-indigo-400 text-xs font-medium whitespace-nowrap">
                  E-Ticaret Paneli
                </span>
              </div>
            </div>
          </Link>
          <button
            onClick={onToggle}
            title="Daralt"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Collapsed */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            collapsed ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={onToggle}
            title="Genişlet"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            <PanelLeftOpen size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin px-2 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                collapsed ? "h-0 opacity-0 mb-0" : "h-5 opacity-100 mb-2"
              }`}
            >
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-3 whitespace-nowrap">
                {group.label}
              </p>
            </div>

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                        active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={17}
                        className={`flex-shrink-0 ${
                          active
                            ? "text-white"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span
                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 flex-1 ${
                          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        }`}
                      >
                        {item.label}
                      </span>
                      {active && !collapsed && (
                        <ChevronRight size={14} className="text-indigo-300 flex-shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom User */}
      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        <div
          className={`flex items-center gap-3 mb-2 overflow-hidden transition-all duration-300 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div
            className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg"
            title={collapsed ? "Admin Kullanıcı" : undefined}
          >
            A
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 min-w-0 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            <p className="text-white text-sm font-semibold truncate whitespace-nowrap">
              Admin Kullanıcı
            </p>
            <p className="text-slate-500 text-xs truncate whitespace-nowrap">
              admin@eticaret.com
            </p>
          </div>
        </div>

        <Link
          href="/login"
          title={collapsed ? "Çıkış Yap" : undefined}
          className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all text-sm font-medium ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={15} className="flex-shrink-0" />
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            Çıkış Yap
          </span>
        </Link>
      </div>
    </aside>
  );
}

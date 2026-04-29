"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { firebaseSignOut, logoutSession } from "@/lib/api/authApi";
import { setStoredUserProfile } from "@/lib/api/client";
import { useCurrentUser, displayName } from "@/lib/currentUser";
import UserAvatar from "@/components/UserAvatar";
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
  ClipboardList,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navGroups = [
  {
    label: "Genel",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Siparişler",
    items: [{ href: "/orders", label: "Müşteri siparişleri", icon: ClipboardList }],
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

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading: profileLoading } = useCurrentUser();
  const isMdUp = useMediaQuery("(min-width: 768px)", false);
  const effectiveCollapsed = collapsed && isMdUp;

  const handleLogout = async () => {
    try {
      await logoutSession();
    } catch {
      // Sunucu cookie'si zaten yoksa sorun değil.
    }
    setStoredUserProfile(null);
    try {
      await firebaseSignOut();
    } catch {
      // Firebase oturumu zaten yoksa sorun değil.
    }
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href === "/categories" && pathname.startsWith("/categories/") && !pathname.startsWith("/categories/create")) return true;
    if (href === "/products" && pathname.startsWith("/products/") && !pathname.startsWith("/products/create") && !pathname.startsWith("/products/search")) return true;
    return false;
  };

  return (
    <aside
      style={{ width: effectiveCollapsed ? 72 : 260 }}
      className={`fixed top-0 left-0 z-[60] flex h-[100dvh] flex-col overflow-hidden border-r border-slate-800 bg-slate-900 transition-[transform,width] duration-300 ease-in-out max-md:!w-[min(280px,85vw)] ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      {/* Logo */}
      <div className="relative h-[72px] border-b border-slate-800 flex-shrink-0">
        {/* Expanded */}
        <div
          className={`absolute inset-0 flex items-center justify-between px-3 transition-all duration-200 ${
            effectiveCollapsed ? "opacity-0 pointer-events-none" : "opacity-100 delay-100"
          }`}
        >
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3"
            onClick={() => onMobileClose?.()}
          >
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
            effectiveCollapsed ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"
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
                effectiveCollapsed ? "mb-0 h-0 opacity-0" : "mb-2 h-5 opacity-100"
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
                      title={effectiveCollapsed ? item.label : undefined}
                      onClick={() => onMobileClose?.()}
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
                        className={`flex-1 overflow-hidden whitespace-nowrap transition-all duration-300 ${
                          effectiveCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        }`}
                      >
                        {item.label}
                      </span>
                      {active && !effectiveCollapsed && (
                        <ChevronRight size={14} className="flex-shrink-0 text-indigo-300" />
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
          className={`mb-2 flex items-center gap-3 overflow-hidden transition-all duration-300 ${
            effectiveCollapsed ? "justify-center" : ""
          }`}
        >
          <UserAvatar
            profile={profile}
            loading={profileLoading}
            size={36}
            className="text-sm shadow-lg"
            title={effectiveCollapsed && profile ? displayName(profile) : undefined}
          />
          <div
            className={`min-w-0 overflow-hidden transition-all duration-300 ${
              effectiveCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            <p className="text-white text-sm font-semibold truncate whitespace-nowrap">
              {profileLoading
                ? "…"
                : profile
                  ? displayName(profile)
                  : "Oturum yok"}
            </p>
            <p className="text-slate-500 text-xs truncate whitespace-nowrap">
              {profileLoading ? "…" : profile?.email ?? "—"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onMobileClose?.();
            void handleLogout();
          }}
          title={effectiveCollapsed ? "Çıkış Yap" : undefined}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-red-400 ${
            effectiveCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={15} className="flex-shrink-0" />
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              effectiveCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            Çıkış Yap
          </span>
        </button>
      </div>
    </aside>
  );
}

"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { CurrentUserProvider } from "@/lib/currentUser";
import SessionGuard from "@/components/SessionGuard";
import KvkkGuard from "@/components/KvkkGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  const handleToggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  const sidebarPx = collapsed ? 72 : 260;

  return (
    <CurrentUserProvider>
      <SessionGuard>
      <KvkkGuard>
        <div
          className="min-h-screen bg-slate-100 flex min-h-[100dvh]"
          style={{ ["--admin-sidebar" as string]: `${sidebarPx}px` }}
        >
          <Sidebar
            collapsed={collapsed}
            onToggle={handleToggle}
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />
          {mobileNavOpen && (
            <div
              role="presentation"
              className="fixed inset-0 z-[55] bg-slate-950/50 backdrop-blur-[2px] md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-in-out md:ml-[var(--admin-sidebar)] ml-0">
            <Header onMenuClick={() => setMobileNavOpen(true)} />
            <main className="flex-1 p-4 pb-6 sm:p-6">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>
      </KvkkGuard>
      </SessionGuard>
    </CurrentUserProvider>
  );
}

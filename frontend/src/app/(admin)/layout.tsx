"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const handleToggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <div
        style={{ marginLeft: collapsed ? 72 : 260 }}
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
      >
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/components/ThemeProvider";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Açık", icon: Sun },
  { value: "dark", label: "Koyu", icon: Moon },
  { value: "system", label: "Sistem", icon: Laptop },
];

type Props = {
  /** `minimal`: tek düğme döngüsü; `menu`: üç seçenekli liste */
  variant?: "menu" | "minimal";
  className?: string;
};

export default function ThemeToggle({ variant = "menu", className = "" }: Props) {
  const { preference, setPreference, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const cycle = () => {
    const order: ThemePreference[] = ["light", "dark", "system"];
    const i = order.indexOf(preference);
    setPreference(order[(i + 1) % order.length]);
  };

  const CurrentIcon =
    preference === "dark" ? Moon : preference === "light" ? Sun : Laptop;

  if (!mounted) {
    return (
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl border border-transparent ${className}`}
        aria-hidden
      />
    );
  }

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={cycle}
        className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${className}`}
        title="Tema: döngü (açık → koyu → sistem)"
        aria-label="Tema değiştir"
      >
        <CurrentIcon size={17} strokeWidth={2} />
      </button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Tema seç"
      >
        <CurrentIcon size={17} strokeWidth={2} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-[70] min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-800"
        >
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const sel = preference === opt.value;
            return (
              <li key={opt.value} role="option" aria-selected={sel}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors ${
                    sel
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80"
                  }`}
                  onClick={() => {
                    setPreference(opt.value);
                    setOpen(false);
                  }}
                >
                  <Icon size={15} className="shrink-0 opacity-80" />
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: number;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration: number;
};

type ToastContextValue = {
  show: (
    message: string,
    options?: { title?: string; variant?: ToastVariant; duration?: number },
  ) => number;
  success: (message: string, title?: string, duration?: number) => number;
  error: (message: string, title?: string, duration?: number) => number;
  info: (message: string, title?: string, duration?: number) => number;
  warning: (message: string, title?: string, duration?: number) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue["show"]>(
    (message, options) => {
      const id = nextId++;
      const toast: ToastItem = {
        id,
        variant: options?.variant ?? "info",
        title: options?.title,
        message,
        duration: options?.duration ?? 4000,
      };
      setToasts((list) => [...list, toast]);
      return id;
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      dismiss,
      success: (message, title, duration) =>
        show(message, { variant: "success", title, duration }),
      error: (message, title, duration) =>
        show(message, { variant: "error", title, duration: duration ?? 5000 }),
      info: (message, title, duration) =>
        show(message, { variant: "info", title, duration }),
      warning: (message, title, duration) =>
        show(message, { variant: "warning", title, duration }),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; bg: string; icon: React.ReactNode; title: string }
> = {
  success: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    icon: <CheckCircle2 size={18} className="text-emerald-600" />,
    title: "text-emerald-900",
  },
  error: {
    border: "border-red-200",
    bg: "bg-red-50",
    icon: <AlertCircle size={18} className="text-red-600" />,
    title: "text-red-900",
  },
  info: {
    border: "border-sky-200",
    bg: "bg-sky-50",
    icon: <Info size={18} className="text-sky-600" />,
    title: "text-sky-900",
  },
  warning: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    icon: <AlertTriangle size={18} className="text-amber-600" />,
    title: "text-amber-900",
  },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const style = VARIANT_STYLES[toast.variant];

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const id = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(id);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${style.border} ${style.bg} p-3 shadow-sm`}
    >
      <div className="mt-0.5 shrink-0">{style.icon}</div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold ${style.title}`}>{toast.title}</p>
        )}
        <p className="text-sm text-slate-700 break-words">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-white/60 hover:text-slate-700 transition-colors"
        aria-label="Kapat"
      >
        <X size={14} />
      </button>
    </div>
  );
}

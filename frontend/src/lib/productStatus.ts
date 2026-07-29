export type ProductStatusInfo = {
  label: string;
  className: string;
  dot: string;
};

const STATUS: Record<string, ProductStatusInfo> = {
  active: {
    label: "Aktif",
    className:
      "text-emerald-800 bg-emerald-50 ring-1 ring-emerald-200/60 dark:text-emerald-200 dark:bg-emerald-950/55 dark:ring-emerald-800/60",
    dot: "bg-emerald-500",
  },
  inactive: {
    label: "Pasif",
    className:
      "text-red-700 bg-red-50 ring-1 ring-red-200/60 dark:text-red-300 dark:bg-red-950/50 dark:ring-red-900/60",
    dot: "bg-red-500",
  },
  draft: {
    label: "Taslak",
    className:
      "text-slate-700 bg-slate-100 ring-1 ring-slate-200/80 dark:text-slate-200 dark:bg-slate-800/90 dark:ring-slate-600/80",
    dot: "bg-slate-400",
  },
};

export function getProductStatusInfo(status?: string | null): ProductStatusInfo {
  if (!status) return STATUS.active;
  return STATUS[status] ?? STATUS.active;
}

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  active: STATUS.active.label,
  inactive: STATUS.inactive.label,
  draft: STATUS.draft.label,
};

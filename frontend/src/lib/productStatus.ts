export type ProductStatusInfo = {
  label: string;
  className: string;
  dot: string;
};

const STATUS: Record<string, ProductStatusInfo> = {
  active: {
    label: "Aktif",
    className: "text-emerald-700 bg-emerald-50",
    dot: "bg-emerald-500",
  },
  inactive: {
    label: "Pasif",
    className: "text-red-600 bg-red-50",
    dot: "bg-red-500",
  },
  draft: {
    label: "Taslak",
    className: "text-slate-600 bg-slate-100",
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

"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  CreditCard,
  Building2,
  Banknote,
  SlidersHorizontal,
} from "lucide-react";
import type { CustomerOrder, MockOrderStatus } from "@/lib/mockData";
import { customerOrders } from "@/lib/mockData";
import FadeUp from "@/components/FadeUp";

const STATUS_LABEL: Record<MockOrderStatus, string> = {
  pending: "Bekliyor",
  processing: "İşleniyor",
  shipped: "Kargoda",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const STATUS_CLASS: Record<MockOrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-100",
  processing: "bg-blue-50 text-blue-800 ring-blue-100",
  shipped: "bg-indigo-50 text-indigo-800 ring-indigo-100",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200/80",
};

const PAYMENT_LABEL: Record<CustomerOrder["paymentMethod"], string> = {
  card: "Kredi kartı",
  transfer: "Havale / EFT",
  cash_on_delivery: "Kapıda ödeme",
};

const PAYMENT_ICON = {
  card: CreditCard,
  transfer: Building2,
  cash_on_delivery: Banknote,
} as const;

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function compactPhone(s: string): string {
  return s.replace(/\s/g, "");
}

/**
 * Tek kutuda birleşik arama: sipariş no, müşteri adı/e-posta, telefon,
 * şehir, ürün özeti ve SKU alanı (mock’ta searchSku).
 */
function matchesOrderQuery(order: CustomerOrder, raw: string): boolean {
  const q = normalize(raw);
  if (!q) return true;

  const haystack = [
    order.id,
    order.customerName,
    order.customerEmail,
    order.summary,
    order.city,
    order.searchSku ?? "",
    compactPhone(order.phone),
  ]
    .join(" ")
    .toLowerCase();

  if (haystack.includes(q)) return true;

  const qDigits = q.replace(/\D/g, "");
  const phoneDigits = order.phone.replace(/\D/g, "");
  if (qDigits.length >= 3 && phoneDigits.includes(qDigits)) return true;

  return false;
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MockOrderStatus | "all">("all");

  const filtered = useMemo(() => {
    return customerOrders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return matchesOrderQuery(o, search);
    });
  }, [search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [filtered]);

  return (
    <div className="space-y-6">
      <FadeUp delay={0}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-xl">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sipariş no, müşteri, e-posta, telefon veya ürün / SKU…"
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-slate-500">
              <SlidersHorizontal size={15} />
              <span className="text-sm font-medium">Durum:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MockOrderStatus | "all")}
              className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tümü</option>
              {(Object.keys(STATUS_LABEL) as MockOrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={40}>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-6">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{sorted.length}</span> sipariş
              {search.trim() || statusFilter !== "all" ? " (filtreye uygun)" : ""}
            </p>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-100">
              mock veri
            </span>
          </div>

          {sorted.length === 0 ? (
            <div className="px-4 py-16 text-center sm:px-6">
              <p className="text-sm text-slate-500">
                Bu filtrelere uygun sipariş yok. Arama terimini veya durumu değiştirin.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                      Sipariş
                    </th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Müşteri
                    </th>
                    <th className="hidden px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">
                      Özet
                    </th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Tutar
                    </th>
                    <th className="hidden px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                      Ödeme
                    </th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Durum
                    </th>
                    <th className="hidden px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:table-cell sm:px-6">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sorted.map((order) => {
                    const PayIcon = PAYMENT_ICON[order.paymentMethod];
                    const dt = new Date(order.createdAt);
                    return (
                      <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-4 py-4 align-top sm:px-6">
                          <span className="font-mono text-sm font-semibold text-indigo-700">
                            {order.id}
                          </span>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 lg:hidden">
                            <MapPin size={11} className="shrink-0" />
                            {order.city}
                          </p>
                        </td>
                        <td className="max-w-[200px] px-3 py-4 align-top">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {order.customerName}
                          </p>
                          <p className="truncate text-xs text-slate-500">{order.customerEmail}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-400">{order.phone}</p>
                        </td>
                        <td className="hidden max-w-[280px] px-3 py-4 align-top lg:table-cell">
                          <p className="line-clamp-2 text-sm text-slate-700">{order.summary}</p>
                          {order.searchSku && (
                            <p className="mt-1 font-mono text-[11px] text-slate-400">{order.searchSku}</p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 align-top">
                          <span className="text-sm font-bold text-slate-900">
                            ₺{order.amount.toLocaleString("tr-TR")}
                          </span>
                        </td>
                        <td className="hidden px-3 py-4 align-top md:table-cell">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                            <PayIcon size={13} className="text-slate-500" />
                            {PAYMENT_LABEL[order.paymentMethod]}
                          </span>
                        </td>
                        <td className="px-3 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${STATUS_CLASS[order.status]}`}
                          >
                            {STATUS_LABEL[order.status]}
                          </span>
                          <div className="mt-2 md:hidden">
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                              <PayIcon size={12} />
                              {PAYMENT_LABEL[order.paymentMethod]}
                            </span>
                          </div>
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-4 align-top text-right text-xs text-slate-500 sm:table-cell sm:px-6">
                          <time dateTime={order.createdAt}>
                            {dt.toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </time>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                            {dt.toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="mt-1 hidden items-center justify-end gap-1 text-slate-400 lg:flex">
                            <MapPin size={11} />
                            {order.city}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FadeUp>

      <FadeUp delay={80}>
        <p className="text-center text-xs text-slate-400">
          Bu liste örnek veridir; sipariş API’si bağlandığında aynı filtre mantığı sunucu tarafına taşınabilir.
        </p>
      </FadeUp>
    </div>
  );
}

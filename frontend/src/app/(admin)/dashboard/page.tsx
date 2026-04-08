import { TrendingUp, TrendingDown, Package, Tag, ShoppingCart, DollarSign, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { dashboardStats, products, recentOrders, categories } from "@/lib/mockData";

function StatCard({
  title,
  value,
  growth,
  icon: Icon,
  iconBg,
  iconColor,
  prefix = "",
}: {
  title: string;
  value: string | number;
  growth: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  prefix?: string;
}) {
  const isPositive = growth >= 0;
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center`}>
          <Icon size={22} className={iconColor} />
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isPositive ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(growth)}%
        </span>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <p className="text-slate-900 text-2xl font-bold">
        {prefix}{typeof value === "number" ? value.toLocaleString("tr-TR") : value}
      </p>
    </div>
  );
}

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "Tamamlandı", className: "text-emerald-700 bg-emerald-50" },
  processing: { label: "İşleniyor", className: "text-blue-700 bg-blue-50" },
  shipped: { label: "Kargoda", className: "text-indigo-700 bg-indigo-50" },
  pending: { label: "Bekliyor", className: "text-amber-700 bg-amber-50" },
};

const productStatusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Aktif", className: "text-emerald-700 bg-emerald-50" },
  inactive: { label: "Pasif", className: "text-red-600 bg-red-50" },
  draft: { label: "Taslak", className: "text-slate-600 bg-slate-100" },
};

export default function DashboardPage() {
  const topProducts = products.slice(0, 5);

  return (
    <div className="space-y-6">
      <p className="text-slate-500 text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        Sipariş ve gelir metrikleri ile aşağıdaki ürün listesi şimdilik örnek (mock) veridir; API’de sipariş uçları yok.
        Kategori ve ürün yönetimi gerçek backend’e bağlıdır.
      </p>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Ürün"
          value={dashboardStats.totalProducts}
          growth={dashboardStats.productGrowth}
          icon={Package}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Toplam Kategori"
          value={dashboardStats.totalCategories}
          growth={dashboardStats.categoryGrowth}
          icon={Tag}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Toplam Sipariş"
          value={dashboardStats.totalOrders}
          growth={dashboardStats.orderGrowth}
          icon={ShoppingCart}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
        />
        <StatCard
          title="Toplam Gelir"
          value={dashboardStats.totalRevenue}
          growth={dashboardStats.revenueGrowth}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          prefix="₺"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-slate-900 font-semibold">Son Siparişler</h2>
              <p className="text-slate-400 text-xs mt-0.5">Güncel sipariş durumları</p>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">
              Tümü <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders.map((order) => {
              const status = statusConfig[order.status];
              return (
                <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                      <ShoppingCart size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-slate-800 text-sm font-semibold">{order.customer}</p>
                      <p className="text-slate-400 text-xs">{order.product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-900 text-sm font-bold">₺{order.amount.toLocaleString("tr-TR")}</p>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-slate-900 font-semibold">Kategoriler</h2>
              <p className="text-slate-400 text-xs mt-0.5">Ürün dağılımı</p>
            </div>
            <Link href="/categories" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">
              Tümü <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {categories.map((cat, i) => {
              const total = categories.reduce((sum, c) => sum + c.productCount, 0);
              const pct = Math.round((cat.productCount / total) * 100);
              const colors = ["bg-indigo-500", "bg-purple-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-700 text-sm font-medium">{cat.name}</span>
                    <span className="text-slate-500 text-xs">{cat.productCount} ürün</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-slate-900 font-semibold">Öne Çıkan Ürünler</h2>
            <p className="text-slate-400 text-xs mt-0.5">En yüksek puanlı ürünler</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">
            Tüm Ürünler <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-6 py-3">Ürün</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Kategori</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Fiyat</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Stok</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topProducts.map((product) => {
                const status = productStatusConfig[product.status];
                return (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover bg-slate-100" />
                        <div>
                          <p className="text-slate-800 text-sm font-semibold">{product.name}</p>
                          <p className="text-slate-400 text-xs">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 text-sm">{product.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-900 text-sm font-semibold">₺{product.price.toLocaleString("tr-TR")}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-600" : product.stock < 30 ? "text-amber-600" : "text-slate-700"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <Clock size={12} />
        <span>Son güncelleme: {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}

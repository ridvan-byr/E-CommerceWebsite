import { ShoppingCart, Shield, Zap, BarChart3 } from "lucide-react";

const featureItems = [
  { icon: BarChart3, title: "Detaylı Analitikler", desc: "Gerçek zamanlı satış raporları" },
  { icon: Shield, title: "Güvenli Altyapı", desc: "Verileriniz şifreli ve güvende" },
  { icon: Zap, title: "Hızlı Yönetim", desc: "Saniyeler içinde ürün işlemleri" },
] as const;

const statItems = [
  { value: "703+", label: "Ürün" },
  { value: "1.8K+", label: "Sipariş" },
  { value: "₺284K", label: "Gelir" },
] as const;

export default function LoginBrandingAside() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <ShoppingCart size={20} className="text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-tight">E-Ticaret</span>
          <span className="block text-indigo-300/80 text-[11px] font-medium tracking-wide uppercase">
            Yönetim Paneli
          </span>
        </div>
      </div>

      <div className="relative space-y-10">
        <div className="space-y-4">
          <h2 className="text-white text-[2.75rem] font-extrabold leading-[1.1] tracking-tight">
            İşletmenizi
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              kolayca yönetin
            </span>
          </h2>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm">
            Ürünlerinizi, kategorilerinizi ve siparişlerinizi tek bir yerden profesyonelce yönetin.
            Hızlı, güvenli ve kullanıcı dostu.
          </p>
        </div>

        <div className="space-y-3 max-w-sm">
          {featureItems.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">{title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex items-center gap-10">
        {statItems.map(({ value, label }) => (
          <div key={label}>
            <p className="text-white text-xl font-bold tracking-tight">{value}</p>
            <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

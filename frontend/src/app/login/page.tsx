"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.3)_0%,_transparent_60%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.2)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOHY2YzYuNjMgMCAxMiA1LjM3IDEyIDEyaC02em0tNiAwaC02YzAtMy4zMS0yLjY5LTYtNi02di02YzkuOTQgMCAxOCA4LjA2IDE4IDE4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <ShoppingCart size={22} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-xl tracking-tight">ShopAdmin</span>
            <div className="flex items-center gap-1">
              <Sparkles size={10} className="text-indigo-400" />
              <span className="text-indigo-400 text-xs">E-Ticaret Yönetim Paneli</span>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-4">
              İşletmenizi<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                kolayca yönetin
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              Ürünlerinizi, kategorilerinizi ve siparişlerinizi tek bir yerden
              profesyonelce yönetin. Hızlı, güvenli ve kullanıcı dostu.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-md">
            {[
              { icon: BarChart3, title: "Detaylı Analitikler", desc: "Gerçek zamanlı satış ve performans raporları" },
              { icon: Shield, title: "Güvenli Altyapı", desc: "Verileriniz şifreli ve güvende" },
              { icon: Zap, title: "Hızlı Yönetim", desc: "Ürün ve kategori işlemlerini saniyeler içinde" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative flex items-center gap-8">
          {[
            { value: "703+", label: "Ürün" },
            { value: "1.8K+", label: "Sipariş" },
            { value: "₺284K", label: "Gelir" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-white text-2xl font-bold">{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <span className="text-slate-900 font-bold text-xl">ShopAdmin</span>
          </div>

          <div className="mb-8">
            <h1 className="text-slate-900 text-3xl font-bold mb-2">Tekrar Hoş Geldiniz</h1>
            <p className="text-slate-500 text-sm">Yönetim paneline erişmek için giriş yapın.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">E-posta Adresi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-700 text-sm font-medium">Şifre</label>
                <button type="button" className="text-indigo-600 text-xs font-medium hover:text-indigo-700 transition-colors">
                  Şifremi Unuttum
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-slate-600 text-sm cursor-pointer">
                Beni hatırla
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-8">
            Demo: Herhangi bir e-posta ve şifre ile giriş yapabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

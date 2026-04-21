"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Lock,
} from "lucide-react";
import { FirebaseError } from "firebase/app";
import { loginWithFirebase, loginWithGoogle } from "@/lib/api/authApi";
import { ApiRequestError, setStoredAccessToken } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const translateFirebaseError = (code: string): string => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "E-posta veya şifre hatalı.";
      case "auth/invalid-email":
        return "Geçersiz e-posta adresi.";
      case "auth/user-disabled":
        return "Bu hesap devre dışı bırakılmış.";
      case "auth/too-many-requests":
        return "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.";
      case "auth/network-request-failed":
        return "Ağ hatası. Bağlantınızı kontrol edin.";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Giriş penceresi kapatıldı.";
      default:
        return "Giriş yapılamadı. Lütfen tekrar deneyin.";
    }
  };

  const handleAuthError = (err: unknown) => {
    if (err instanceof FirebaseError) {
      setError(translateFirebaseError(err.code));
      return;
    }
    if (err instanceof ApiRequestError) {
      const msg =
        typeof err.body === "object" &&
        err.body !== null &&
        "message" in err.body &&
        typeof (err.body as { message: unknown }).message === "string"
          ? (err.body as { message: string }).message
          : err.message;
      setError(msg);
      return;
    }
    setError("Giriş yapılamadı. Bağlantınızı kontrol edin.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithFirebase(email.trim(), password);
      setStoredAccessToken(result.accessToken);
      router.push("/dashboard");
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      setStoredAccessToken(result.accessToken);
      router.push("/dashboard");
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />

        {/* Logo */}
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

        {/* Center Content */}
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
              Ürünlerinizi, kategorilerinizi ve siparişlerinizi tek bir yerden
              profesyonelce yönetin. Hızlı, güvenli ve kullanıcı dostu.
            </p>
          </div>

          <div className="space-y-3 max-w-sm">
            {[
              {
                icon: BarChart3,
                title: "Detaylı Analitikler",
                desc: "Gerçek zamanlı satış raporları",
              },
              {
                icon: Shield,
                title: "Güvenli Altyapı",
                desc: "Verileriniz şifreli ve güvende",
              },
              {
                icon: Zap,
                title: "Hızlı Yönetim",
                desc: "Saniyeler içinde ürün işlemleri",
              },
            ].map(({ icon: Icon, title, desc }) => (
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

        {/* Bottom stats */}
        <div className="relative flex items-center gap-10">
          {[
            { value: "703+", label: "Ürün" },
            { value: "1.8K+", label: "Sipariş" },
            { value: "₺284K", label: "Gelir" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-white text-xl font-bold tracking-tight">{value}</p>
              <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <span className="text-slate-900 font-bold text-lg">E-Ticaret</span>
          </div>

          <div className="mb-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
              <Lock size={22} className="text-slate-600" />
            </div>
            <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
              Tekrar hoş geldiniz
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Yönetim paneline erişmek için giriş yapın.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
                <p className="text-red-700 text-sm leading-snug">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">
                E-posta adresi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                autoComplete="email"
                disabled={loading}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 text-sm font-medium">Şifre</label>
                <Link
                  href="/forgot-password"
                  className="text-indigo-600 text-xs font-medium hover:text-indigo-700 transition-colors"
                >
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full h-11 px-3.5 pr-11 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Giriş yap
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 uppercase tracking-wider">veya</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-60 text-slate-700 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-3 border border-slate-200 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.5 2.1-7.1 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.9l6.1 5c-.4.4 6.5-4.7 6.5-14.9 0-1.2-.1-2.3-.3-3.5z" />
            </svg>
            Google ile giriş yap
          </button>

          <p className="text-center text-sm text-slate-500 mt-8">
            Hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Kayıt olun
            </Link>
          </p>

          <p className="text-center text-slate-400 text-xs mt-6">
            &copy; {new Date().getFullYear()} E-Ticaret Yönetim Paneli
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ShoppingCart, Eye, EyeOff, ArrowRight, Lock } from "lucide-react";
import type { LoginPageViewModel } from "./useLoginPage";

export type LoginFormPanelProps = {
  vm: LoginPageViewModel;
};

export default function LoginFormPanel({ vm }: LoginFormPanelProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    emailLoading,
    googleLoading,
    error,
    unverifiedEmail,
    resendLoading,
    resendSent,
    handleLogin,
    handleGoogleLogin,
    handleResendVerification,
  } = vm;

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
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
          <h1 className="text-slate-900 text-2xl font-bold tracking-tight">Tekrar hoş geldiniz</h1>
          <p className="text-slate-500 text-sm mt-1.5">Yönetim paneline erişmek için giriş yapın.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
              <p className="text-red-700 text-sm leading-snug">{error}</p>
            </div>
          )}

          {unverifiedEmail && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0 mt-1.5" />
                <div>
                  <p className="text-amber-800 text-sm font-medium leading-snug">
                    E-posta adresiniz henüz doğrulanmamış.
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    <span className="font-medium">{unverifiedEmail}</span> adresine gönderilen bağlantıya
                    tıklayın.
                  </p>
                </div>
              </div>
              {resendSent ? (
                <p className="text-emerald-700 text-xs font-medium pl-4">
                  ✓ Doğrulama bağlantısı yeniden gönderildi.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="ml-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {resendLoading ? "Gönderiliyor…" : "Doğrulama e-postasını yeniden gönder"}
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">E-posta adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              autoComplete="email"
              disabled={emailLoading}
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
                disabled={emailLoading}
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
            disabled={emailLoading}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {emailLoading ? (
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
          disabled={googleLoading || emailLoading}
          className="w-full h-11 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-60 text-slate-700 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-3 border border-slate-200 shadow-sm"
        >
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.5 2.1-7.1 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.9l6.1 5c-.4.4 6.5-4.7 6.5-14.9 0-1.2-.1-2.3-.3-3.5z"
              />
            </svg>
          )}
          {googleLoading ? "Giriş yapılıyor…" : "Google ile giriş yap"}
        </button>

        <p className="text-center text-slate-500 text-xs mt-4 leading-relaxed px-1">
          Google ile kayıt olduysanız, önce Google ile giriş yapın; sağ üstteki{" "}
          <span className="font-medium text-slate-600">ayarlar</span> simgesinden{" "}
          <span className="font-medium text-slate-600">Hesap ayarları</span>na gidip şifre oluşturduktan sonra
          aynı e-posta ve şifre ile bu formdan da giriş yapabilirsiniz.
        </p>

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
  );
}

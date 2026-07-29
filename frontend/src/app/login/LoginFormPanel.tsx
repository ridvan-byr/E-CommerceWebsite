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
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-12 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">E-Ticaret</span>
        </div>

        <div className="mb-10">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Lock size={22} className="text-slate-600 dark:text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tekrar hoş geldiniz
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Yönetim paneline erişmek için giriş yapın.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 dark:border-red-900/60 dark:bg-red-950/50">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              <p className="text-sm leading-snug text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {unverifiedEmail && (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0 mt-1.5" />
                <div>
                  <p className="text-sm font-medium leading-snug text-amber-800 dark:text-amber-200">
                    E-posta adresiniz henüz doğrulanmamış.
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300/90">
                    <span className="font-medium">{unverifiedEmail}</span> adresine gönderilen bağlantıya
                    tıklayın.
                  </p>
                </div>
              </div>
              {resendSent ? (
                <p className="pl-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  ✓ Doğrulama bağlantısı yeniden gönderildi.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="ml-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 underline underline-offset-2 transition-colors hover:text-indigo-700 disabled:opacity-50 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {resendLoading ? "Gönderiliyor…" : "Doğrulama e-postasını yeniden gönder"}
                </button>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              E-posta adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              autoComplete="email"
              disabled={emailLoading}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Şifre</label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
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
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 dark:bg-slate-950">
              veya
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || emailLoading}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-800/90"
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

        <p className="mt-4 px-1 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Google ile kayıt olduysanız, önce Google ile giriş yapın; sağ üstteki{" "}
          <span className="font-medium text-slate-600 dark:text-slate-300">ayarlar</span> simgesinden{" "}
          <span className="font-medium text-slate-600 dark:text-slate-300">Hesap ayarları</span>na gidip şifre oluşturduktan sonra
          aynı e-posta ve şifre ile bu formdan da giriş yapabilirsiniz.
        </p>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Hesabınız yok mu?{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Kayıt olun
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} E-Ticaret Yönetim Paneli
        </p>
      </div>
    </div>
  );
}

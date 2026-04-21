"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ArrowRight,
  ShoppingCart,
  Mail,
} from "lucide-react";
import { verifyEmail, resendVerificationEmail } from "@/lib/api/authApi";
import type { VerifyEmailResult } from "@/lib/api/authApi";

type PageState = "checking" | VerifyEmailResult;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const emailParam = searchParams.get("email") ?? "";

  const [state, setState] = useState<PageState>("checking");
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    let cancelled = false;
    verifyEmail(token).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => { cancelled = true; };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim() || resendLoading) return;
    setResendLoading(true);
    try {
      await resendVerificationEmail(resendEmail.trim());
      setResendSent(true);
    } catch {
      // Güvenli yanıt; sessizce geç
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sol Panel */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center transition-all duration-500 ${
          state === "success" || state === "already_verified"
            ? "bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900"
            : state === "expired"
              ? "bg-gradient-to-br from-amber-900 via-orange-900 to-slate-900"
              : state === "invalid"
                ? "bg-gradient-to-br from-red-900 via-rose-900 to-slate-900"
                : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        }`}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-white" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-10 bg-white" />

        <div className="relative text-center space-y-6 px-12">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transition-all duration-500 ${
              state === "success" || state === "already_verified"
                ? "bg-gradient-to-br from-emerald-400 to-teal-600"
                : state === "expired"
                  ? "bg-gradient-to-br from-amber-400 to-orange-600"
                  : state === "invalid"
                    ? "bg-gradient-to-br from-red-400 to-rose-600"
                    : "bg-gradient-to-br from-indigo-500 to-violet-600"
            }`}
          >
            {state === "checking" && <Loader2 size={36} className="text-white animate-spin" />}
            {(state === "success" || state === "already_verified") && <CheckCircle2 size={36} className="text-white" />}
            {state === "expired" && <Clock size={36} className="text-white" />}
            {state === "invalid" && <AlertTriangle size={36} className="text-white" />}
          </div>

          <div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight">
              {state === "checking" && "Doğrulanıyor…"}
              {state === "success" && "Hoş geldiniz!"}
              {state === "already_verified" && "Zaten doğrulandı"}
              {state === "expired" && "Bağlantı süresi doldu"}
              {state === "invalid" && "Geçersiz bağlantı"}
            </h2>
            <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-sm mx-auto">
              {state === "checking" && "E-posta doğrulamanız işleniyor, lütfen bekleyin."}
              {state === "success" && "E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz."}
              {state === "already_verified" && "Bu e-posta adresi zaten daha önce doğrulanmış."}
              {state === "expired" && "Doğrulama bağlantısı 24 saatlik süresini aştı. Yeni bir bağlantı talep edin."}
              {state === "invalid" && "Bu bağlantı geçersiz veya daha önce kullanılmış."}
            </p>
          </div>
        </div>
      </div>

      {/* Sağ Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobil logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <span className="text-slate-900 font-bold text-lg">E-Ticaret</span>
          </div>

          {/* ─── Yükleniyor ─── */}
          {state === "checking" && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={40} className="text-indigo-500 animate-spin" />
              <p className="text-slate-500 text-sm">E-posta adresiniz doğrulanıyor…</p>
            </div>
          )}

          {/* ─── Başarı ─── */}
          {(state === "success" || state === "already_verified") && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={30} className="text-emerald-500" />
              </div>
              <div>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                  {state === "success" ? "E-posta doğrulandı!" : "Zaten doğrulanmış"}
                </h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  {state === "success"
                    ? "Hesabınız aktif hale getirildi. Giriş yaparak panele erişebilirsiniz."
                    : "Bu e-posta adresi zaten doğrulanmış. Giriş yapabilirsiniz."}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 text-sm leading-snug">
                  Artık e-posta ve şifrenizle veya Google hesabınızla giriş yapabilirsiniz.
                </p>
              </div>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Giriş yap
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {/* ─── Süresi Dolmuş ─── */}
          {state === "expired" && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Clock size={30} className="text-amber-500" />
              </div>
              <div>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                  Bağlantının süresi doldu
                </h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Doğrulama bağlantıları güvenlik amacıyla yalnızca{" "}
                  <span className="font-semibold text-slate-700">24 saat</span> geçerlidir.
                  E-posta adresinizi girerek yeni bir bağlantı talep edin.
                </p>
              </div>

              {resendSent ? (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-emerald-700 text-sm font-medium">
                    Yeni doğrulama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">
                      E-posta adresiniz
                    </label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      autoComplete="email"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading || !resendEmail.trim()}
                    className="flex items-center justify-center gap-2 w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    {resendLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <RefreshCw size={15} />
                        Yeni bağlantı gönder
                      </>
                    )}
                  </button>
                </form>
              )}

              <Link
                href="/login"
                className="block text-center text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Giriş sayfasına dön
              </Link>
            </div>
          )}

          {/* ─── Geçersiz ─── */}
          {state === "invalid" && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={30} className="text-red-500" />
              </div>
              <div>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                  Geçersiz bağlantı
                </h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Bu doğrulama bağlantısı geçersiz veya daha önce kullanılmış.
                  Yeni kayıt yaptıysanız gelen kutunuzu kontrol edin.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Giriş yap
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full h-11 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <Mail size={15} />
                  Yeni hesap oluştur
                </Link>
              </div>
            </div>
          )}

          <p className="text-center text-slate-400 text-xs mt-10">
            &copy; {new Date().getFullYear()} E-Ticaret Yönetim Paneli
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={28} className="text-slate-400 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

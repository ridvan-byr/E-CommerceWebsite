"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "@/lib/api/authApi";
import { ApiRequestError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Lütfen e-posta adresinizi girin.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const msg =
          typeof err.body === "object" &&
          err.body !== null &&
          "message" in err.body &&
          typeof (err.body as { message: unknown }).message === "string"
            ? (err.body as { message: string }).message
            : err.message;
        setError(msg);
      } else {
        setError("Bir hata oluştu. Bağlantınızı kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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

        <div className="relative text-center space-y-6 px-12">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Mail size={28} className="text-white" />
          </div>
          <h2 className="text-white text-3xl font-extrabold tracking-tight">
            Şifrenizi mi unuttunuz?
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Endişelenmeyin, kayıtlı e-posta adresinizi girin. Size şifre
            sıfırlama bağlantısı göndereceğiz.
          </p>
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

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Giriş sayfasına dön
          </Link>

          {!sent ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                  <Mail size={22} className="text-indigo-600" />
                </div>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                  Şifremi unuttum
                </h1>
                <p className="text-slate-500 text-sm mt-1.5">
                  E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Sıfırlama bağlantısı gönder"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                  Bağlantı gönderildi
                </h1>
                <p className="text-slate-500 text-sm mt-1.5">
                  E-posta adresiniz kayıtlıysa{" "}
                  <span className="font-medium text-slate-700">{email}</span> adresine
                  şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu ve spam klasörünü
                  kontrol edin.
                </p>
                <p className="text-slate-400 text-xs mt-3">
                  Bağlantı güvenlik nedeniyle 1 saat geçerlidir.
                </p>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <ArrowLeft size={14} />
                Giriş sayfasına dön
              </Link>
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

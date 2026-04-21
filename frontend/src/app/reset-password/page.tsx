"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { resetPassword, validateResetToken } from "@/lib/api/authApi";
import { ApiRequestError } from "@/lib/api/client";

type PageState = "checking" | "valid" | "expired" | "invalid" | "success";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [pageState, setPageState] = useState<PageState>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sayfa açılışında token geçerliliğini kontrol et
  useEffect(() => {
    if (!token) {
      setPageState("invalid");
      return;
    }
    let cancelled = false;
    validateResetToken(token).then((status) => {
      if (cancelled) return;
      setPageState(status === "valid" ? "valid" : status === "expired" ? "expired" : "invalid");
    });
    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setPageState("success");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const msg =
          typeof err.body === "object" &&
          err.body !== null &&
          "message" in err.body &&
          typeof (err.body as { message: unknown }).message === "string"
            ? (err.body as { message: string }).message
            : err.message;
        // Token submit esnasında expire olmuş olabilir
        if (msg.toLowerCase().includes("süresi") || msg.toLowerCase().includes("expired")) {
          setPageState("expired");
        } else {
          setError(msg);
        }
      } else {
        setError("Bir hata oluştu. Bağlantınızı kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sol Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative text-center space-y-6 px-12">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-all duration-500 ${
              pageState === "expired"
                ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
                : pageState === "invalid"
                  ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30"
                  : pageState === "success"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
                    : "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30"
            }`}
          >
            {pageState === "expired" ? (
              <Clock size={28} className="text-white" />
            ) : pageState === "invalid" ? (
              <AlertTriangle size={28} className="text-white" />
            ) : pageState === "success" ? (
              <CheckCircle2 size={28} className="text-white" />
            ) : (
              <KeyRound size={28} className="text-white" />
            )}
          </div>
          <h2 className="text-white text-3xl font-extrabold tracking-tight">
            {pageState === "expired"
              ? "Bağlantı süresi doldu"
              : pageState === "invalid"
                ? "Geçersiz bağlantı"
                : pageState === "success"
                  ? "Şifre güncellendi!"
                  : "Yeni şifre belirleyin"}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            {pageState === "expired"
              ? "Şifre sıfırlama bağlantıları güvenlik amacıyla 1 saat geçerlidir. Yeni bir bağlantı talep edebilirsiniz."
              : pageState === "invalid"
                ? "Bu bağlantı geçersiz veya daha önce kullanılmış. Yeni bir sıfırlama bağlantısı talep edin."
                : pageState === "success"
                  ? "Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz."
                  : "Güçlü bir şifre seçin. En az 6 karakter uzunluğunda olmalıdır."}
          </p>
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

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Giriş sayfasına dön
          </Link>

          {/* ─── Yükleniyor ─── */}
          {pageState === "checking" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 size={36} className="text-indigo-500 animate-spin" />
              <p className="text-slate-500 text-sm">Bağlantı doğrulanıyor…</p>
            </div>
          )}

          {/* ─── Süresi Dolmuş ─── */}
          {pageState === "expired" && (
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Clock size={26} className="text-amber-500" />
              </div>

              <div>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                  Bağlantının süresi doldu
                </h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Bu şifre sıfırlama bağlantısı artık geçerli değil. Güvenliğiniz için
                  bağlantılar yalnızca{" "}
                  <span className="font-semibold text-slate-700">1 saat</span> geçerlidir.
                </p>
              </div>

              {/* Timeline */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock size={12} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-slate-700 text-sm font-semibold">Süre doldu</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Gönderilen bağlantı 1 saatlik kullanım süresi geçti.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RefreshCw size={12} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-slate-700 text-sm font-semibold">Ne yapmalıyım?</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Aşağıdaki düğmeye tıklayarak yeni bir sıfırlama bağlantısı talep edin.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/forgot-password"
                className="flex items-center justify-center gap-2 w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                <RefreshCw size={15} />
                Yeni bağlantı talep et
              </Link>
            </div>
          )}

          {/* ─── Geçersiz Token ─── */}
          {pageState === "invalid" && (
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={26} className="text-red-500" />
              </div>
              <div>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                  Geçersiz bağlantı
                </h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Bu bağlantı geçersiz ya da daha önce kullanılmış. Şifrenizi sıfırlamak için
                  yeni bir bağlantı talep edebilirsiniz.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="flex items-center justify-center gap-2 w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                <RefreshCw size={15} />
                Yeni bağlantı talep et
              </Link>
            </div>
          )}

          {/* ─── Form ─── */}
          {pageState === "valid" && (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                  <KeyRound size={22} className="text-indigo-600" />
                </div>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                  Yeni şifre oluşturun
                </h1>
                <p className="text-slate-500 text-sm mt-1.5">
                  Hesabınız için yeni bir şifre belirleyin.
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
                    Yeni şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
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

                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">
                    Şifre tekrar
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
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
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Şifreyi güncelle"
                  )}
                </button>
              </form>
            </>
          )}

          {/* ─── Başarı ─── */}
          {pageState === "success" && (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                  Şifreniz güncellendi
                </h1>
                <p className="text-slate-500 text-sm mt-1.5">
                  Yeni şifrenizle giriş yapabilirsiniz.
                </p>
              </div>

              <button
                onClick={() => router.push("/login")}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Giriş yap
              </button>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={28} className="text-slate-400 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

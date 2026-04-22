"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  Shield,
  Zap,
  BarChart3,
  Mail,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { FirebaseError } from "firebase/app";
import { loginWithGoogle, register, resendVerificationEmail } from "@/lib/api/authApi";
import { ApiRequestError, setStoredUserProfile } from "@/lib/api/client";
import { isPasswordCompliant, PASSWORD_POLICY_MESSAGE } from "@/lib/passwordPolicy";
import KvkkModal from "@/components/KvkkModal";

export default function RegisterPage() {
  const router = useRouter();
  const mountedRef = useRef(true);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [kvkkOpen, setKvkkOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [unverifiedResendSent, setUnverifiedResendSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const resetLoading = () => {
      setLoading(false);
      setGoogleLoading(false);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") resetLoading();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) resetLoading();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const translateFirebaseError = (code: string): string => {
    switch (code) {
      case "auth/email-already-in-use":
        return "Bu e-posta adresi zaten kayıtlı.";
      case "auth/invalid-email":
        return "Geçersiz e-posta adresi.";
      case "auth/weak-password":
        return `${PASSWORD_POLICY_MESSAGE} (Firebase kuralları da geçerlidir.)`;
      case "auth/operation-not-allowed":
        return "E-posta/şifre ile kayıt şu anda devre dışı.";
      case "auth/network-request-failed":
        return "Ağ hatası. Bağlantınızı kontrol edin.";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Google penceresi kapatıldı.";
      case "auth/account-exists-with-different-credential":
        return "Bu e-posta farklı bir giriş yöntemiyle kayıtlı. Giriş sayfasını deneyin.";
      default:
        return "Kayıt oluşturulamadı. Lütfen tekrar deneyin.";
    }
  };

  const handleRegisterAuthError = (err: unknown) => {
    if (err instanceof FirebaseError) {
      setError(translateFirebaseError(err.code));
      return;
    }
    if (err instanceof ApiRequestError) {
      const body = err.body as Record<string, unknown> | null;
      if (
        err.status === 403 &&
        typeof body === "object" &&
        body !== null &&
        (body as Record<string, unknown>).errorCode === "EMAIL_NOT_VERIFIED"
      ) {
        const u =
          typeof (body as Record<string, unknown>).email === "string"
            ? (body as Record<string, string>).email
            : undefined;
        setUnverifiedEmail(u ?? null);
        return;
      }
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
    setError("İşlem tamamlanamadı. Bağlantınızı kontrol edin.");
  };

  const handleResendUnverified = async () => {
    if (!unverifiedEmail || resendLoading) return;
    setResendLoading(true);
    setUnverifiedResendSent(false);
    try {
      await resendVerificationEmail(unverifiedEmail);
      setUnverifiedResendSent(true);
    } catch {
      /* */
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setUnverifiedEmail(null);
    setUnverifiedResendSent(false);
    if (!kvkkAccepted) {
      setError("Google ile devam etmek için KVKK Aydınlatma Metni'ni kabul etmeniz gerekiyor.");
      return;
    }
    setGoogleLoading(true);
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current) setGoogleLoading(false);
    }, 90_000);
    try {
      const result = await loginWithGoogle();
      setStoredUserProfile(result.user);
      router.push("/dashboard");
    } catch (err) {
      if (mountedRef.current) handleRegisterAuthError(err);
    } finally {
      clearTimeout(safetyTimer);
      if (mountedRef.current) setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);

    if (!name.trim() || !surname.trim() || !email.trim() || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    if (!isPasswordCompliant(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (!kvkkAccepted) {
      setError("Devam etmek için KVKK Aydınlatma Metni'ni kabul etmeniz gerekiyor.");
      return;
    }

    setLoading(true);
    try {
      const result = await register(name.trim(), surname.trim(), email.trim(), password);
      setRegisteredEmail(result.email);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(translateFirebaseError(err.code));
      } else if (err instanceof ApiRequestError) {
        const msg =
          typeof err.body === "object" &&
          err.body !== null &&
          "message" in err.body &&
          typeof (err.body as { message: unknown }).message === "string"
            ? (err.body as { message: string }).message
            : err.message;
        setError(msg);
      } else {
        setError("Kayıt olunamadı. Bağlantınızı kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail || resendLoading) return;
    setResendLoading(true);
    setResendSent(false);
    try {
      await resendVerificationEmail(registeredEmail);
      setResendSent(true);
    } catch {
      // Sessizce geç (her koşulda güvenli yanıt döner)
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <KvkkModal open={kvkkOpen} onClose={() => setKvkkOpen(false)} />

      <div className="min-h-screen flex bg-white">
        {/* Sol Panel */}
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
                Hemen
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
                  başlayın
                </span>
              </h2>
              <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm">
                Hesabınızı oluşturun ve e-ticaret yönetim paneline hemen erişim sağlayın.
              </p>
            </div>

            <div className="space-y-3 max-w-sm">
              {[
                { icon: BarChart3, title: "Detaylı Analitikler", desc: "Gerçek zamanlı satış raporları" },
                { icon: Shield, title: "Güvenli Altyapı", desc: "Verileriniz şifreli ve güvende" },
                { icon: Zap, title: "Hızlı Yönetim", desc: "Saniyeler içinde ürün işlemleri" },
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

          <div className="relative flex items-center gap-10">
            {[
              { value: "703+", label: "Ürün" },
              { value: "1.8K+", label: "Sipariş" },
              { value: "₺284K", label: "Gelir" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white text-xl font-bold tracking-tight">{value}</p>
                <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
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

            {/* ─── E-posta doğrulama bekleniyor ─── */}
            {registeredEmail ? (
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Mail size={26} className="text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                    E-postanızı doğrulayın
                  </h1>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    <span className="font-medium text-slate-700">{registeredEmail}</span> adresine
                    doğrulama bağlantısı gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    Bağlantı <strong>24 saat</strong> geçerlidir.
                  </p>
                </div>

                {/* Adımlar */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                  {[
                    { step: "1", text: "Gelen kutunuzu açın" },
                    { step: "2", text: "\"E-Posta Adresimi Doğrula\" düğmesine tıklayın" },
                    { step: "3", text: "Hesabınıza giriş yapın" },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {step}
                      </span>
                      <span className="text-slate-600 text-sm">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Yeniden gönder */}
                {resendSent ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <CheckCircle2 size={16} />
                    Doğrulama bağlantısı yeniden gönderildi.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {resendLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    E-posta gelmedi mi? Yeniden gönder
                  </button>
                )}

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Giriş sayfasına git
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              /* ─── Kayıt Formu ─── */
              <>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                    <UserPlus size={22} className="text-indigo-600" />
                  </div>
                  <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                    Hesap oluşturun
                  </h1>
                  <p className="text-slate-500 text-sm mt-1.5">
                    Bilgilerinizi girerek yeni bir hesap açın.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            <span className="font-medium">{unverifiedEmail}</span> adresine gönderilen
                            bağlantıya tıklayın.
                          </p>
                        </div>
                      </div>
                      {unverifiedResendSent ? (
                        <p className="text-emerald-700 text-xs font-medium pl-4">
                          ✓ Doğrulama bağlantısı yeniden gönderildi.
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendUnverified}
                          disabled={resendLoading}
                          className="ml-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {resendLoading ? "Gönderiliyor…" : "Doğrulama e-postasını yeniden gönder"}
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleGoogleRegister()}
                    disabled={googleLoading || loading}
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
                    {googleLoading ? "Yönlendiriliyor…" : "Google ile kayıt ol"}
                  </button>

                  <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-slate-400 uppercase tracking-wider">veya e-posta ile</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">Ad</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Adınız"
                        autoComplete="given-name"
                        disabled={loading || googleLoading}
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">Soyad</label>
                      <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="Soyadınız"
                        autoComplete="family-name"
                        disabled={loading || googleLoading}
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

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
                      disabled={loading || googleLoading}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Şifre</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="örn. Guvenli1!x"
                        autoComplete="new-password"
                        disabled={loading || googleLoading}
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
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{PASSWORD_POLICY_MESSAGE}</p>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">
                      Şifre tekrar
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Şifrenizi tekrar girin"
                      autoComplete="new-password"
                      disabled={loading || googleLoading}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                    />
                  </div>

                  {/* KVKK Onay Kutusu */}
                  <div className={`rounded-xl border p-3.5 transition-colors ${kvkkAccepted ? "border-indigo-200 bg-indigo-50/50" : "border-slate-200 bg-slate-50/50"}`}>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={kvkkAccepted}
                          onChange={(e) => setKvkkAccepted(e.target.checked)}
                          disabled={loading || googleLoading}
                          className="sr-only"
                        />
                        <div
                          className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all ${
                            kvkkAccepted
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white border-slate-300"
                          }`}
                          style={{ width: 18, height: 18, borderRadius: 5 }}
                        >
                          {kvkkAccepted && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-slate-600 text-sm leading-snug">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setKvkkOpen(true); }}
                          className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
                        >
                          KVKK Aydınlatma Metni
                          <ExternalLink size={11} className="mb-0.5" />
                        </button>
                        {"'ni okudum ve kişisel verilerimin işlenmesine onay veriyorum."}
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || googleLoading || !kvkkAccepted}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Kayıt ol
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-8">
                  Zaten hesabınız var mı?{" "}
                  <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Giriş yapın
                  </Link>
                </p>
              </>
            )}

            <p className="text-center text-slate-400 text-xs mt-8">
              &copy; {new Date().getFullYear()} E-Ticaret Yönetim Paneli
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

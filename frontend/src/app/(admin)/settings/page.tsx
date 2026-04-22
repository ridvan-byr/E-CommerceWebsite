"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import {
  Shield,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { auth as firebaseAuth } from "@/lib/firebase";
import {
  changeFirebasePasswordAndSyncBackend,
  firebaseUserHasEmailPasswordProvider,
  firebaseUserHasGoogleProvider,
  linkEmailPasswordAndSyncBackend,
} from "@/lib/api/authApi";
import { ApiRequestError } from "@/lib/api/client";
import { isPasswordCompliant, PASSWORD_POLICY_MESSAGE } from "@/lib/passwordPolicy";
import { useCurrentUser, displayName } from "@/lib/currentUser";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";

function translateFirebaseError(code: string): string {
  switch (code) {
    case "auth/weak-password":
      return `${PASSWORD_POLICY_MESSAGE} (Firebase de geçerli kurala uymalıdır.)`;
    case "auth/requires-recent-login":
      return "Güvenlik nedeniyle oturumun yenilenmesi gerekiyor. Çıkış yapıp tekrar giriş yapın.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Mevcut şifre hatalı.";
    case "auth/credential-already-in-use":
      return "Bu kimlik bilgisi başka bir hesaba bağlı.";
    case "auth/network-request-failed":
      return "Ağ hatası. Bağlantınızı kontrol edin.";
    default:
      return "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
  }
}

export default function SettingsPage() {
  const { profile, loading: profileLoading } = useCurrentUser();
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);

  const [setPw, setSetPw] = useState("");
  const [setPw2, setSetPw2] = useState("");
  const [setShow, setSetShow] = useState(false);
  const [setSubmitting, setSetSubmitting] = useState(false);
  const [setError, setSetError] = useState("");

  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [chgShow, setChgShow] = useState(false);
  const [chgSubmitting, setChgSubmitting] = useState(false);
  const [chgError, setChgError] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 8000);
    return () => window.clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      setFirebaseReady(!!u);
      setHasPassword(firebaseUserHasEmailPasswordProvider());
      setHasGoogle(firebaseUserHasGoogleProvider());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      if (window.location.hash === "#guvenlik") {
        document.getElementById("guvenlik")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    return () => window.clearTimeout(id);
  }, []);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetError("");
    if (!isPasswordCompliant(setPw)) {
      setSetError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    if (setPw !== setPw2) {
      setSetError("Şifreler eşleşmiyor.");
      return;
    }
    if (!firebaseAuth.currentUser?.email) {
      setSetError("Firebase oturumu yok. Çıkış yapıp tekrar giriş yapın.");
      return;
    }
    setSetSubmitting(true);
    try {
      await linkEmailPasswordAndSyncBackend(setPw);
      setNotice("E-posta ile giriş şifreniz oluşturuldu. Aşağıdan isterseniz değiştirebilirsiniz.");
      setHasPassword(true);
      setSetPw("");
      setSetPw2("");
    } catch (err) {
      if (err instanceof FirebaseError) setSetError(translateFirebaseError(err.code));
      else if (err instanceof ApiRequestError) {
        const msg =
          typeof err.body === "object" &&
          err.body !== null &&
          "message" in err.body &&
          typeof (err.body as { message: unknown }).message === "string"
            ? (err.body as { message: string }).message
            : err.message;
        setSetError(msg);
      } else setSetError(err instanceof Error ? err.message : "Beklenmeyen hata.");
    } finally {
      setSetSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChgError("");
    if (!isPasswordCompliant(newPw)) {
      setChgError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    if (newPw !== newPw2) {
      setChgError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (!firebaseAuth.currentUser?.email) {
      setChgError("Firebase oturumu yok.");
      return;
    }
    setChgSubmitting(true);
    try {
      await changeFirebasePasswordAndSyncBackend(curPw, newPw);
      setNotice("Şifreniz güncellendi.");
      setCurPw("");
      setNewPw("");
      setNewPw2("");
    } catch (err) {
      if (err instanceof FirebaseError) setChgError(translateFirebaseError(err.code));
      else if (err instanceof ApiRequestError) {
        const msg =
          typeof err.body === "object" &&
          err.body !== null &&
          "message" in err.body &&
          typeof (err.body as { message: unknown }).message === "string"
            ? (err.body as { message: string }).message
            : err.message;
        setChgError(msg);
      } else setChgError(err instanceof Error ? err.message : "Beklenmeyen hata.");
    } finally {
      setChgSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profil */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Shield className="text-slate-600" size={20} />
          </div>
          <div>
            <h2 className="text-slate-900 font-semibold text-lg">Profil</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Oturum bilgileriniz ve hesaba bağlı giriş yöntemleri.
            </p>
          </div>
        </div>

        {profileLoading ? (
          <p className="text-slate-500 text-sm">Yükleniyor…</p>
        ) : profile ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <UserAvatar profile={profile} size={72} className="text-xl shadow-md" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-slate-900 font-semibold text-lg truncate">{displayName(profile)}</p>
              <p className="text-slate-600 text-sm truncate">{profile.email}</p>
              <p className="text-slate-400 text-xs uppercase tracking-wide">Rol: {profile.role}</p>
              <div className="flex flex-wrap gap-2 pt-3">
                {hasGoogle && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80">
                    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden>
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
                    Google
                  </span>
                )}
                {hasPassword && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-medium border border-indigo-100">
                    <Mail size={14} aria-hidden />
                    E-posta ile şifre
                  </span>
                )}
                {!firebaseReady && (
                  <span className="text-amber-700 text-xs font-medium bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                    Firebase oturumu algılanmadı — çıkış yapıp yeniden giriş yapın
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Profil yüklenemedi.</p>
        )}
      </section>

      {/* Güvenlik */}
      <section
        id="guvenlik"
        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm scroll-mt-24"
      >
        <div className="flex items-start gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <KeyRound className="text-indigo-600" size={20} />
          </div>
          <div>
            <h2 className="text-slate-900 font-semibold text-lg">Güvenlik ve şifre</h2>
            <p className="text-slate-500 text-sm mt-0.5 max-w-xl">
              Giriş sayfasındaki e-posta ve şifre alanı Firebase ile çalışır. Google ile kayıt olduysanız
              önce burada bir şifre tanımlayın; böylece aynı e-posta ile formdan da giriş yapabilirsiniz.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {notice && (
            <div className="flex gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-sm">
              <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-600 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {/* Google / yalnızca OAuth: şifre tanımla */}
          {!hasPassword ? (
            <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5 sm:p-6">
              <h3 className="text-slate-900 font-medium text-sm mb-1">E-posta ile giriş şifresi oluştur</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Hesabınızda henüz panel şifresi yok (ör. yalnızca Google ile kayıt). Aşağıdan belirleyeceğiniz
                şifre Firebase hesabınıza bağlanır ve sunucu ile eşitlenir.
              </p>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{PASSWORD_POLICY_MESSAGE}</p>
              {!firebaseReady ? (
                <p className="text-amber-800 text-sm">Firebase oturumu gerekli. Çıkış yapıp tekrar giriş yapın.</p>
              ) : (
                <form onSubmit={handleSetPassword} className="space-y-4 max-w-md">
                  {setError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                      {setError}
                    </div>
                  )}
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Yeni şifre</label>
                    <div className="relative">
                      <input
                        type={setShow ? "text" : "password"}
                        value={setPw}
                        onChange={(e) => setSetPw(e.target.value)}
                        autoComplete="new-password"
                        disabled={setSubmitting}
                        className={`${inputClass} pr-10`}
                        placeholder="örn. Guvenli1!a"
                      />
                      <button
                        type="button"
                        aria-label={setShow ? "Gizle" : "Göster"}
                        onClick={() => setSetShow((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                      >
                        {setShow ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-1.5">Şifre tekrar</label>
                    <input
                      type={setShow ? "text" : "password"}
                      value={setPw2}
                      onChange={(e) => setSetPw2(e.target.value)}
                      autoComplete="new-password"
                      disabled={setSubmitting}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={setSubmitting}
                    className="h-10 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold transition-colors"
                  >
                    {setSubmitting ? "Kaydediliyor…" : "Şifreyi kaydet"}
                  </button>
                </form>
              )}
            </div>
          ) : null}

          {/* E-posta şifresi var: değiştir */}
          {hasPassword && firebaseReady && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6">
              <h3 className="text-slate-900 font-medium text-sm mb-1">Şifreyi değiştir</h3>
              <p className="text-slate-600 text-sm mb-4">
                Mevcut şifrenizi doğrulayıp yenisini belirleyin. Firebase ve sunucu birlikte güncellenir.
              </p>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{PASSWORD_POLICY_MESSAGE}</p>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                {chgError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                    {chgError}
                  </div>
                )}
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Mevcut şifre</label>
                  <div className="relative">
                    <input
                      type={chgShow ? "text" : "password"}
                      value={curPw}
                      onChange={(e) => setCurPw(e.target.value)}
                      autoComplete="current-password"
                      disabled={chgSubmitting}
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      aria-label={chgShow ? "Gizle" : "Göster"}
                      onClick={() => setChgShow((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                    >
                      {chgShow ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Yeni şifre</label>
                  <input
                    type={chgShow ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    autoComplete="new-password"
                    disabled={chgSubmitting}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Yeni şifre tekrar</label>
                  <input
                    type={chgShow ? "text" : "password"}
                    value={newPw2}
                    onChange={(e) => setNewPw2(e.target.value)}
                    autoComplete="new-password"
                    disabled={chgSubmitting}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={chgSubmitting}
                  className="h-10 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white text-sm font-semibold transition-colors"
                >
                  {chgSubmitting ? "Güncelleniyor…" : "Şifreyi güncelle"}
                </button>
              </form>
            </div>
          )}

          <p className="text-slate-500 text-sm">
            Şifrenizi unuttuysanız{" "}
            <Link href="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-700">
              sıfırlama
            </Link>{" "}
            sayfasını kullanabilirsiniz (e-posta ile şifre tanımlı hesaplar).
          </p>
        </div>
      </section>
    </div>
  );
}

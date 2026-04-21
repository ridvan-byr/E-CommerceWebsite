"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { acceptKvkkConsent, firebaseSignOut } from "@/lib/api/authApi";
import { setStoredAccessToken } from "@/lib/api/client";

const sections = [
  {
    id: "1",
    title: "Veri Sorumlusu",
    content: (
      <p>
        Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca{" "}
        <strong>E-Ticaret Yönetim Paneli</strong> ("Şirket") tarafından hazırlanmıştır. Şirket,
        kişisel verilerinizi işleyen veri sorumlusu sıfatını taşımaktadır.
      </p>
    ),
  },
  {
    id: "2",
    title: "İşlenen Kişisel Veriler",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Ad, soyad</li>
        <li>E-posta adresi</li>
        <li>Şifreli oturum bilgileri (şifreler hiçbir zaman düz metin olarak saklanmaz)</li>
        <li>Hesap oluşturma tarihi ve son güncelleme tarihi</li>
        <li>Google ile giriş yapılması durumunda profil fotoğrafı URL'si</li>
        <li>Sistem üzerindeki işlem ve erişim kayıtları (log verileri)</li>
      </ul>
    ),
  },
  {
    id: "3",
    title: "Kişisel Veri İşlemenin Amacı",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Kullanıcı hesabının oluşturulması ve yönetimi</li>
        <li>Kimlik doğrulama ve güvenli giriş işlemlerinin gerçekleştirilmesi</li>
        <li>E-posta adresinin doğrulanması</li>
        <li>Şifre sıfırlama işlemlerinin yürütülmesi</li>
        <li>Ürün, kategori ve sipariş yönetim hizmetlerinin sunulması</li>
        <li>Sistem güvenliğinin sağlanması ve yetkisiz erişimlerin önlenmesi</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>
    ),
  },
  {
    id: "4",
    title: "Hukuki İşleme Sebebi",
    content: (
      <p>
        Kişisel verileriniz; <strong>sözleşmenin kurulması veya ifası</strong> (KVKK m. 5/2-c),{" "}
        <strong>meşru menfaat</strong> (KVKK m. 5/2-f) ve ilgili durumlarda{" "}
        <strong>açık rıza</strong> (KVKK m. 5/1) hukuki sebeplerine dayanılarak işlenmektedir.
      </p>
    ),
  },
  {
    id: "5",
    title: "Kişisel Verilerin Aktarılması",
    content: (
      <p>
        Kişisel verileriniz; kimlik doğrulama altyapısı kapsamında{" "}
        <strong>Google Firebase Authentication</strong> hizmetine aktarılabilir. Bu aktarım, yalnızca
        güvenli giriş işlemlerinin gerçekleştirilmesi amacıyla ve gerekli teknik güvenlik tedbirleri
        alınarak yapılmaktadır. Bunun dışında yasal zorunluluklar olmaksızın üçüncü şahıslara
        aktarılmamaktadır.
      </p>
    ),
  },
  {
    id: "6",
    title: "Veri Saklama Süresi",
    content: (
      <p>
        Kişisel verileriniz, hesabınız aktif olduğu sürece veya yasal saklama yükümlülükleri
        kapsamında belirlenen süreler boyunca muhafaza edilmektedir. Hesabınızın silinmesi
        talebinde verileriniz ilgili mevzuat kapsamında en kısa sürede imha edilir.
      </p>
    ),
  },
  {
    id: "7",
    title: "Haklarınız (KVKK m. 11)",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
        <li>KVKK m. 7 kapsamında silinmesini veya yok edilmesini isteme</li>
        <li>
          İşlemenin otomatik sistemler vasıtasıyla gerçekleşmesi durumunda aleyhte sonuç oluşturan
          karara itiraz hakkı
        </li>
        <li>
          Kanuna aykırı işlenmesi nedeniyle zarara uğramanız halinde zararın giderilmesini talep
          etme
        </li>
      </ul>
    ),
  },
  {
    id: "8",
    title: "İletişim",
    content: (
      <p>
        Haklarınızı kullanmak veya kişisel verilerinize ilişkin sorularınız için{" "}
        <span className="font-medium text-indigo-600">kvkk@eticaret.com</span> adresine e-posta
        gönderebilirsiniz.
      </p>
    ),
  },
];

export default function KvkkConsentPage() {
  const router = useRouter();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!accepted || loading) return;
    setLoading(true);
    try {
      await acceptKvkkConsent();
      router.replace("/dashboard");
    } catch {
      // Hata oluşursa yeniden dene
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    try { await firebaseSignOut(); } catch { /* */ }
    setStoredAccessToken(null);
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Üst bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <span className="text-slate-900 font-bold text-sm">E-Ticaret Yönetim Paneli</span>
            <p className="text-slate-400 text-xs">KVKK Aydınlatma ve Onay</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <Lock size={12} />
          <span>Güvenli bağlantı</span>
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-6">
          {/* Başlık */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
              Kişisel Verilerinizin Korunması
            </h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Platforma erişmeden önce 6698 sayılı KVKK kapsamında kişisel verilerinizin nasıl
              işlendiğini incelemeniz ve onaylamanız gerekmektedir.
            </p>
          </div>

          {/* Accordion Bölümleri */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {sections.map((section) => {
              const isOpen = openSection === section.id;
              return (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {section.id}
                      </span>
                      <span className="text-slate-800 text-sm font-semibold">{section.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed space-y-2">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Onay kutusu */}
          <div
            className={`bg-white rounded-2xl border p-5 transition-colors ${
              accepted ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    accepted ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"
                  }`}
                  style={{ borderRadius: 6 }}
                >
                  {accepted && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path
                        d="M1 4.5L4 7.5L10 1.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="text-slate-800 text-sm font-medium leading-snug">
                  KVKK Aydınlatma Metni'ni okudum ve anladım.
                </p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Yukarıda belirtilen amaçlar doğrultusunda kişisel verilerimin işlenmesine açık
                  rıza veriyorum. Bu onay, hesabımın aktif olduğu süre boyunca geçerlidir.
                </p>
              </div>
            </label>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDecline}
              className="flex-1 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-all"
            >
              Kabul etmiyorum, çıkış yap
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : accepted ? (
                <>
                  <CheckCircle2 size={16} />
                  Kabul ediyorum, devam et
                  <ArrowRight size={15} />
                </>
              ) : (
                "Devam etmek için onaylayın"
              )}
            </button>
          </div>

          <p className="text-center text-slate-400 text-xs">
            Son güncelleme: Nisan 2025 · &copy; {new Date().getFullYear()} E-Ticaret Yönetim Paneli
          </p>
        </div>
      </div>
    </div>
  );
}

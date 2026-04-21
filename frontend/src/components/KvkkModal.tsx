"use client";

import { useEffect, useRef } from "react";
import { X, Shield } from "lucide-react";

interface KvkkModalProps {
  open: boolean;
  onClose: () => void;
}

export default function KvkkModal({ open, onClose }: KvkkModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC ile kapat
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Arka plana tıklayınca kapat
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="kvkk-title"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Başlık */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="kvkk-title" className="text-slate-900 font-bold text-base leading-tight">
              Kişisel Verilerin Korunması Hakkında Aydınlatma Metni
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">6698 Sayılı KVKK Kapsamında</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all flex-shrink-0"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-slate-700 leading-relaxed space-y-5">
          <section>
            <h3 className="font-semibold text-slate-900 mb-1.5">1. Veri Sorumlusu</h3>
            <p>
              Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca
              <strong> E-Ticaret Yönetim Paneli</strong> ("Şirket") tarafından hazırlanmıştır.
              Şirket, kişisel verilerinizi işleyen veri sorumlusu sıfatını taşımaktadır.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1.5">2. İşlenen Kişisel Veriler</h3>
            <p>Platformumuz üzerinden aşağıdaki kişisel verileriniz işlenmektedir:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li>Ad, soyad</li>
              <li>E-posta adresi</li>
              <li>Şifreli oturum bilgileri (şifreler hiçbir zaman düz metin olarak saklanmaz)</li>
              <li>Hesap oluşturma tarihi ve son güncelleme tarihi</li>
              <li>Google ile giriş yapılması durumunda profil fotoğrafı URL'si</li>
              <li>Sistem üzerindeki işlem ve erişim kayıtları (log verileri)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1.5">3. Kişisel Veri İşlemenin Amacı</h3>
            <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li>Kullanıcı hesabının oluşturulması ve yönetimi</li>
              <li>Kimlik doğrulama ve güvenli giriş işlemlerinin gerçekleştirilmesi</li>
              <li>E-posta adresinin doğrulanması</li>
              <li>Şifre sıfırlama işlemlerinin yürütülmesi</li>
              <li>Ürün, kategori ve sipariş yönetim hizmetlerinin sunulması</li>
              <li>Sistem güvenliğinin sağlanması ve yetkisiz erişimlerin önlenmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1.5">4. Hukuki İşleme Sebebi</h3>
            <p>
              Kişisel verileriniz; <strong>sözleşmenin kurulması veya ifası</strong> (KVKK m. 5/2-c),
              <strong> meşru menfaat</strong> (KVKK m. 5/2-f) ve ilgili durumlarda{" "}
              <strong>açık rıza</strong> (KVKK m. 5/1) hukuki sebeplerine dayanılarak işlenmektedir.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1.5">5. Kişisel Verilerin Aktarılması</h3>
            <p>
              Kişisel verileriniz; kimlik doğrulama altyapısı kapsamında{" "}
              <strong>Google Firebase Authentication</strong> hizmetine aktarılabilir. Bu aktarım,
              yalnızca güvenli giriş işlemlerinin gerçekleştirilmesi amacıyla ve gerekli teknik
              güvenlik tedbirleri alınarak yapılmaktadır. Bunun dışında kişisel verileriniz yasal
              zorunluluklar olmaksızın üçüncü şahıslara aktarılmamaktadır.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1.5">6. Veri Saklama Süresi</h3>
            <p>
              Kişisel verileriniz, hesabınız aktif olduğu sürece veya yasal saklama yükümlülükleri
              kapsamında belirlenen süreler boyunca muhafaza edilmektedir. Hesabınızın silinmesi
              talebinde verileriniz ilgili mevzuat kapsamında en kısa sürede imha edilir.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1.5">7. İlgili Kişi Hakları</h3>
            <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>KVKK'nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme</li>
              <li>İşlemenin otomatik sistemler vasıtasıyla gerçekleşmesi durumunda aleyhte sonuç oluşturan kararın itiraz hakkı</li>
              <li>Kanuna aykırı işlenmesi nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1.5">8. İletişim</h3>
            <p>
              Yukarıda belirtilen haklarınızı kullanmak veya kişisel verilerinize ilişkin sorularınız
              için <span className="font-medium text-indigo-600">kvkk@eticaret.com</span> adresine
              e-posta gönderebilirsiniz.
            </p>
          </section>

          <p className="text-slate-400 text-xs border-t border-slate-100 pt-4">
            Son güncelleme: Nisan 2025 · Bu metin bilgilendirme amaçlıdır; hukuki bağlayıcılık
            taşıyan tam metin kurumsal iletişim adresimizden talep edilebilir.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

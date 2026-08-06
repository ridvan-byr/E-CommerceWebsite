# E-CommerceWebsite
Full-stack e-commerce web application built with Next.js and .NET Core.

<!--
REVIEW [F1] README şu ana kadar iki satırdı. Senin 6 ay sonra kendi
projeni nasıl çalıştıracağını hatırlamayacaksın; başkası ise hiç
çalıştıramaz. "Setup adımları + nasıl çalıştırılır" minimum kabul
kriteri. Aşağıdaki taslak doldurulup repo'da kalmalı.
Anahtar kelime: "README driven development".
-->

## Mimari

- **Backend:** ASP.NET Core 8, EF Core (SQL Server), JWT (HttpOnly cookie) + Firebase Authentication
- **Frontend:** Next.js 16 (App Router), Tailwind CSS, lucide-react
- **Görsel storage:** Cloudflare R2 (S3 uyumlu)
- **E-posta:** SMTP (dev'de pickup directory'ye yazılabilir)

## Gereksinimler

- .NET 8 SDK
- Node.js 20+
- SQL Server (LocalDB / Express ile yeter)
- Firebase projesi (Authentication aktif)
- Cloudflare R2 bucket (görsel yükleme için)

## Backend kurulum

```bash
cd backend

# 1. Bağımlılıklar
dotnet restore

# 2. Sırlar (User Secrets — repo'ya commit'lenmez)
dotnet user-secrets init
dotnet user-secrets set "Jwt:Secret"            "<en-az-32-karakter-rastgele-string>"
dotnet user-secrets set "R2:AccessKeyId"        "<r2-access-key>"
dotnet user-secrets set "R2:SecretAccessKey"    "<r2-secret>"
dotnet user-secrets set "Email:Host"            "smtp.gmail.com"
dotnet user-secrets set "Email:Username"        "<smtp-username>"
dotnet user-secrets set "Email:Password"        "<smtp-password-or-app-password>"
dotnet user-secrets set "Email:FromAddress"     "no-reply@<domain>"

# 3. Firebase service account
#    Firebase Console → Project Settings → Service accounts → Generate new private key
#    İndirdiğin JSON'ı backend/Secrets/ altına koy (klasör .gitignore'da).
#    appsettings.Development.json içindeki Firebase:ServiceAccountPath
#    bu JSON'ın yolunu işaret etmeli.

# 4. Veritabanı (varolan migration'lardan oluştur)
dotnet ef database update

# 5. Çalıştır
dotnet run
```

Backend default olarak `http://localhost:5288` üzerinde dinler. Dev modunda
OpenAPI dokümanı `http://localhost:5288/openapi/v1.json` adresinden açılır.

## Frontend kurulum

```bash
cd frontend

# 1. Bağımlılıklar
npm install

# 2. Environment dosyası
cp .env.local.example .env.local
# .env.local'i Firebase ve API URL değerleriyle doldur. Örnek için
# frontend/.env.local.example dosyasına bak.

# 3. Çalıştır
npm run dev
```

Frontend `http://localhost:3000` üzerinden erişilir.

## Branching ve commit akışı

<!--
REVIEW [E3] Şu ana kadar tüm commit'ler doğrudan `main` üzerine atılmış.
Solo projede bu hayatta kalır ama profesyonel akışta:
  • Her feature için yeni branch açılır (feat/email-verification)
  • PR açılır, code review yapılır, sonra merge edilir
  • main daima çalışan kod olarak korunur

Staj raporundaki "branch ve merge işlemlerini geliştirmesi gerekli" notu
buraya işaret ediyor. Aşağıdaki minik kural seti şimdi alışkanlık olursa
takıma girdiğinde otomatik gelir.
-->

```bash
# Yeni iş başlarken
git checkout main
git pull
git checkout -b feat/<kısa-açıklama>     # ör: feat/order-module

# İş bittiğinde
git push -u origin feat/order-module
gh pr create --title "..." --body "..."  # ya da GitHub UI'dan PR aç

# Onaylandıktan sonra
gh pr merge --squash --delete-branch
```

Commit mesajı formatı (Conventional Commits):

```
feat(scope): kısa özet
fix(scope): kısa özet
chore: ...
docs: ...
refactor: ...
```

Atomik commit kuralı: bir mantıksal değişiklik = bir commit. Bug fix ile
feature ekleme aynı commit'te olmasın.

## İleride yapılacaklar

<!--
REVIEW [G1] Bu liste, code review'da kapsam dışı bırakılmış ama "ileride
bakılacak" maddeler. Şu an öncelik değil; proje 0.1'den 1.0'a giderken
sırayla ele alınır.
-->

### Auth / JWT sertleştirme

- [ ] **Refresh token rotasyonu:** Şu an sadece access token (HttpOnly cookie)
      var, 120 dakika sonra kullanıcı yeniden login olmak zorunda. Refresh
      token akışı eklenince oturum sessizce yenilenir, kullanıcı deneyimi
      iyileşir, güvenlik artar (kısa ömürlü access + uzun ömürlü refresh).
- [ ] **Token revocation listesi:** Logout olunca cookie siliniyor ama
      token expiry'sine kadar geçerli. Sunucu tarafında "iptal edilen
      token'lar" tablosu (Redis veya DB) tut.
- [ ] **Role/Policy bazlı yetkilendirme:** `[Authorize(Roles = "Admin")]`
      zaten kullanılabilir; daha karmaşık kurallar için
      `AddAuthorization(opts => opts.AddPolicy("CanEditProduct", ...))`.
- [ ] **JWT validation sertleştirme:** `ClockSkew = TimeSpan.Zero` (şu an
      1 dk tolerans var; üretimde sıkı), `RequireExpirationTime = true`,
      `RequireSignedTokens = true`.
- [ ] **Login telemetrisi:** Başarısız login attempt'lerini IP bazlı say,
      eşik aşılınca hesabı geçici kilitle (account lockout).

### Logging / Observability

- [ ] **Structured logging (Serilog):** Şu an `ILogger<T>` ile placeholder'lı
      log mesajları yazıyorsun (iyi, devam et). Üretimde Serilog ile
      JSON çıktı + dosya/Seq/Elasticsearch sink eklenir; "kullanıcı X
      saat Y'da neyi sildi?" sorusuna saniyeler içinde cevap alırsın.
- [ ] **Correlation ID middleware:** Her request'e benzersiz bir ID ekle;
      log satırlarında bu ID görünsün. Bir kullanıcı "şu hata oldu"
      dediğinde, ID ile tüm akışı takip edebilirsin.
- [ ] **Health check endpoint:** `app.MapHealthChecks("/health")`. DB ve
      external servis (R2, SMTP) bağlantılarını kontrol eder.

### Testler

- [ ] Unit testler: `ProductService.CreateAsync` için happy path + duplicate
      SKU + invalid category senaryoları.
- [ ] Integration testler: `WebApplicationFactory` + InMemory veya
      Testcontainers ile gerçek SQL.

### Performans / DX

- [ ] Pagination UI (şu an `products/page.tsx` `pageSize: 200` hardcoded).
- [ ] CORS config'i environment-aware yap (üretimde sadece prod domain'i).
- [ ] Migration'ları 1.0 release öncesi squash et.

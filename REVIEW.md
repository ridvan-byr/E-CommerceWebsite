# Code Review — Rıdvan'ın E-Ticaret Projesi

Selam Rıdvan! 👋

2 ayda sıfırdan tam stack bir admin panel + .NET 8 backend çıkarmışsın — ürün/kategori/özellik CRUD, Firebase Auth, KVKK akışı, e-posta doğrulama, Cloudflare R2 görsel yükleme, şifre sıfırlama… listesi uzun. Staj raporundaki "API entegrasyonunu tamamlayamadı" notuna göre çok daha ileri gitmişsin; bu son halinde frontend backend ile düzgün konuşuyor, repo/service/controller katmanı ayrılmış, DTO'lar ve validation var.

Bu review, **kötü kod** demek için değil — bir sonraki seviyeye atlamak için tutunabileceğin somut başlıklar. Junior–mid seviyeye geçişte en çok bunlar fark ediyor:

- Güvenlik refleksleri (auth, secret yönetimi)
- "Çalışıyor"dan "production-ready"a giden detaylar (rate limit, observability)
- Tekrarın çıkarılması (DRY)
- Repo hijyeni

Dosya:satır referansı verdiğim yerlere bakman yeter; konuyu öğrenmen için hangi anahtar kelimeleri araman gerektiğini de yanına yazdım.

---

## 1. Güvenlik (Security) — En öncelikli

### 1.1 🔴 KRİTİK: Cloudflare R2 anahtarları repo'ya commit edilmiş

`backend/appsettings.Development.json:26-32`

```json
"R2": {
  "AccountId": "1001c254f905fd37e231fa89b3301946",
  "AccessKeyId": "4ab0765473ef1840c4c9acb3dd882d3f",
  "SecretAccessKey": "e3e322c49273d29fa2fd8abccdf2daf1311d1da5d91cf762ffa29e5f2c980d47",
  ...
}
```

**Hemen yapılacaklar:**
1. Bu anahtarları **rotate et** (Cloudflare panelinden iptal edip yenisini oluştur). Repo public, anahtarlar zaten ifşa olmuş kabul.
2. Anahtarları User Secrets veya environment variable'a taşı:
   ```bash
   dotnet user-secrets set "R2:AccessKeyId" "..."
   dotnet user-secrets set "R2:SecretAccessKey" "..."
   ```
3. `appsettings.Development.json`'daki anahtarları boş bırak (örnek değerlerle).
4. Geçmiş commit'lerden de tamamen silmek istersen `git filter-repo` veya BFG kullanılır — ama anahtarları rotate ettikten sonra şart değil, anahtarlar zaten geçersiz olur.

**Aynı dosyada JWT Secret de hardcoded** (`appsettings.json:13`). Production'da bu secret env var'dan / Azure Key Vault'tan / secret manager'dan gelmeli.

**Anahtar kelime arama:** "ASP.NET Core User Secrets", "12-factor config", "secrets in source control".

### 1.2 🔴 KRİTİK: Tüm CRUD endpoint'leri kimlik doğrulama olmadan açık

`backend/Controllers/ProductController.cs`, `CategoryController.cs`, `FeatureController.cs`, `ProductFeatureController.cs`, `ProductPriceController.cs`

`grep -rn "\[Authorize\]"` sonucu sadece `AuthController.cs:190, 205, 224` çıkıyor. Yani şu an **internet'teki herkes**:

- Ürün/kategori/özellik oluşturup güncelleyip silebilir
- `/api/products/upload-image` üzerinden senin R2 bucket'ına dosya yükleyebilir (storage maliyeti senin)
- Ürün fiyat geçmişine kayıt ekleyebilir

Frontend tarafından çağrılırken JWT cookie gönderiliyor ama backend kontrol etmiyor.

**Düzeltme:**

```csharp
[ApiController]
[Authorize]                      // class seviyesinde
[Route("api/products")]
public class ProductController : ControllerBase
```

Bu projede admin panel olduğu için tüm yazma uçlarına `[Authorize]`, hatta rol bazlı `[Authorize(Roles = "Admin")]` eklemen gerek. Halka açık kalması gereken (örn. ürün listesi `GET`) varsa onlara `[AllowAnonymous]` eklersin.

**Anahtar kelime:** "ASP.NET Core role-based authorization", "policy-based authorization".

### 1.3 🟠 Rate limiter politikaları tanımlı ama uygulanmıyor

`backend/Program.cs:111-142` içinde `"auth"` ve `"password-reset"` policy'leri var ama hiçbir endpoint'te `[EnableRateLimiting("...")]` attribute'u yok (`grep "EnableRateLimiting"` boş döndü).

Yani brute-force koruma kurgulanmış ama devreye girmiyor. Hızlıca düzelt:

```csharp
[HttpPost("login")]
[EnableRateLimiting("auth")]
public async Task<IActionResult> Login(...) { ... }

[HttpPost("forgot-password")]
[EnableRateLimiting("password-reset")]
public async Task<IActionResult> ForgotPassword(...) { ... }
```

`AuthController` üstüne attribute koyup belirli endpoint'lere `[DisableRateLimiting]` da koyabilirsin — daha temiz.

### 1.4 🟠 Görsel yükleme endpoint'i auth gerektirmiyor

`backend/Controllers/ProductController.cs:27`

`POST /api/products/upload-image` — herkes 5 MB'lık dosyayı R2'na yazabilir. `[Authorize]` ekle ve content sniffing yapmayı düşün (uzantı + content-type yetmez; MIME magic bytes kontrolü). Senaryo: saldırgan EXIF/HTML embed ile XSS veya storage doldurma saldırısı yapabilir.

---

## 2. Backend Kod Kalitesi & Best Practice

### 2.1 `[ApiController]` zaten `ModelState` kontrolünü yapar — manuel `if`'ler gereksiz

Tüm controller'larda:

```csharp
if (!ModelState.IsValid)
    return BadRequest(ModelState);
```

`[ApiController]` attribute'u bu kontrolü otomatik yapıyor ve `ValidationProblemDetails` döndürüyor. Yani bu satırlar hep `dead code`. Hepsini sil — controller'ların 5–10 satır kısalır.

`AuthController.cs:41-42, 54-55, 89-90, 117-118, 145-146, ...` — 7+ yerde tekrar.

### 2.2 `ProductController.UpdateProduct` gereksiz DB roundtrip

`backend/Controllers/ProductController.cs:110-112`

```csharp
var existing = await _productService.GetByIdAsync(id, cancellationToken);
if (existing is null)
    return NotFound();

var result = await _productService.UpdateAsync(id, dto, cancellationToken);
```

`UpdateAsync` zaten `GetTrackedActiveByIdAsync` çağırıp NotFound durumunu `ProductMutationError.NotFound` olarak dönüyor (`ProductService.cs:94-96`). Yani üst seviyede aynı sorguyu bir kez daha atıyorsun. İlk satırı sil — `result.Error == ProductMutationError.NotFound` kontrolün zaten var.

### 2.3 `ProductService.SoftDeleteAsync` her durumda `true` dönüyor — kontrat hatası

`backend/Services/ProductService.cs:144-149`

```csharp
public async Task<bool> SoftDeleteAsync(int id, ...)
{
    var product = await _productRepository.GetTrackedActiveByIdAsync(id, ...);
    if (product is null)
        return true;       // ← burası bug. Yoktu, "silindi" demek yanlış.
    ...
}
```

Controller bunu `if (!deleted) return NotFound();` diye okuyor. Yani kullanıcı olmayan ürünü silmeye çalışınca 204 No Content alıyor. Ya `false` döndür, ya da kontratı netleştirip `enum DeleteResult { NotFound, Deleted }` döndür.

### 2.4 Hata mesajı `switch` bloğu iki kez tekrarlanmış (DRY)

`ProductController.cs:88-95` ve `119-126`

Aynı 4 case'lik switch hem `Create` hem `Update`'te. Bunu `ProductService` içinde `ProductMutationError → string` mapping'i ile veya `ProductMutationResult`'a `Message` alanı ekleyerek tek yere taşı. Senior seviyenin işareti: "iki kere yazdığım her şeyi şüpheyle gör."

### 2.5 `ProductRepository.GetCategoryNamesByIdsAsync` içinde dead code

`backend/Repositories/ProductRepository.cs:73-79`

```csharp
var ids = categoryIds.Distinct().ToHashSet();
if (ids.Count == 0)
    return new Dictionary<int, string>();

var idsList = ids.ToList();
if (idsList.Count == 0) return new Dictionary<int, string>();   // <- aynı kontrol, dead
```

İkinci `Count == 0` kontrolü asla `true` olamaz çünkü ilk kontrolden geçtiyse `Count > 0`. Sil.

Bu method ve `CategoryExistsActiveAsync` aslında `ICategoryRepository`'ye taşınmalı — `IProductRepository` neden kategori adı çekiyor? **Single Responsibility** ihlali.

### 2.6 `try/catch` üzerinde Global handler ile çakışma

`backend/Controllers/ProductController.cs:37-46` ve `Middleware/GlobalExceptionMiddleware.cs:59-66`

`GlobalExceptionMiddleware` zaten `ArgumentException → 400 BadRequest` mapping'i yapıyor. `UploadImage`'da ekstra try/catch tutmana gerek yok — middleware halleder. Kodu kısaltır, davranış aynı kalır.

### 2.7 Aynı endpoint'in iki versiyonu: `GET /api/products` ve `GET /api/products/search`

`ProductController.cs:48-60`. `GetProductList` filtre olmadan `SearchProductAsync`'i çağırıyor. Birini kaldırıp tek bir endpoint kullan — "search" optional query string'lerle aynı işi görür. RESTful API'lerde **bir kaynağın listesi tek route ile döner** (`GET /api/products?search=...&page=...`).

**Anahtar kelime:** "REST API best practices", "Microsoft REST API guidelines".

### 2.8 `register` için belirsiz hata kontratı

`AuthService.RegisterAsync` 3 farklı hata için `null` döndürüyor (token geçersiz, e-posta yok, e-posta zaten kayıtlı). Controller hepsini 409 Conflict olarak çeviriyor — kullanıcı doğru hatayı göremiyor. Result type / `enum RegisterError` kullan:

```csharp
public enum RegisterError { None, InvalidToken, EmailMissing, EmailTaken }
public record RegisterOutcome(RegisterResultDto? Result, RegisterError Error);
```

### 2.9 `Repository` her method için ayrı `SaveChangesAsync` çağırıyor

Her servis method'unda `_repo.AddAsync` + `_repo.SaveChangesAsync`. Bu `Unit of Work` paterni eksik demek. EF Core'da `DbContext` zaten Unit of Work'tür — ama her repo'ya `SaveChangesAsync` koymak yerine, servis seviyesinde tek bir `IUnitOfWork.SaveChangesAsync()` çağırmak daha temiz olurdu. Şu an çalışıyor; ileride birden çok repo'yu tek transaction'da kullanmak istediğinde sorun olur.

**Anahtar kelime:** "Unit of Work pattern EF Core", "transaction scope".

---

## 3. Frontend Kod Kalitesi

### 3.1 Kullanılmayan dependency'ler

`frontend/package.json:11-19`

- `@supabase/supabase-js` — kodda hiç kullanılmıyor (`grep -r supabase src/` boş)
- `zustand` — kullanılmıyor (commit `e608546` "Zustand removed" diyor ama package.json'dan silinmemiş)

```bash
npm uninstall @supabase/supabase-js zustand
```

Bundle size'ı şişirmemek için kullanmadığın paketi tutma. `npx depcheck` yardımcı olur.

### 3.2 `<img>` yerine `next/image`

`frontend/src/app/(admin)/products/page.tsx:273-277` ve `dashboard/page.tsx:394-398`

Next.js 16'da `next/image` otomatik lazy load + boyutlandırma + WebP dönüşüm yapıyor. ESLint config'inde `@next/next/no-img-element` kuralı varsa zaten uyarı görüyorsundur. R2 URL'ları için `next.config.ts`'de `images.remotePatterns` eklemen gerek — biraz ek iş ama performans farkı büyük.

### 3.3 `alert(...)` ile kullanıcı hatası gösterme

`products/page.tsx:132` ve `products/create/page.tsx:75`

`alert()` mobil tarayıcıda kötü, dev tools açıkken bloke ediyor, accessibility kötü. Zaten `Toast.tsx` bileşenin var — onu kullan. Hatta projede `setListFlash`-bazlı toast deseni var; tutarlı kullanırsan UX iyileşir.

### 3.4 `validate()` fonksiyonu inline tekrar ediyor

`products/create/page.tsx:89-119` ve `products/[id]/page.tsx`'de muhtemelen aynısı var. Validation kuralları **tek yerde** olmalı. Frontend'de `lib/validators/productValidator.ts` gibi bir dosyaya çıkar; create ve update sayfaları aynı fonksiyonu çağırsın. Backend tarafındaki `CreateProductDto` validation ile sync tutmak başka konu (sözleşme: backend her zaman son söz).

### 3.5 SSR-unsafe `localStorage` erişimleri

`frontend/src/lib/api/client.ts` doğru yapıyor (`typeof window === "undefined"` kontrolü var). Ama `mockData` import'ları, `dashboard/page.tsx:25` gibi yerlerde de **`use client` direktifi** var. Bu sayfalar pure client component'ler — büyük sayfalar için bunları server component'e çevirip sadece interaktif kısımları `"use client"` yapman SSR + hydration performansını ciddi iyileştirir. Şu an tüm admin paneli client-side. Bu yapısal bir iş, 1 saatlik değil — ileride büyük refactor olarak düşün.

**Anahtar kelime:** "Next.js Server Components vs Client Components", "use client boundary".

### 3.6 `searchProducts({ pageSize: 200 })` — pagination eksik

`products/page.tsx:107`, `dashboard/page.tsx:81`

Sabit `pageSize: 200` ile listeyi çekiyorsun. 1000 ürün olunca yavaşlayacak. Backend `SearchAsync` zaten paginate eder, ama frontend "ben hepsini istiyorum" diyor. Listeleme sayfasına gerçek pagination UI ekle (ileri/geri butonları + sayfa numarası).

---

## 4. Mimari & Pattern (SOLID, DI)

Staj raporundaki "SOLID, DI, Design Pattern, Generic yapılar" maddelerine yönelik:

### 4.1 SOLID — Genel olarak iyi başlangıç

- **S (SRP):** Controller → Service → Repository ayrımı yapmışsın. ✅ İyi.
- **D (DI):** Constructor injection her yerde. ✅ İyi.
- **O (Open/Closed):** `IImageStorageService` arkasına hem local hem R2 implementation koymuşsun. ✅ Çok iyi pattern örneği.
- **I (ISP):** `IProductRepository` üzerinde `CategoryExistsActiveAsync` ve `GetCategoryNamesByIdsAsync` var — bu interface'in işi değil. Ayır.
- **L:** Şu an LSP riski yok.

### 4.2 Repository pattern'da generic eksik

`IProductRepository`, `ICategoryRepository`, `IFeatureRepository` çoğu yerde aynı şeyi yapıyor (`GetByIdAsync`, `AddAsync`, `SaveChangesAsync`). Generic base interface ekleyebilirsin:

```csharp
public interface IGenericRepository<TEntity> where TEntity : class
{
    Task<TEntity?> GetByIdAsync(int id, CancellationToken ct);
    Task AddAsync(TEntity e, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}

public interface IProductRepository : IGenericRepository<Product>
{
    Task<bool> IsSkuTakenAsync(...);
    // domain-specific olanlar burada
}
```

Staj raporundaki "Generic yapılar" feedback'i tam burayı işaret ediyor. Domain-specific kısımları ayrı tut, ortak CRUD'u generic'e devret.

**Anahtar kelime:** "Generic Repository Pattern .NET", "specification pattern".

### 4.3 `IUserRepository`'de 6 farklı `GetBy*` metodu var

`GetByIdAsync`, `GetByIdTrackingAsync`, `GetByEmailAsync`, `GetByEmailTrackingAsync`, `GetByFirebaseUidAsync`, `GetByFirebaseUidTrackingAsync` — tracking/no-tracking için 2'ye katlanıyor. Daha temiz: tek metod + `bool tracking = false` parametresi:

```csharp
Task<User?> GetByEmailAsync(string email, bool tracking = false, CancellationToken ct = default);
```

---

## 5. Versiyon Kontrol & Repo Hijyeni

Staj raporu "Branch ve merge işlemlerini geliştirmesi gerekli" demiş. Birkaç gözlem:

### 5.1 Tüm commit'ler `main` üstüne yapılmış

`git log --oneline` sonucu hep main üzerinde feature ekliyorsun. Profesyonel akışta:

1. Her feature için yeni branch: `git checkout -b feat/email-verification`
2. PR açılır, kendi kendine merge edilebilir ama PR description'da ne değiştiğini özetlemek alışkanlık kazandırır
3. Main her zaman çalışan kod, branch'lerde deney

Solo proje olduğu için bu çok kritik değil ama takımda çalışırken mecburi.

### 5.2 Commit mesajları genel olarak iyi

`feat(backend): R2 product images, HttpOnly JWT cookie, and session/password flows` — Conventional Commits formatına yakın, açıklayıcı. ✅ İyi.

Ama bazıları çok büyük (`6b8c4f0` commit'i 30+ değişikliği tek mesajda). **Atomik commit** alışkanlığı kazan: bir mantıksal değişiklik = bir commit. Bug fix ile feature ekleme aynı commit'e girmesin.

### 5.3 🟠 Build artifact'ları commit'lenmiş

```
backend/_build_check/   → 65+ DLL, ~50 MB
backend/_verify_build/  → aynı
frontend/i.webp         → muhtemelen yanlışlıkla eklenmiş
```

`.gitignore`'a ekle:

```gitignore
backend/_build_check/
backend/_verify_build/
```

Sonra repo'dan kaldır:

```bash
git rm -rf --cached backend/_build_check backend/_verify_build frontend/i.webp
git commit -m "chore: remove tracked build artifacts and stray files"
```

Bu repo'yu klonlayan biri 50 MB fazla indirmek zorunda — boş yere.

### 5.4 `.gitignore` eksiklikleri

```gitignore
# Eklenecekler
backend/Secrets/   # zaten var, devam ✓
backend/_build_check/
backend/_verify_build/
backend/wwwroot/uploads/   # local upload çıktıları
frontend/node_modules/     # zaten next/.gitignore'da ama explicit yaz
frontend/.next/
frontend/.env*.local
.DS_Store
```

---

## 6. Dokümantasyon

### 6.1 README iki satır

`README.md` toplamda 2 satır. Bu projeyi klonlayan biri (sen 6 ay sonra dahil) nasıl çalıştıracağını bilemez. Minimum:

````markdown
# E-CommerceWebsite

## Gereksinimler
- .NET 8 SDK
- Node 20+
- SQL Server (LocalDB / Express)

## Backend kurulum
```bash
cd backend
dotnet user-secrets set "Jwt:Secret" "<32+ char>"
dotnet user-secrets set "R2:AccessKeyId" "<key>"
dotnet user-secrets set "R2:SecretAccessKey" "<secret>"
dotnet ef database update
dotnet run
```

## Frontend kurulum
```bash
cd frontend
cp .env.local.example .env.local   # Firebase config'i doldur
npm install
npm run dev
```

## Mimari
- backend: ASP.NET Core 8, EF Core, JWT (HttpOnly cookie) + Firebase Auth
- frontend: Next.js 16 App Router, Tailwind, lucide-react
- görsel storage: Cloudflare R2

## Endpoint listesi
Dev modda: http://localhost:5288/openapi/v1.json
````

### 6.2 `.env.example` dosyası yok

Frontend Firebase için 7 env değişkeni gerekiyor (`firebase.ts:5-12`) ama `.env.local.example` yok. Yeni bir geliştirici ne yazacağını bilemez. Boş bir şablon ekle:

```
# frontend/.env.local.example
NEXT_PUBLIC_API_URL=http://localhost:5288
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
...
```

### 6.3 XML doc comment'ler güzel ama tutarsız

`AuthController.cs`'de bazı endpoint'lerin üstünde `/// <summary>` var, bazılarında yok. `ProductController.cs`'de hiç yok. Hepsi olsun ya da hiç olmasın — tutarlılık önemli. OpenAPI dokümanına otomatik akıyor; ekleyince Swagger UI'da daha okunabilir olur.

---

## 7. Yapısal İyileştirmeler (önerim, "must-fix" değil)

- **Test eksik:** Hiç unit test ya da integration test yok. xUnit + Moq + WebApplicationFactory ile başlayabilirsin. En azından `ProductService` create/update için happy-path + duplicate SKU testi.
- **Logging:** `_logger.LogWarning` güzel kullanmışsın, structured logging (`{Email}` placeholder'ları) ✅. Production'da Serilog + dosya/Seq sink eklemek gerek.
- **CORS:** `Program.cs:144-154` sadece `localhost:3000`'i kabul ediyor — production deploy ederken environment-aware yapacaksın (env.IsDevelopment olmayanlar için config'den okuma).
- **Migration'lar:** 15+ migration var, çoğu küçük değişiklikler. Schema stabilize olunca squash etmek temiz olur (sadece prod'a deploy edilmediyse).

---

## Toparlayıcı: Öncelik sırası

Yapacaklar listene şu sırayla yazsan:

| Öncelik | Madde | Süre |
|---------|-------|------|
| 🔴 Hemen | R2 anahtarlarını rotate et + secret store'a taşı | 30dk |
| 🔴 Hemen | CRUD controller'lara `[Authorize]` ekle | 30dk |
| 🟠 1 gün | Rate limit attribute'larını uygula | 15dk |
| 🟠 1 gün | Build artifact'larını gitignore'a ekle, repo'dan kaldır | 15dk |
| 🟡 1 hafta | `[ApiController]` redundant `ModelState` checks temizle | 30dk |
| 🟡 1 hafta | DRY: hata mesajı switch'lerini tek yere taşı | 1saat |
| 🟡 1 hafta | `package.json` cleanup (supabase, zustand) | 5dk |
| 🟡 1 hafta | README + .env.example | 1-2 saat |
| 🟢 Ay sonu | Generic Repository refactor | yarım gün |
| 🟢 Ay sonu | Unit testler (en azından servis seviyesi) | 1-2 gün |
| 🟢 Ay sonu | Pagination UI | yarım gün |

---

## Genel Değerlendirme

Sıfırdan 2 ayda **çok ileri** bir nokta. Staj raporundaki "API entegrasyonu tamamlanamadı" ve "backend süreçleri eksik" notlarını ezmişsin — frontend/backend birbirine konuşuyor, soft delete + audit field'lar + Firebase entegrasyonu + R2 + KVKK akışı… mid-level gerçek dünya projelerinin %70'i bunlar.

Yukarıdaki notların **çoğu mid-level developer'ı junior'dan ayıran detaylar**:

- Güvenlik refleksleri (auth-by-default, secret yönetimi)
- DRY — tekrarın gözü gibi görmek
- Repo hijyeni
- Hata kontratlarını netleştirmek

Asıl önemlisi: bunların **hepsi öğrenilebilir ve tek tek çözülebilir**. Hiçbiri "kötü tasarım, baştan yaz" düzeyinde değil. Sırayla git.

Devam et — bu projeyi CV'nde **gururlu** anlatabileceğin yere getirmen 1 hafta odaklı çalışmana bakar.

İyi çalışmalar! 🚀

— Eren

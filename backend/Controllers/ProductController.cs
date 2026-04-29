using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers;


// ─────────────────────────────────────────────────────────────────────────
// REVIEW [A2 + A4] KRİTİK GÜVENLİK: Bu controller (ve CategoryController,
// FeatureController, ProductFeatureController, ProductPriceController)
// üstünde [Authorize] attribute'u YOK. Yani şu an internet'teki herkes:
//
//   • POST /api/products             → ürün oluşturabilir
//   • PUT  /api/products/{id}        → ürün güncelleyebilir
//   • DELETE /api/products/{id}      → ürün silebilir
//   • POST /api/products/upload-image→ senin R2 bucket'ına 5 MB'lık dosya
//                                       yükleyebilir (storage faturası senin)
//
// Frontend cookie gönderse bile backend kontrol etmiyor. JWT cookie sadece
// AuthController'daki [Authorize] uçlarında doğrulanıyor.
//
// HIZLI DÜZELTME (1. aşama — ŞİMDİ yap):
//   Class seviyesinde [Authorize] ekle. Listeleme/okuma uçlarını public
//   bırakmak istersen ilgili action'a [AllowAnonymous] ver.
//
//       [ApiController]
//       [Authorize]
//       [Route("api/products")]
//       public class ProductController : ControllerBase
//       {
//           [HttpGet]
//           [AllowAnonymous]   // listeyi herkes görebilsin istersen
//           public async Task<IActionResult> GetProductList(...) { ... }
//
//           // POST/PUT/DELETE auth gerektirir
//       }
//
// SONRAKİ AŞAMA (rol bazlı yetkilendirme — ileride):
//   Şu an JWT'de role claim'i üretiliyor (User.Role = "Admin" veya
//   "Customer", JwtAccessTokenFactory'ye bak). Yazma uçlarını sadece
//   admin'e açmak için:
//
//       [Authorize(Roles = "Admin")]
//       [HttpPost]
//       public async Task<IActionResult> CreateProduct(...) { ... }
//
//   Daha ileri aşamada policy-based authorization, claim transformation,
//   refresh token rotasyonu, JWT lifetime sertleştirme gibi konulara da
//   bakılır. Önce [Authorize], sonra rol, sonra policy — sırayla git.
//
// Anahtar kelimeler: "ASP.NET Core role-based authorization",
//   "policy-based authorization", "[Authorize] attribute", "JWT claims".
// ─────────────────────────────────────────────────────────────────────────
[ApiController]
[Route("api/products")]
public class ProductController : ControllerBase
{

    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    /// <summary>
    /// Ürün görseli yükler. multipart/form-data — alan adı: "file".
    /// Maksimum boyut: 5 MB. Desteklenen formatlar: JPG, PNG, WEBP, GIF.
    /// Dönen URL doğrudan imageUrl alanında kullanılabilir.
    /// </summary>
    [HttpPost("upload-image")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        [FromServices] IImageStorageService imageStorage,
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Dosya seçilmedi." });

        // REVIEW [B6] Bu try/catch gereksiz. Program.cs'de UseMiddleware<GlobalExceptionMiddleware>()
        // var; o middleware ArgumentException → 400 BadRequest mapping'i zaten yapıyor
        // (Middleware/GlobalExceptionMiddleware.cs:62). Yani burada exception'ı yakalayıp
        // tekrar BadRequest dönmek aynı işi iki kere yapmak. Genel kural: cross-cutting
        // concern'leri (logging, exception handling, transaction) middleware'e bırak;
        // controller sadece "happy path"i ifade etsin.
        //
        // Sadeleştirilmiş hali:
        //     var url = await imageStorage.SaveProductImageAsync(file, cancellationToken);
        //     return Ok(new { url });
        //
        // Anahtar kelime: "cross-cutting concerns", "middleware exception handling".
        try
        {
            var url = await imageStorage.SaveProductImageAsync(file, cancellationToken);
            return Ok(new { url });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // REVIEW [B7] REST best practice: bir kaynağın listesi tek route ile döner.
    // Şu an iki ayrı endpoint aynı işi yapıyor:
    //   GET /api/products            → GetProductList → ProductService.GetAllAsync
    //                                  (ki o da SearchProductAsync'i çağırıyor)
    //   GET /api/products/search     → SearchProduct  → ProductService.SearchProductAsync
    //
    // Aynı listeyi iki yoldan dönmek hem API consumer'ı kafalar (hangisini
    // çağırayım?), hem de bakımı zorlaştırır (filtre eklendiğinde iki yere
    // birden eklenir mi?). Tek endpoint yeter:
    //
    //     GET /api/products?search=...&categoryId=...&page=...&pageSize=...
    //
    // ProductListFilter'da Page/PageSize zaten var. GetProductList'i silip
    // SearchProduct'ı tek listing endpoint'i olarak `[HttpGet]` yap. Frontend
    // (productsApi.ts) hâlihazırda /search'i çağırıyor, geçiş basit.
    //
    // Anahtar kelime: "REST API resource collection design",
    //   "Microsoft REST API guidelines".
    [HttpGet]
    public async Task<IActionResult> GetProductList([FromQuery] int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var list = await _productService.GetAllAsync(page, pageSize, cancellationToken);
        return Ok(list);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchProduct([FromQuery] ProductListFilter filter, CancellationToken cancellationToken = default)
    {
        var result = await _productService.SearchProductAsync(filter, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProduct(int id, CancellationToken cancellationToken = default)
    {
            var product = await _productService.GetByIdAsync(id, cancellationToken);
            if (product is null)
            {
                return NotFound();
            }
            return Ok(product);
    }


    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        // REVIEW [B1] Bu blok gereksiz. Class'ın başında [ApiController] var;
        // [ApiController] gelince ASP.NET Core 400 BadRequest + ValidationProblemDetails
        // yanıtını OTOMATİK üretir. Manuel `if (!ModelState.IsValid)` her controller
        // action'ında 5 satır gürültü yaratıyor (bu projede 7+ yerde tekrar var).
        //
        // Kuralı bir kez öğrenip her yerde uygulamak:
        //   "[ApiController] varsa, ModelState manuel kontrol edilmez."
        //
        // Yani aşağıdaki üç satırı sil; davranış aynı kalır, kod kısalır.
        //
        // Anahtar kelime: "ApiController attribute automatic 400 response",
        //   "ValidationProblemDetails ASP.NET Core".
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }


        var result = await _productService.CreateAsync(dto, cancellationToken);
        if (result.Error != ProductMutationError.None)
        {
            if (result.Error == ProductMutationError.NotFound)
                return NotFound();
            // REVIEW [B4] Aşağıdaki switch bloğu UpdateProduct'ta da neredeyse birebir
            // tekrar ediyor (bu dosyada line ~140 civarı). DRY (Don't Repeat Yourself)
            // ihlali — bir hata mesajı değişirse iki yerde değiştirmek zorunda
            // kalırsın, biri unutulur. İki çözüm:
            //
            //   (a) Mesajı `ProductMutationResult` içine taşı: service zaten hatayı
            //       biliyor, mesajı da o üretsin. Controller sadece dönüştürür:
            //         return BadRequest(new { message = result.ErrorMessage });
            //
            //   (b) Bu dosyada private static helper:
            //         private static string MapErrorMessage(ProductMutationError e) => e switch { ... };
            //       Create ve Update aynı helper'ı çağırır.
            //
            // (a) daha temiz çünkü servisin döndürdüğü hatayı servise mesajlatmak
            // sorumluluk dağılımı açısından daha doğal. Senior'ların şüphe ettiği
            // ilk şey: "bu kodu daha önce yazmış mıyım?"
            //
            // Anahtar kelime: "DRY principle", "Result pattern".
            var message = result.Error switch
            {
                ProductMutationError.DuplicateSku => "Bu stok kodu (SKU) başka bir aktif üründe kullanılıyor.",
                ProductMutationError.DuplicateBarcode => "Bu barkod başka bir aktif üründe kullanılıyor.",
                ProductMutationError.InvalidCategory => "Kategori bulunamadı veya silinmiş.",
                _ => "Ürün oluşturulamadı."
            };
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetProduct), new { id = result.Product!.ProductId }, result.Product);
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // REVIEW [B2] Gereksiz DB roundtrip. ProductService.UpdateAsync zaten
        // GetTrackedActiveByIdAsync ile ürünü çekip yoksa ProductMutationError.NotFound
        // dönüyor (ProductService.cs:94-96). Yani aşağıdaki GetByIdAsync çağrısı
        // sorgulamayı iki kere yapıyor — birinci sorgu sadece varlık kontrolü için
        // boşa harcanıyor.
        //
        // Aşağıdaki 3 satırı sil. UpdateAsync'in dönüş değerinde zaten NotFound
        // case'i ele alınıyor (`if (result.Error == ProductMutationError.NotFound)`
        // sıradaki blokta var).
        //
        // Genel prensip: aynı veriyi controller seviyesinde "validate" edip
        // sonra service'e "yine validate et" demek anti-pattern. Validation
        // ya tek seviyede olur (controller veya service), ya da farklı
        // amaçlar için ayrılır (DTO validation vs business rule validation).
        var existing = await _productService.GetByIdAsync(id, cancellationToken);
        if (existing is null)
            return NotFound();

        var result = await _productService.UpdateAsync(id, dto, cancellationToken);
        if (result.Error != ProductMutationError.None)
        {
            if (result.Error == ProductMutationError.NotFound)
                return NotFound();
            var message = result.Error switch
            {
                ProductMutationError.DuplicateSku => "Bu stok kodu (SKU) başka bir aktif üründe kullanılıyor.",
                ProductMutationError.DuplicateBarcode => "Bu barkod başka bir aktif üründe kullanılıyor.",
                ProductMutationError.InvalidCategory => "Kategori bulunamadı veya silinmiş.",
                _ => "Güncelleme reddedildi."
            };
            return BadRequest(new { message });
        }

        return Ok(result.Product);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken = default)
    {
        var deleted = await _productService.SoftDeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }
        return NoContent();
    }
}
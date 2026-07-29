from fpdf import FPDF
import os

class ProjectDoc(FPDF):
    BRAND = (67, 56, 202)      # indigo-600
    DARK = (15, 23, 42)        # slate-900
    GRAY = (71, 85, 105)       # slate-600
    LIGHT_GRAY = (148, 163, 184) # slate-400
    BG = (241, 245, 249)       # slate-100
    WHITE = (255, 255, 255)
    GREEN = (5, 150, 105)
    AMBER = (217, 119, 6)
    RED = (220, 38, 38)
    TABLE_HEADER_BG = (30, 41, 59)   # slate-800
    TABLE_ROW_ALT = (248, 250, 252)  # slate-50
    DIVIDER = (226, 232, 240)        # slate-200

    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
        
        # Windows fonts
        segoe = r"C:\Windows\Fonts\segoeui.ttf"
        segoe_b = r"C:\Windows\Fonts\segoeuib.ttf"
        segoe_i = r"C:\Windows\Fonts\segoeuii.ttf"
        
        if os.path.exists(segoe):
            self.add_font("Segoe", "", segoe, uni=True)
            self.add_font("Segoe", "B", segoe_b, uni=True)
            self.add_font("Segoe", "I", segoe_i, uni=True)
            self.font_name = "Segoe"
        else:
            arial = r"C:\Windows\Fonts\arial.ttf"
            arial_b = r"C:\Windows\Fonts\arialbd.ttf"
            arial_i = r"C:\Windows\Fonts\ariali.ttf"
            self.add_font("Arial2", "", arial, uni=True)
            self.add_font("Arial2", "B", arial_b, uni=True)
            self.add_font("Arial2", "I", arial_i, uni=True)
            self.font_name = "Arial2"

    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*self.BRAND)
        self.rect(0, 0, 210, 3, "F")
        self.set_font(self.font_name, "B", 8)
        self.set_text_color(*self.LIGHT_GRAY)
        self.set_y(6)
        self.cell(0, 5, "E-Ticaret Yönetim Sistemi - Proje Dokümantasyonu", align="L")
        self.cell(0, 5, f"Sayfa {self.page_no()}", align="R")
        self.ln(10)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_draw_color(*self.DIVIDER)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)
        self.set_font(self.font_name, "I", 7)
        self.set_text_color(*self.LIGHT_GRAY)
        self.cell(0, 5, "Bu döküman staj projesi kapsamında hazırlanmıştır.  |  Mart 2026", align="C")

    def cover_page(self):
        self.add_page()
        self.set_fill_color(*self.DARK)
        self.rect(0, 0, 210, 297, "F")
        
        # Top accent bar
        self.set_fill_color(*self.BRAND)
        self.rect(0, 0, 210, 6, "F")
        
        # Left accent
        self.set_fill_color(*self.BRAND)
        self.rect(0, 60, 4, 130, "F")
        
        # Title area
        self.set_y(70)
        self.set_x(20)
        self.set_font(self.font_name, "B", 32)
        self.set_text_color(*self.WHITE)
        self.cell(0, 16, "E-Ticaret Yönetim Sistemi", ln=True)
        
        self.set_x(20)
        self.set_font(self.font_name, "", 18)
        self.set_text_color(129, 140, 248) # indigo-400
        self.cell(0, 10, "Proje Teknik Dokümantasyonu", ln=True)
        
        self.ln(8)
        self.set_x(20)
        self.set_draw_color(*self.BRAND)
        self.set_line_width(0.8)
        self.line(20, self.get_y(), 100, self.get_y())
        self.ln(10)
        
        self.set_x(20)
        self.set_font(self.font_name, "B", 14)
        self.set_text_color(*self.WHITE)
        self.cell(0, 8, "Uçtan Uca Ürün ve Kategori Yönetim Platformu", ln=True)
        
        self.ln(25)
        
        # Info boxes
        info = [
            ("Proje Tipi", "Staj Projesi - E-Ticaret Sistemi"),
            ("Hazırlayan", "Rıdvan Emre Bayar"),
            ("Frontend", "Next.js 16 + React 19 + TypeScript + Tailwind CSS"),
            ("Backend", ".NET Core Web API + Entity Framework Core"),
            ("Veritabanı", "SQL Server (6 Tablo, İlişkisel)"),
            ("Tarih", "Mart 2026"),
        ]
        
        for label, value in info:
            self.set_x(20)
            self.set_font(self.font_name, "B", 9)
            self.set_text_color(*self.LIGHT_GRAY)
            self.cell(40, 7, label.upper())
            self.set_font(self.font_name, "", 10)
            self.set_text_color(*self.WHITE)
            self.cell(0, 7, value, ln=True)
            self.ln(2)

    def section_title(self, number, title):
        self.ln(6)
        if self.get_y() > 255:
            self.add_page()
        self.set_fill_color(*self.BRAND)
        self.rect(10, self.get_y(), 190, 12, "F")
        self.set_font(self.font_name, "B", 13)
        self.set_text_color(*self.WHITE)
        self.set_x(14)
        self.cell(0, 12, f"{number}. {title}")
        self.ln(16)

    def sub_title(self, number, title):
        self.ln(3)
        if self.get_y() > 265:
            self.add_page()
        self.set_font(self.font_name, "B", 11)
        self.set_text_color(*self.BRAND)
        self.set_x(12)
        self.cell(0, 8, f"{number} {title}", ln=True)
        self.set_draw_color(*self.BRAND)
        self.set_line_width(0.3)
        self.line(12, self.get_y(), 80, self.get_y())
        self.ln(3)

    def sub_sub_title(self, title):
        self.ln(2)
        if self.get_y() > 268:
            self.add_page()
        self.set_font(self.font_name, "B", 10)
        self.set_text_color(*self.DARK)
        self.set_x(12)
        self.cell(0, 7, title, ln=True)
        self.ln(1)

    def body_text(self, text):
        self.set_font(self.font_name, "", 9)
        self.set_text_color(*self.GRAY)
        self.set_x(12)
        self.multi_cell(186, 5.5, text)
        self.ln(1)

    def bold_text(self, text):
        self.set_font(self.font_name, "B", 9)
        self.set_text_color(*self.DARK)
        self.set_x(12)
        self.multi_cell(186, 5.5, text)
        self.ln(1)

    def bullet(self, text, indent=12):
        self.set_font(self.font_name, "", 9)
        self.set_text_color(*self.GRAY)
        self.set_x(indent)
        self.cell(5, 5.5, "•")
        self.multi_cell(181 - (indent - 12), 5.5, text)

    def info_box(self, text, color=None):
        if color is None:
            color = self.BRAND
        if self.get_y() > 260:
            self.add_page()
        y = self.get_y()
        self.set_fill_color(color[0], color[1], color[2])
        self.rect(12, y, 2.5, 14, "F")
        bg = (color[0]//10 + 230, color[1]//10 + 230, color[2]//10 + 230)
        self.set_fill_color(*bg)
        self.rect(14.5, y, 183.5, 14, "F")
        self.set_xy(18, y + 2)
        self.set_font(self.font_name, "I", 8.5)
        self.set_text_color(*self.GRAY)
        self.multi_cell(178, 5, text)
        self.set_y(y + 16)

    def draw_table(self, headers, rows, col_widths=None):
        if col_widths is None:
            total = 186
            col_widths = [total / len(headers)] * len(headers)
        
        # Header
        if self.get_y() > 240:
            self.add_page()
        self.set_fill_color(*self.TABLE_HEADER_BG)
        self.set_font(self.font_name, "B", 8)
        self.set_text_color(*self.WHITE)
        x_start = 12
        self.set_x(x_start)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 9, f" {h}", border=0, fill=True)
        self.ln()
        
        # Rows
        self.set_font(self.font_name, "", 8)
        for idx, row in enumerate(rows):
            if self.get_y() > 270:
                self.add_page()
                self.set_fill_color(*self.TABLE_HEADER_BG)
                self.set_font(self.font_name, "B", 8)
                self.set_text_color(*self.WHITE)
                self.set_x(x_start)
                for i, h in enumerate(headers):
                    self.cell(col_widths[i], 9, f" {h}", border=0, fill=True)
                self.ln()
                self.set_font(self.font_name, "", 8)
            
            if idx % 2 == 1:
                self.set_fill_color(*self.TABLE_ROW_ALT)
            else:
                self.set_fill_color(*self.WHITE)
            self.set_text_color(*self.DARK)
            self.set_x(x_start)
            for i, cell_text in enumerate(row):
                self.cell(col_widths[i], 8, f" {cell_text}", border=0, fill=True)
            self.ln()
        
        # Bottom border
        self.set_draw_color(*self.DIVIDER)
        self.line(x_start, self.get_y(), x_start + sum(col_widths), self.get_y())
        self.ln(3)

    def status_badge(self, text, color):
        x = self.get_x()
        y = self.get_y()
        w = self.get_string_width(text) + 8
        self.set_fill_color(*color)
        self.rect(x, y + 1, w, 6, "F")
        self.set_font(self.font_name, "B", 7)
        self.set_text_color(*self.WHITE)
        self.set_xy(x + 1, y + 1)
        self.cell(w - 2, 6, text, align="C")


def build_pdf():
    pdf = ProjectDoc()
    
    # ==================== COVER PAGE ====================
    pdf.cover_page()
    
    # ==================== TABLE OF CONTENTS ====================
    pdf.add_page()
    pdf.section_title("", "İÇİNDEKİLER")
    toc = [
        ("1", "Proje Genel Bakış", "Amaç, mimari, teknolojiler"),
        ("2", "Veritabanı Tasarımı", "Tablolar, ilişkiler, tasarım kararları"),
        ("3", "Frontend (Web Önyüz)", "Teknolojiler, sayfa detayları, bileşenler"),
        ("4", "Backend (Web API)", "Endpoint'ler, mimari, entegrasyon"),
        ("5", "Geliştirme Aşamaları", "Proje yol haritası ve görev planı"),
    ]
    for num, title, desc in toc:
        pdf.set_x(20)
        pdf.set_font(pdf.font_name, "B", 11)
        pdf.set_text_color(*pdf.BRAND)
        pdf.cell(10, 9, num)
        pdf.set_font(pdf.font_name, "B", 11)
        pdf.set_text_color(*pdf.DARK)
        pdf.cell(80, 9, title)
        pdf.set_font(pdf.font_name, "", 9)
        pdf.set_text_color(*pdf.LIGHT_GRAY)
        pdf.cell(0, 9, desc, ln=True)
        pdf.set_draw_color(*pdf.DIVIDER)
        pdf.line(20, pdf.get_y(), 198, pdf.get_y())
        pdf.ln(2)

    # ==================== 1. PROJE GENEL BAKIŞ ====================
    pdf.add_page()
    pdf.section_title("1", "PROJE GENEL BAKIŞ")
    
    pdf.sub_title("1.1", "Proje Tanımı")
    pdf.body_text("E-Ticaret Yönetim Sistemi, ürünleri ve ürün gruplarını (kategorileri) ekleyebildiğimiz, düzenleyebildiğimiz, silebildiğimiz ve gelişmiş arama/filtreleme yapabildiğimiz uçtan uca bir yönetim platformudur.")
    pdf.body_text("Proje, staj süresince belirlenen görevler doğrultusunda aşamalı olarak geliştirilecektir. Veritabanı tasarımı, frontend arayüzleri, backend API geliştirme ve uçtan uca entegrasyon aşamalarından oluşmaktadır.")
    
    pdf.sub_title("1.2", "Sistem Mimarisi")
    pdf.body_text("Proje 3 katmanlı (Three-tier) mimari ile tasarlanmıştır:")
    pdf.ln(2)
    
    pdf.draw_table(
        ["Katman", "Teknoloji", "Açıklama"],
        [
            ["Sunum (Frontend)", "Next.js 16 + React 19 + TypeScript", "Kullanıcı arayüzü, SPA"],
            ["İş Mantığı (Backend)", ".NET Core Web API", "RESTful API, iş kuralları"],
            ["Veri (Veritabanı)", "SQL Server + EF Core", "Veri depolama, ORM"],
        ],
        [50, 65, 71]
    )
    
    pdf.sub_title("1.3", "Teknoloji Yığını")
    
    pdf.sub_sub_title("Frontend Teknolojileri")
    pdf.draw_table(
        ["Teknoloji", "Versiyon", "Açıklama"],
        [
            ["Next.js", "16.1.6", "React tabanlı full-stack web framework (App Router)"],
            ["React", "19.2.3", "Kullanıcı arayüzü kütüphanesi (component-based)"],
            ["TypeScript", "^5", "Tip güvenliği sağlayan JavaScript üst kümesi"],
            ["Tailwind CSS", "^4", "Utility-first CSS framework"],
            ["Lucide React", "^0.577.0", "SVG ikon kütüphanesi (200+ ikon)"],
            ["Zustand", "^5.0.11", "Hafif global durum yönetimi kütüphanesi"],
        ],
        [40, 30, 116]
    )
    
    pdf.sub_sub_title("Backend Teknolojileri")
    pdf.draw_table(
        ["Teknoloji", "Açıklama"],
        [
            [".NET Core", "Cross-platform Web API framework"],
            ["Entity Framework Core", "ORM - Veritabanı sorgulama ve migration"],
            ["SQL Server", "İlişkisel veritabanı yönetim sistemi (Express)"],
            ["JWT Bearer", "Token tabanlı kimlik doğrulama (ileri düzey)"],
        ],
        [50, 136]
    )

    # ==================== 2. VERİTABANI TASARIMI ====================
    pdf.add_page()
    pdf.section_title("2", "VERİTABANI TASARIMI")
    
    pdf.sub_title("2.1", "Tablolar ve Alanlar")
    
    # Categories
    pdf.sub_sub_title("Categories (Ürün Grupları / Kategoriler)")
    pdf.draw_table(
        ["Alan", "Veri Tipi", "Kısıtlama", "Açıklama"],
        [
            ["CategoryId", "int", "PK, Identity", "Benzersiz kategori kimliği"],
            ["Name", "nvarchar(100)", "NOT NULL", "Kategori adı"],
            ["Description", "nvarchar(500)", "NULL", "Kategori açıklaması"],
            ["ImageUrl", "nvarchar(500)", "NULL", "Kategori görsel URL'i"],
            ["IsDeleted", "bit", "NOT NULL, Default(0)", "Soft delete flag"],
            ["CreatedBy", "nvarchar(100)", "NULL", "Oluşturan kullanıcı"],
            ["CreatedAt", "datetime2", "NOT NULL, Default", "Oluşturulma tarihi"],
            ["UpdatedBy", "nvarchar(100)", "NULL", "Güncelleyen kullanıcı"],
            ["UpdatedAt", "datetime2", "NULL", "Güncellenme tarihi"],
        ],
        [32, 35, 50, 69]
    )
    
    # Products
    pdf.sub_sub_title("Products (Ürünler)")
    pdf.draw_table(
        ["Alan", "Veri Tipi", "Kısıtlama", "Açıklama"],
        [
            ["ProductId", "int", "PK, Identity", "Benzersiz ürün kimliği"],
            ["CategoryId", "int", "FK, NOT NULL", "Bağlı olduğu kategori"],
            ["Name", "nvarchar(200)", "NOT NULL", "Ürün adı"],
            ["Description", "nvarchar(2000)", "NULL", "Ürün açıklaması"],
            ["SKU", "nvarchar(50)", "NOT NULL, Unique", "Stok kodu (oto-üretilir veya manuel)"],
            ["Price", "decimal(18,2)", "NOT NULL", "Güncel satış fiyatı (TL)"],
            ["OriginalPrice", "decimal(18,2)", "NULL", "İndirim varsa liste fiyatı (TL)"],
            ["IsDiscount", "bit", "NOT NULL, Default(0)", "İndirim aktif mi?"],
            ["Stock", "int", "NOT NULL, Default(0)", "Stok miktarı"],
            ["Status", "nvarchar(20)", "NOT NULL, CHECK", "Yalnızca active, inactive, draft (yazım hatası engeli)"],
            ["ImageUrl", "nvarchar(500)", "NULL", "Ürün görsel URL'i"],
            ["IsDeleted", "bit", "NOT NULL, Default(0)", "Soft delete flag"],
            ["CreatedBy", "nvarchar(100)", "NULL", "Oluşturan kullanıcı"],
            ["CreatedAt", "datetime2", "NOT NULL, Default", "Oluşturulma tarihi"],
            ["UpdatedBy", "nvarchar(100)", "NULL", "Güncelleyen kullanıcı"],
            ["UpdatedAt", "datetime2", "NULL", "Güncellenme tarihi"],
        ],
        [32, 35, 50, 69]
    )
    pdf.info_box("Not: Güncel fiyat Products tablosunda tutulur (hızlı erişim). Fiyat değişiklik geçmişi ProductPrices tablosunda loglanır. SKU, silinmiş ürünler dahil tabloda benzersiz kalır (SKU yeniden kullanılmaz; aşağıdaki SKU politikası). CHECK (indirim): IsDiscount = 0 iken OriginalPrice IS NULL; IsDiscount = 1 iken OriginalPrice IS NOT NULL ve Price < OriginalPrice.")

    # ProductPrices
    pdf.sub_sub_title("ProductPrices (Ürün Fiyat Geçmişi — Append-Only Log)")
    pdf.draw_table(
        ["Alan", "Veri Tipi", "Kısıtlama", "Açıklama"],
        [
            ["ProductPriceId", "int", "PK, Identity", "Benzersiz fiyat kaydı kimliği"],
            ["ProductId", "int", "FK, NOT NULL", "İlişkili ürün"],
            ["Price", "decimal(18,2)", "NOT NULL", "O andaki satış fiyatı (kayıt anındaki değer, TL)"],
            ["OriginalPrice", "decimal(18,2)", "NULL", "İndirimliyse o andaki liste fiyatı; indirim yoksa NULL"],
            ["IsDiscount", "bit", "NOT NULL, Default(0)", "Bu kayıt indirimli fiyat mıydı?"],
            ["CreatedBy", "nvarchar(100)", "NULL", "Kaydı ekleyen kullanıcı"],
            ["CreatedAt", "datetime2", "NOT NULL", "Kayıt zamanı (fiyatın geçerli olduğu an)"],
        ],
        [32, 35, 50, 69]
    )
    pdf.info_box("Güncel fiyat Products tablosundan okunur. Bu tablo yalnızca INSERT ile büyür: her fiyat değişikliğinde yeni satır eklenir, eski satırlar güncellenmez. OriginalPrice ile indirim anındaki liste fiyatı geçmişte de raporlanabilir. Geçmiş satırın ne zaman bittiği, bir sonraki kaydın CreatedAt değeri ile çıkarılır. Products ile aynı indirim CHECK kuralı bu tabloda da uygulanır (log satırı tutarlılığı).")

    # Features
    pdf.sub_sub_title("Features (Özellik Tanımları)")
    pdf.draw_table(
        ["Alan", "Veri Tipi", "Kısıtlama", "Açıklama"],
        [
            ["FeatureId", "int", "PK, Identity", "Benzersiz özellik kimliği"],
            ["Name", "nvarchar(100)", "NOT NULL", "Özellik adı (Renk, Ağırlık vb.)"],
            ["IsDeleted", "bit", "NOT NULL, Default(0)", "Soft delete (tanım kaldırıldı, FK bütünlüğü korunur)"],
            ["CreatedBy", "nvarchar(100)", "NULL", "Oluşturan kullanıcı"],
            ["CreatedAt", "datetime2", "NOT NULL", "Oluşturulma tarihi"],
            ["UpdatedBy", "nvarchar(100)", "NULL", "Güncelleyen kullanıcı"],
            ["UpdatedAt", "datetime2", "NULL", "Güncellenme tarihi"],
        ],
        [32, 35, 50, 69]
    )
    pdf.info_box("Filtreli UNIQUE indeks: IsDeleted = 0 olan satırlarda Name alanı benzersiz olmalı (aynı aktif özellik adı iki kez tanımlanamaz). Silinmiş kayıtlar indekse dahil edilmez.")

    # ProductFeatures
    pdf.sub_sub_title("ProductFeatures (Ürün Özellikleri - Ara Tablo)")
    pdf.draw_table(
        ["Alan", "Veri Tipi", "Kısıtlama", "Açıklama"],
        [
            ["ProductFeatureId", "int", "PK, Identity", "Benzersiz kayıt kimliği"],
            ["ProductId", "int", "FK, NOT NULL", "İlişkili ürün"],
            ["FeatureId", "int", "FK, NOT NULL", "İlişkili özellik tanımı"],
            ["Value", "nvarchar(500)", "NOT NULL", "Değer (Kırmızı, 2.5kg vb.)"],
            ["SortOrder", "int", "NOT NULL, Default(0)", "Listeleme/sürükle-bırak sırası"],
            ["CreatedBy", "nvarchar(100)", "NULL", "Oluşturan kullanıcı"],
            ["CreatedAt", "datetime2", "NOT NULL", "Oluşturulma tarihi"],
            ["UpdatedBy", "nvarchar(100)", "NULL", "Güncelleyen kullanıcı"],
            ["UpdatedAt", "datetime2", "NULL", "Güncellenme tarihi"],
        ],
        [32, 35, 50, 69]
    )
    pdf.info_box("UNIQUE (ProductId, FeatureId): Aynı üründe aynı özellik tanımı yalnızca bir kez atanabilir. Değer veya sıra değişikliği UPDATE ile yapılır.")

    # Users
    pdf.sub_sub_title("Users (Kullanıcılar - İleri Düzey)")
    pdf.draw_table(
        ["Alan", "Veri Tipi", "Kısıtlama", "Açıklama"],
        [
            ["UserId", "int", "PK, Identity", "Benzersiz kullanıcı kimliği"],
            ["Name", "nvarchar(100)", "NOT NULL", "Ad"],
            ["Surname", "nvarchar(100)", "NOT NULL", "Soyad"],
            ["Email", "nvarchar(200)", "NOT NULL, UNIQUE", "E-posta adresi"],
            ["PasswordHash", "nvarchar(500)", "NOT NULL", "Hashlenmiş şifre"],
            ["Role", "nvarchar(50)", "NOT NULL", "Rol (Admin/User)"],
            ["IsActive", "bit", "NOT NULL, Default(1)", "Hesap aktif mi? (giriş engelleme)"],
            ["CreatedAt", "datetime2", "NOT NULL", "Kayıt tarihi"],
            ["UpdatedAt", "datetime2", "NULL", "Güncellenme tarihi"],
        ],
        [32, 35, 50, 69]
    )

    # 2.2 Relations
    pdf.sub_title("2.2", "Tablo İlişkileri")
    pdf.draw_table(
        ["İlişki", "Tip", "Açıklama"],
        [
            ["Categories -> Products", "1:N", "Bir kategori birden fazla ürün içerir"],
            ["Products -> ProductPrices", "1:N", "Bir ürünün birden fazla fiyat kaydı olabilir"],
            ["Products -> ProductFeatures", "1:N", "Bir ürünün birden fazla özelliği olabilir"],
            ["Features -> ProductFeatures", "1:N", "Bir özellik birden fazla ürüne atanabilir"],
        ],
        [55, 20, 111]
    )

    # 2.3 Design Decisions
    pdf.sub_title("2.3", "Tasarım Kararları")
    
    pdf.sub_sub_title("Soft Delete Mekanizması")
    pdf.body_text("Categories, Products ve Features tablolarında IsDeleted alanı kullanılır. Kayıtlar fiziksel olarak silinmez, IsDeleted = true yapılır. Özellik tanımları (Features) silindiğinde ProductFeatures ile FK ilişkisi bozulmaz; sorgularda IsDeleted = false filtrelenir.")
    
    pdf.sub_sub_title("SKU (Stok Kodu) Üretimi")
    pdf.body_text("SKU, ürünü benzersiz şekilde tanımlayan stok kodudur. Hibrit bir yaklaşım uygulanır:")
    pdf.bullet("Otomatik üretim: Kategori adının ilk 3 harfi (büyük) + '-' + 5 haneli sıra numarası. Örnek: Elektronik → ELK-00001, Giyim → GYM-00001")
    pdf.bullet("Manuel giriş: Admin isterse kendi SKU kodunu girebilir (Unique kısıtlaması ile çakışma engellenir)")
    pdf.bullet("Backend ürün oluşturulurken SKU boş bırakılırsa otomatik üretir, doluysa girilen değeri kullanır")
    pdf.body_text("SKU, soft delete sonrası da tabloda aynı değerle kalır ve UNIQUE kısıtı tüm satırlar için geçerlidir (silinmiş ürün de SKU'yu 'işgal' eder). Öneri: SKU'yu kasıtlı olarak yeniden kullanmamak; eski sipariş, fatura ve stok izinde karışıklığı önler. İleride aynı kodun başka üründe kullanılması şartsa, yalnızca yönetici işlemiyle silinen kaydın SKU'su anlamlı bir önek ile değiştirilir (ör. ZZZ-ARCHIVED-{id}), ardından yeni ürüne atanır.")

    pdf.sub_sub_title("Fiyat Yönetimi (Hibrit + Düzenlenebilir Güncel Fiyat)")
    pdf.body_text("Admin panelde düzenlenen güncel fiyat Products tablosundadır (Price, OriginalPrice, IsDiscount). Büyük ölçekte liste, filtre ve sıralama tek sorguda kalır.")
    pdf.body_text("ProductPrices yalnızca fiyat geçmişidir: normal akışta satırlar UPDATE edilmez (append-only). Her anlamlı fiyat değişikliğinde yeni INSERT yapılır; geçmiş satırlar denetim için olduğu gibi kalır.")
    pdf.bold_text("Fiyat güncelleme akışı (tek transaction):")
    pdf.bullet("1. ProductPrices tablosuna yeni satır eklenir (Price, OriginalPrice, IsDiscount — Products ile aynı anlık değerlerin kopyası)")
    pdf.bullet("2. Products tablosundaki Price, OriginalPrice, IsDiscount alanları yeni değerlere güncellenir")
    pdf.body_text("Ürün ilk oluşturulurken de aynı mantık uygulanır: Products doldurulur ve ilk fiyat ProductPrices'a bir kayıt olarak yazılır.")
    pdf.bold_text("İndirim kuralları (Products):")
    pdf.bullet("İndirim uygulandığında: OriginalPrice = liste fiyatı, Price = indirimli satış fiyatı, IsDiscount = true")
    pdf.bullet("İndirim kaldırıldığında: Price = OriginalPrice, OriginalPrice = NULL, IsDiscount = false")
    pdf.bullet("Normal fiyat güncellemesinde: Price güncellenir, IsDiscount = false, OriginalPrice = NULL")
    
    pdf.sub_sub_title("EAV (Entity-Attribute-Value) Modeli")
    pdf.body_text("Ürün özellikleri dinamik olarak yönetilir. Features tablosu özellik tanımlarını (Renk, Ağırlık, Malzeme vb.), ProductFeatures tablosu ise ürünlere atanan değerleri tutar. Bu sayede yeni özellikler veritabanı şema değişikliği gerektirmeden eklenebilir.")

    pdf.sub_sub_title("Özellik Tanımları ve Ürün Özellikleri (CRUD)")
    pdf.body_text("Features: Yeni özellik adı eklenebilir, mevcut ad güncellenebilir, kullanılmayan tanım IsDeleted ile kapatılabilir.")
    pdf.body_text("ProductFeatures: Ürüne özellik atanır (INSERT), değer veya sıra değişir (UPDATE Value veya SortOrder), özellik üründen kaldırılır (DELETE veya soft delete politikasına göre). Sürükle-bırak sırası SortOrder ile kalıcıdır.")

    pdf.sub_sub_title("Kullanıcı Hesapları")
    pdf.body_text("Users tablosunda IsActive = false ile giriş engellenir; kayıt silinmeden hesap pasifleştirilebilir.")

    pdf.sub_sub_title("Audit (Denetim) Alanları")
    pdf.body_text("Categories, Products, Features, ProductFeatures ve ilgili tablolarda oluşturma ve güncelleme izi tutulur. ProductPrices append-only olduğundan yalnızca CreatedBy ve CreatedAt kullanılır; geçmiş satır değiştirilmez.")

    pdf.sub_sub_title("CHECK Kısıtlamaları ve Filtreli İndeks (Uygulanacak)")
    pdf.body_text("Products.Status: CHECK ile yalnızca 'active', 'inactive', 'draft' değerlerine izin verilir.")
    pdf.body_text("Products ve ProductPrices (indirim): IsDiscount = 0 ise OriginalPrice NULL olmalı; IsDiscount = 1 ise OriginalPrice NOT NULL ve satış fiyatı liste fiyatından düşük olmalı (Price < OriginalPrice).")
    pdf.body_text("Features: SQL Server'da filtreli benzersiz indeks — UNIQUE(Name) WHERE IsDeleted = 0.")
    pdf.body_text("Rating ve ReviewCount: Bu projede veritabanında tutulmaz; önyüzde yalnızca gösterim amaçlıdır (mock veya sabit değer).")

    # ==================== 3. FRONTEND ====================
    pdf.add_page()
    pdf.section_title("3", "FRONTEND (WEB ÖNYÜZ)")
    
    pdf.sub_title("3.1", "Proje Dosya Yapısı")
    structure = """frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    Root layout
│   │   ├── page.tsx                       Ana sayfa (/login yönlendirmesi)
│   │   ├── globals.css                   Global stiller
│   │   ├── login/page.tsx               Giriş sayfası
│   │   └── (admin)/
│   │       ├── layout.tsx                Admin layout (Sidebar + Header)
│   │       ├── dashboard/page.tsx     Dashboard
│   │       ├── categories/page.tsx    Kategori listeleme
│   │       ├── categories/create/     Kategori oluşturma
│   │       ├── products/page.tsx       Ürün listeleme
│   │       ├── products/create/        Ürün oluşturma
│   │       └── products/search/        Ürün arama
│   ├── components/
│   │   ├── Sidebar.tsx                    Yan menü bileşeni
│   │   └── Header.tsx                     Üst başlık bileşeni
│   └── lib/
│       └── api.ts                              API çağrıları ve TypeScript arayüzleri
├── package.json                              Bağımlılıklar ve script'ler
├── tsconfig.json                              TypeScript yapılandırması
└── next.config.ts                             Next.js yapılandırması"""
    pdf.set_font(pdf.font_name, "", 7.5)
    pdf.set_text_color(*pdf.GRAY)
    pdf.set_x(14)
    pdf.multi_cell(180, 4.2, structure)
    pdf.ln(4)
    
    pdf.sub_title("3.2", "Sayfa Detayları")
    
    # Login
    pdf.sub_sub_title("Giriş Sayfası (/login)")
    pdf.body_text("Kullanıcı kimlik doğrulama ekranı. İki panelli düzen: Sol panel (masaüstü) koyu arka planda logo, tanıtım yazıları, 3 özellik kartı ve istatistikler içerir. Sağ panel giriş formunu barındırır.")
    pdf.bold_text("Form Alanları:")
    pdf.bullet("E-posta adresi (email input)")
    pdf.bullet("Şifre (password input, göster/gizle toggle)")
    pdf.bullet("Beni hatırla (checkbox)")
    pdf.bullet("Giriş Yap butonu (loading spinner desteği)")
    pdf.body_text("Validasyon: Boş alan kontrolü yapılır. Backend entegrasyonunda JWT tabanlı gerçek kimlik doğrulama kullanılacaktır.")
    
    # Dashboard
    pdf.sub_sub_title("Dashboard (/dashboard)")
    pdf.body_text("Genel bakış ve özet istatistikler sayfası. Server component olarak render edilecektir.")
    pdf.bold_text("Bölümler:")
    pdf.bullet("4 İstatistik Kartı: Toplam Ürün, Toplam Kategori, Toplam Sipariş, Toplam Gelir. Her kartta büyüme yüzdesi (yeşil/kırmızı ok).")
    pdf.bullet("Son Siparişler: Müşteri adı, ürün, tutar, sipariş durumu (Tamamlandı/İşleniyor/Kargoda/Bekliyor).")
    pdf.bullet("Kategori Dağılımı: Her kategorinin ürün sayısı yüzde barı ile gösterilir.")
    pdf.bullet("Öne Çıkan Ürünler Tablosu: Görsel, ad, SKU, kategori, fiyat, stok, durum sütunları.")
    
    # Category List
    pdf.sub_sub_title("Kategori Listeleme (/categories)")
    pdf.body_text("Tüm kategorileri tablo halinde listeleyen, arama ve silme işlemlerini destekleyen sayfa.")
    pdf.bold_text("Özellikler:")
    pdf.bullet("Arama çubuğu: Kategori adı ve açıklamasında arama")
    pdf.bullet("4 Özet kartı: Toplam Kategori, Toplam Ürün, En Çok Ürün İçeren, Ortalama Ürün")
    pdf.bullet("Tablo: Kategori (görsel+ad+Id), Açıklama, Ürün Sayısı, Tarih, İşlemler (Düzenle/Sil)")
    pdf.bullet("Silme: Onay modal'ı ile soft delete işlemi")
    
    # Category Create
    pdf.sub_sub_title("Kategori Oluşturma (/categories/create)")
    pdf.body_text("Yeni kategori ekleme formu. Alanlar: Kategori Adı (zorunlu, min 2 karakter), Açıklama (zorunlu), Görsel URL (opsiyonel, önizleme gösterilir). Validasyon sonrası başarı mesajı ve yönlendirme.")
    
    # Product List
    pdf.sub_sub_title("Ürün Listeleme (/products)")
    pdf.body_text("Tüm ürünleri filtreleme destekli tablo halinde listeleyen sayfa.")
    pdf.bold_text("Özellikler:")
    pdf.bullet("Arama: Ürün adı veya SKU'da case-insensitive arama")
    pdf.bullet("Filtreler: Kategoriye göre (dropdown) + Duruma göre (Aktif/Pasif/Taslak)")
    pdf.bullet("Tablo: Ürün (görsel+ad+SKU), Kategori, Fiyat (indirimli gösterim), Stok (renk kodlu), Puan, Durum, İşlemler")
    pdf.bullet("Silme: Onay modal'ı ile işlem")
    
    # Product Create
    pdf.sub_sub_title("Ürün Oluşturma (/products/create)")
    pdf.body_text("Yeni ürün ekleme formu. Üç bölümden oluşur:")
    pdf.bullet("Temel Bilgiler: Ürün adı, Açıklama (textarea), SKU, Kategori (dropdown)")
    pdf.bullet("Fiyat & Stok: Satış fiyatı (TL öneki), İndirim öncesi fiyat (opsiyonel, indirim % otomatik hesaplanır), Stok")
    pdf.bullet("Görsel & Durum: Görsel URL (önizleme), Yayın Durumu (Aktif/Pasif/Taslak buton grubu)")
    
    # Product Search
    pdf.sub_sub_title("Ürün Arama (/products/search)")
    pdf.body_text("Gelişmiş arama ve filtreleme sayfası.")
    pdf.bold_text("Özellikler:")
    pdf.bullet("Büyük arama kutusu: Ad, SKU, açıklama ve kategoride eşzamanlı arama")
    pdf.bullet("Genişletilir filtre paneli: Kategori, Durum, Min/Max Fiyat, Min Stok")
    pdf.bullet("Sıralama: İsme göre, Fiyat (artan/azalan), Stok, Puan")
    pdf.bullet("Görüntüleme modu: Grid (kart) veya Liste (satır) görünümü geçişi")
    
    # 3.3 Shared Components
    pdf.sub_title("3.3", "Ortak Bileşenler")
    
    pdf.sub_sub_title("Sidebar (Yan Menü)")
    pdf.bullet("Daraltılabilir tasarım: 260px (açık) / 72px (daraltılmış), tercih localStorage'da saklanacak")
    pdf.bullet("Navigasyon grupları: Genel (Dashboard), Kategoriler (Liste, Ekle), Ürünler (Liste, Ekle, Ara)")
    pdf.bullet("Aktif sayfa göstergesi: İndigo renkli vurgu ve ok ikonu")
    pdf.bullet("Alt bölüm: Kullanıcı bilgisi + Çıkış Yap linki")
    
    pdf.sub_sub_title("Header (Üst Başlık)")
    pdf.bullet("Dinamik başlık: URL'ye göre sayfa adı ve alt başlık otomatik değişecek")
    pdf.bullet("Aksiyonlar: Bildirim ikonu, Ayarlar ikonu, Kullanıcı avatarı")
    pdf.bullet("Sticky pozisyon: Sayfa kaydırılırken üstte sabit kalacak")
    
    # 3.4 Design principles
    pdf.sub_title("3.4", "Tasarım Prensipleri")
    pdf.bullet("Responsive Tasarım: Tüm sayfalar mobil, tablet ve masaüstü uyumlu (Tailwind breakpoints)")
    pdf.bullet("Renk Paleti: Slate tonları (arka plan), Indigo (marka rengi), Emerald (başarı), Red (hata), Amber (uyarı)")
    pdf.bullet("Bileşen Tabanlı Mimari: Her UI öğesi ayrı React bileşeni olarak yapılandırılacak")
    pdf.bullet("Client/Server Component Ayrımı: Dashboard server component, form sayfaları client component")
    pdf.bullet("Türkçe Dil Desteği: Tüm arayüz Türkçe, tarih formatları tr-TR locale ile gösterilecek")

    # ==================== 4. BACKEND ====================
    pdf.add_page()
    pdf.section_title("4", "BACKEND (WEB API)")
    
    pdf.sub_title("4.1", "Proje Yapısı")
    structure_be = """backend/
├── Controllers/          API endpoint tanımları
│   ├── CategoriesController.cs
│   ├── ProductsController.cs
│   ├── FeaturesController.cs          # Özellik kataloğu: /api/features
│   ├── ProductFeaturesController.cs   # Ürün–özellik: /api/products/{id}/features (veya ProductsController içi)
│   ├── ProductPricesController.cs
│   └── AuthController.cs
├── Models/                  Entity sınıfları (6 tablo)
├── Data/
│   └── AppDbContext.cs   EF Core veritabanı bağlamı
├── DTOs/                    Data Transfer Object'ler
├── Services/               İş mantığı servisleri
├── Program.cs             Uygulama başlangıcı
├── appsettings.json     Yapılandırma
└── backend.csproj        Proje dosyası"""
    pdf.set_font(pdf.font_name, "", 7.5)
    pdf.set_text_color(*pdf.GRAY)
    pdf.set_x(14)
    pdf.multi_cell(180, 4.2, structure_be)
    pdf.ln(4)
    
    pdf.sub_title("4.2", "API Endpoint'leri")
    
    pdf.sub_sub_title("Categories Endpoint'leri")
    pdf.draw_table(
        ["Method", "Endpoint", "Açıklama"],
        [
            ["GET", "/api/categories", "Tüm kategorileri listele"],
            ["GET", "/api/categories/{id}", "Id'ye göre tek kategori getir"],
            ["POST", "/api/categories", "Yeni kategori oluştur"],
            ["PUT", "/api/categories/{id}", "Kategori güncelle"],
            ["DELETE", "/api/categories/{id}", "Kategori sil (soft delete)"],
        ],
        [22, 60, 104]
    )
    
    pdf.sub_sub_title("Products Endpoint'leri")
    pdf.draw_table(
        ["Method", "Endpoint", "Açıklama"],
        [
            ["GET", "/api/products", "Ürünleri listele (filtre + arama)"],
            ["GET", "/api/products/{id}", "Tek ürün getir (güncel fiyat dahil)"],
            ["POST", "/api/products", "Yeni ürün oluştur (fiyat ile birlikte)"],
            ["PUT", "/api/products/{id}", "Ürün bilgilerini güncelle"],
            ["DELETE", "/api/products/{id}", "Ürün sil (soft delete)"],
            ["GET", "/api/products/search?q=..", "Ürün arama (ad, açıklama, kategori)"],
        ],
        [22, 60, 104]
    )
    
    pdf.sub_sub_title("ProductPrices Endpoint'leri")
    pdf.draw_table(
        ["Method", "Endpoint", "Açıklama"],
        [
            ["GET", "/api/products/{id}/prices", "Ürünün fiyat geçmişini getir"],
            ["POST", "/api/products/{id}/prices", "Yeni fiyat kaydı ekle"],
        ],
        [22, 60, 104]
    )
    
    pdf.sub_sub_title("Features Endpoint'leri (özellik kataloğu — Features tablosu)")
    pdf.body_text(
        "Yalnızca tanım: özellik adı (Renk, Ağırlık vb.). Değerler ProductFeatures üzerinden ürüne bağlanır."
    )
    pdf.draw_table(
        ["Method", "Endpoint", "Açıklama"],
        [
            ["GET", "/api/features", "Tüm özellik tanımlarını listele (aktifler; sayfalama isteğe bağlı)"],
            ["GET", "/api/features/{featureId}", "Tek özellik tanımını getir"],
            ["POST", "/api/features", "Yeni özellik tanımı oluştur (Name)"],
            ["PUT", "/api/features/{featureId}", "Özellik adını güncelle"],
            ["DELETE", "/api/features/{featureId}", "Özellik tanımını kapat (soft delete, IsDeleted)"],
        ],
        [22, 58, 106]
    )
    pdf.ln(2)

    pdf.sub_sub_title("ProductFeatures Endpoint'leri (ürün–özellik ataması — ProductFeatures tablosu)")
    pdf.body_text(
        "Ürünün alt kaynağı: hangi özellik hangi değerle (Value) ve sırada (SortOrder) bağlı. "
        "{productId} ve {featureId}, ilgili tablodaki PK'lar ile uyumludur."
    )
    pdf.draw_table(
        ["Method", "Endpoint", "Açıklama"],
        [
            ["GET", "/api/products/{productId}/features", "Ürüne atanmış özellikleri listele (tanım + Value + SortOrder)"],
            ["POST", "/api/products/{productId}/features", "Ürüne bir özellik bağla (gövde: featureId, value; sortOrder isteğe bağlı)"],
            ["PUT", "/api/products/{productId}/features/{featureId}", "Bu üründeki özelliğin Value ve/veya SortOrder değerini güncelle"],
            ["DELETE", "/api/products/{productId}/features/{featureId}", "Üründen bu özellik atamasını kaldır"],
            ["PUT", "/api/products/{productId}/features", "İsteğe bağlı: ürünün tüm özellik listesini toplu senkronize et (gövde: özellik dizisi)"],
        ],
        [22, 58, 106]
    )
    pdf.info_box(
        "Özet: /api/features → sözlük (Features). /api/products/{productId}/features → ürün başına atanmış "
        "kayıtlar (ProductFeatures). İkisi farklı controller veya ProductsController alt aksiyonları ile uygulanabilir."
    )
    
    pdf.sub_sub_title("Auth Endpoint'leri (İleri Düzey)")
    pdf.draw_table(
        ["Method", "Endpoint", "Açıklama"],
        [
            ["POST", "/api/auth/register", "Yeni kullanıcı kaydı"],
            ["POST", "/api/auth/login", "Giriş - JWT token döner"],
        ],
        [22, 60, 104]
    )
    
    # 4.3 Integration
    pdf.sub_title("4.3", "Frontend-Backend Entegrasyonu")
    pdf.body_text("Entegrasyon aşamasında frontend, backend API'ye HTTP istekleri göndererek gerçek veritabanı verileri ile çalışacaktır.")
    
    pdf.bold_text("Bağlantı Yöntemi:")
    pdf.bullet("Frontend (Next.js, localhost:3000) -> Backend (.NET Core, localhost:5000)")
    pdf.bullet("HTTP istekleri: fetch API veya axios kütüphanesi ile yapılacak")
    pdf.bullet("Backend'de CORS politikası açılarak frontend origin'e izin verilecek")
    pdf.bullet("Veriler JSON formatında aktarılacak")
    pdf.bullet("JWT token localStorage'da saklanacak, her istekte Authorization header gönderilecek")
    
    pdf.ln(3)
    pdf.info_box("Veri Akışı: Frontend sayfa yüklendiğinde API'ye GET isteği gönderecek -> Backend EF Core ile veritabanını sorgulayacak -> JSON response dönecek -> Frontend veriyi render edecek.")

    # ==================== 5. GELİŞTİRME AŞAMALARI ====================
    pdf.add_page()
    pdf.section_title("5", "GELİŞTİRME AŞAMALARI")
    
    pdf.sub_title("5.1", "Proje Yol Haritası")
    
    pdf.draw_table(
        ["Aşama", "Görev", "Açıklama"],
        [
            ["1. Veritabanı", "Tasarım ve Oluşturma", "ER diyagramı, tablo yapıları, ilişkiler, migration"],
            ["2. Frontend", "Web Önyüz Geliştirme", "Login, Kategori CRUD, Ürün CRUD, Arama, Menü"],
            ["3. Backend", "Web API Geliştirme", ".NET Core proje, EF Core, CRUD controller'lar"],
            ["4. Entegrasyon", "Uçtan Uca Birleştirme", "Frontend - Backend API bağlantısı, gerçek veri akışı"],
            ["5. İleri Düzey", "Kimlik Doğrulama", "JWT Auth, Kullanıcı yönetimi, Yetkilendirme"],
        ],
        [35, 55, 96]
    )
    
    pdf.sub_title("5.2", "Frontend Sayfa Listesi")
    pdf.draw_table(
        ["Sayfa", "Route", "Açıklama"],
        [
            ["Giriş / Login", "/login", "Kullanıcı kimlik doğrulama ekranı"],
            ["Dashboard", "/dashboard", "Genel bakış ve özet istatistikler"],
            ["Kategori Listeleme", "/categories", "Tüm kategorileri tablo ile görüntüleme"],
            ["Kategori Oluşturma", "/categories/create", "Yeni kategori ekleme formu"],
            ["Kategori Güncelleme", "/categories/[id]", "Mevcut kategori düzenleme formu"],
            ["Ürün Listeleme", "/products", "Tüm ürünleri filtreleme ile görüntüleme"],
            ["Ürün Oluşturma", "/products/create", "Yeni ürün ekleme formu"],
            ["Ürün Güncelleme", "/products/[id]", "Mevcut ürün düzenleme formu"],
            ["Ürün Arama", "/products/search", "Gelişmiş arama ve filtreleme"],
        ],
        [50, 50, 86]
    )

    # ==================== OUTPUT ====================
    output_path = r"c:\Users\ridva\Desktop\ECommerceWebsite\ETicaret_Proje_Dokumantasyonu.pdf"
    pdf.output(output_path)
    print(f"PDF oluşturuldu: {output_path}")

if __name__ == "__main__":
    build_pdf()

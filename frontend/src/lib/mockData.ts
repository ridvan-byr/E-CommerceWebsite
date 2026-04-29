export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  productCount: number;
  isDeleted: boolean;
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface ProductFeature {
  name: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  isDiscount: boolean;
  stock: number;
  category: string;
  categoryId: number;
  image: string;
  status: "active" | "inactive" | "draft";
  rating: number;
  reviewCount: number;
  sku: string;
  /** İsteğe bağlı; 8–14 haneli rakam (EAN vb.) */
  barcode?: string;
  features?: ProductFeature[];
  isDeleted: boolean;
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Elektronik",
    description: "Telefon, bilgisayar ve elektronik aksesuarlar",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
    productCount: 45,
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Giyim",
    description: "Erkek, kadın ve çocuk giyim ürünleri",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
    productCount: 128,
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-01-16",
  },
  {
    id: 3,
    name: "Ev & Yaşam",
    description: "Ev dekorasyon ve yaşam ürünleri",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    productCount: 67,
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-01-17",
  },
  {
    id: 4,
    name: "Spor",
    description: "Spor malzemeleri ve fitness ekipmanları",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    productCount: 89,
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-01-18",
  },
  {
    id: 5,
    name: "Kitap & Kırtasiye",
    description: "Kitap, dergi ve kırtasiye ürünleri",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
    productCount: 234,
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-01-19",
  },
  {
    id: 6,
    name: "Kozmetik",
    description: "Cilt bakımı, makyaj ve parfüm ürünleri",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    productCount: 92,
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-01-20",
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    description: "Apple'ın en gelişmiş akıllı telefonu. A17 Pro çip, titanium tasarım ve gelişmiş kamera sistemi.",
    price: 54999,
    originalPrice: 59999,
    isDiscount: true,
    stock: 50,
    category: "Elektronik",
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
    status: "active",
    rating: 4.8,
    reviewCount: 324,
    sku: "APL-IP15PM-256",
    barcode: "5901234123457",
    features: [
      { name: "Renk", value: "Titanium Siyah" },
      { name: "Depolama", value: "256 GB" },
      { name: "Ekran", value: "6.7 inç OLED" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-01",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    description: "Samsung'un amiral gemisi akıllı telefonu. S Pen dahil, 200MP kamera.",
    price: 49999,
    originalPrice: 54999,
    isDiscount: true,
    stock: 35,
    category: "Elektronik",
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80",
    status: "active",
    rating: 4.7,
    reviewCount: 218,
    sku: "SAM-GS24U-512",
    barcode: "8806095001234",
    features: [
      { name: "Renk", value: "Titanium Gri" },
      { name: "Depolama", value: "512 GB" },
      { name: "RAM", value: "12 GB" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-02",
  },
  {
    id: 3,
    name: "Nike Air Max 270",
    description: "Maksimum konfor ve stil için tasarlanmış Air Max 270 spor ayakkabı.",
    price: 3299,
    isDiscount: false,
    stock: 120,
    category: "Spor",
    categoryId: 4,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    status: "active",
    rating: 4.6,
    reviewCount: 567,
    sku: "NIKE-AM270-42",
    barcode: "1945007812345",
    features: [
      { name: "Renk", value: "Kırmızı/Beyaz" },
      { name: "Numara", value: "42" },
      { name: "Malzeme", value: "Mesh" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-03",
  },
  {
    id: 4,
    name: "MacBook Pro 14 M3",
    description: "Apple M3 Pro çipli MacBook Pro. Profesyonel iş akışları için mükemmel performans.",
    price: 84999,
    isDiscount: false,
    stock: 20,
    category: "Elektronik",
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
    status: "active",
    rating: 4.9,
    reviewCount: 145,
    sku: "APL-MBP14-M3",
    barcode: "0190199101234",
    features: [
      { name: "Renk", value: "Uzay Grisi" },
      { name: "RAM", value: "18 GB" },
      { name: "Depolama", value: "512 GB SSD" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-04",
  },
  {
    id: 5,
    name: "Levi's 501 Jeans",
    description: "Klasik kesim Levi's 501 kot pantolon. Her tarza uygun zamansız tasarım.",
    price: 1899,
    originalPrice: 2299,
    isDiscount: true,
    stock: 200,
    category: "Giyim",
    categoryId: 2,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    status: "active",
    rating: 4.5,
    reviewCount: 892,
    sku: "LEV-501-32-32",
    barcode: "5400587123456",
    features: [
      { name: "Renk", value: "Mavi" },
      { name: "Beden", value: "32/32" },
      { name: "Malzeme", value: "%100 Pamuk" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-05",
  },
  {
    id: 6,
    name: "IKEA KALLAX Kitaplık",
    description: "4x4 modüler kitaplık. Farklı düzenleme seçenekleriyle çok amaçlı kullanım.",
    price: 2499,
    isDiscount: false,
    stock: 45,
    category: "Ev & Yaşam",
    categoryId: 3,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    status: "active",
    rating: 4.4,
    reviewCount: 234,
    sku: "IKEA-KAL-4X4",
    barcode: "5012345678901",
    features: [
      { name: "Renk", value: "Beyaz" },
      { name: "Boyut", value: "147x147 cm" },
      { name: "Malzeme", value: "Sunta" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-06",
  },
  {
    id: 7,
    name: "Sony WH-1000XM5",
    description: "Sektörün en iyi gürültü önleme özelliğine sahip kablosuz kulaklık.",
    price: 11999,
    originalPrice: 13999,
    isDiscount: true,
    stock: 65,
    category: "Elektronik",
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80",
    status: "active",
    rating: 4.8,
    reviewCount: 445,
    sku: "SONY-WH1000XM5",
    barcode: "4548736112345",
    features: [
      { name: "Renk", value: "Siyah" },
      { name: "Bağlantı", value: "Bluetooth 5.3" },
      { name: "Pil Ömrü", value: "30 saat" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-07",
  },
  {
    id: 8,
    name: "Adidas Ultraboost 23",
    description: "BOOST teknolojisiyle maksimum enerji geri dönüşü sağlayan koşu ayakkabısı.",
    price: 4599,
    isDiscount: false,
    stock: 0,
    category: "Spor",
    categoryId: 4,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80",
    status: "inactive",
    rating: 4.7,
    reviewCount: 312,
    sku: "ADI-UB23-44",
    barcode: "4062051234567",
    features: [
      { name: "Renk", value: "Siyah/Beyaz" },
      { name: "Numara", value: "44" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-08",
  },
  {
    id: 9,
    name: "Atomik Alışkanlıklar",
    description: "James Clear tarafından yazılmış kişisel gelişim kitabı. Milyonlarca satış.",
    price: 189,
    isDiscount: false,
    stock: 500,
    category: "Kitap & Kırtasiye",
    categoryId: 5,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    status: "active",
    rating: 4.9,
    reviewCount: 1243,
    sku: "KIT-ATOM-ALI",
    barcode: "9786051145678",
    features: [
      { name: "Yazar", value: "James Clear" },
      { name: "Sayfa Sayısı", value: "320" },
      { name: "Dil", value: "Türkçe" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-09",
  },
  {
    id: 10,
    name: "Dyson V15 Detect",
    description: "Lazer teknolojisiyle partikülleri tespit eden güçlü kablosuz elektrikli süpürge.",
    price: 22999,
    isDiscount: false,
    stock: 28,
    category: "Ev & Yaşam",
    categoryId: 3,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=80",
    status: "draft",
    rating: 4.7,
    reviewCount: 178,
    sku: "DYS-V15-DET",
    barcode: "5025155012345",
    features: [
      { name: "Renk", value: "Altın/Nikel" },
      { name: "Ağırlık", value: "3.1 kg" },
      { name: "Pil Ömrü", value: "60 dakika" },
    ],
    isDeleted: false,
    createdBy: "Admin",
    createdAt: "2024-02-10",
  },
];

/** Sipariş listesi ve dashboard “Son siparişler” widget’ı için ortak mock durumu */
export type MockOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  summary: string;
  /** Örnek arama: SKU veya barkod parçası */
  searchSku?: string;
  amount: number;
  status: MockOrderStatus;
  createdAt: string;
  paymentMethod: "card" | "transfer" | "cash_on_delivery";
  city: string;
}

export const customerOrders: CustomerOrder[] = [
  {
    id: "#GA-2026-01492",
    customerName: "Ahmet Yılmaz",
    customerEmail: "ahmet.yilmaz@gmail.com",
    phone: "0532 111 22 33",
    summary: "iPhone 15 Pro Max · APL-IP15PM-256 (+1 ürün)",
    searchSku: "APL-IP15PM-256",
    amount: 58998,
    status: "completed",
    createdAt: "2026-04-28T14:22:00.000Z",
    paymentMethod: "card",
    city: "İstanbul",
  },
  {
    id: "#GA-2026-01491",
    customerName: "Ayşe Kaya",
    customerEmail: "ayse.kaya@outlook.com.tr",
    phone: "0542 222 33 44",
    summary: "MacBook Pro 14 M3 · APL-MBP14-M3",
    searchSku: "APL-MBP14-M3",
    amount: 84999,
    status: "processing",
    createdAt: "2026-04-28T11:05:00.000Z",
    paymentMethod: "transfer",
    city: "Ankara",
  },
  {
    id: "#GA-2026-01488",
    customerName: "Mehmet Demir",
    customerEmail: "mehmet.demir@yahoo.com",
    phone: "0533 444 55 66",
    summary: "Nike Air Max 270 · NIKE-AM270-42",
    searchSku: "NIKE-AM270-42",
    amount: 3299,
    status: "shipped",
    createdAt: "2026-04-27T16:40:00.000Z",
    paymentMethod: "card",
    city: "İzmir",
  },
  {
    id: "#GA-2026-01485",
    customerName: "Fatma Şahin",
    customerEmail: "fatma.sahin@gmail.com",
    phone: "0544 777 88 99",
    summary: "Sony WH-1000XM5 · SONY-WH1000XM5",
    searchSku: "SONY-WH1000XM5",
    amount: 11999,
    status: "completed",
    createdAt: "2026-04-27T09:15:00.000Z",
    paymentMethod: "card",
    city: "Bursa",
  },
  {
    id: "#GA-2026-01480",
    customerName: "Ali Çelik",
    customerEmail: "ali.celik@hotmail.com",
    phone: "0555 100 20 30",
    summary: "Levi's 501 Jeans · LEV-501-32-32",
    searchSku: "LEV-501-32-32",
    amount: 1899,
    status: "pending",
    createdAt: "2026-04-26T18:02:00.000Z",
    paymentMethod: "cash_on_delivery",
    city: "Antalya",
  },
  {
    id: "#GA-2026-01476",
    customerName: "Zeynep Arslan",
    customerEmail: "zeynep.arslan@gmail.com",
    phone: "0536 200 30 40",
    summary: "Samsung Galaxy S24 Ultra · SAM-GS24U-512 (+2 ürün)",
    searchSku: "SAM-GS24U-512",
    amount: 52498,
    status: "processing",
    createdAt: "2026-04-26T10:30:00.000Z",
    paymentMethod: "card",
    city: "İstanbul",
  },
  {
    id: "#GA-2026-01470",
    customerName: "Burak Öztürk",
    customerEmail: "burak.ozturk@firma.com.tr",
    phone: "0312 555 12 34",
    summary: "Dyson V15 Detect · DYS-V15-DET",
    searchSku: "DYS-V15-DET",
    amount: 22999,
    status: "cancelled",
    createdAt: "2026-04-25T14:00:00.000Z",
    paymentMethod: "transfer",
    city: "Ankara",
  },
  {
    id: "#GA-2026-01465",
    customerName: "Elif Yıldız",
    customerEmail: "elif.yildiz@icloud.com",
    phone: "0538 333 44 55",
    summary: "Atomik Alışkanlıklar · KIT-ATOM-ALI",
    searchSku: "KIT-ATOM-ALI",
    amount: 189,
    status: "shipped",
    createdAt: "2026-04-25T08:45:00.000Z",
    paymentMethod: "card",
    city: "Eskişehir",
  },
  {
    id: "#GA-2026-01458",
    customerName: "Can Korkmaz",
    customerEmail: "can.korkmaz@gmail.com",
    phone: "0541 666 77 88",
    summary: "IKEA KALLAX Kitaplık · IKEA-KAL-4X4",
    searchSku: "IKEA-KAL-4X4",
    amount: 2499,
    status: "completed",
    createdAt: "2026-04-24T19:20:00.000Z",
    paymentMethod: "cash_on_delivery",
    city: "Kocaeli",
  },
  {
    id: "#GA-2026-01452",
    customerName: "Selin Acar",
    customerEmail: "selin.acar@company.com.tr",
    phone: "0539 888 99 00",
    summary: "Adidas Ultraboost 23 · ADI-UB23-44",
    searchSku: "ADI-UB23-44",
    amount: 4599,
    status: "pending",
    createdAt: "2026-04-24T12:10:00.000Z",
    paymentMethod: "card",
    city: "İstanbul",
  },
  {
    id: "#GA-2026-01441",
    customerName: "Emre Koç",
    customerEmail: "emre.koc@gmail.com",
    phone: "0531 121 21 21",
    summary: "iPhone 15 Pro Max · APL-IP15PM-256",
    searchSku: "APL-IP15PM-256",
    amount: 54999,
    status: "completed",
    createdAt: "2026-04-23T15:55:00.000Z",
    paymentMethod: "card",
    city: "Adana",
  },
  {
    id: "#GA-2026-01438",
    customerName: "Deniz Polat",
    customerEmail: "deniz.polat@live.com",
    phone: "0546 343 43 43",
    summary: "MacBook Pro 14 M3 · APL-MBP14-M3 (+1 ürün)",
    searchSku: "APL-MBP14-M3",
    amount: 89998,
    status: "processing",
    createdAt: "2026-04-23T09:00:00.000Z",
    paymentMethod: "transfer",
    city: "Trabzon",
  },
  {
    id: "#GA-2026-01429",
    customerName: "Merve Tunç",
    customerEmail: "merve.tunc@gmail.com",
    phone: "0522 555 66 77",
    summary: "Nike Air Max 270 · NIKE-AM270-42 · Atomik Alışkanlıklar",
    searchSku: "NIKE-AM270-42",
    amount: 3488,
    status: "shipped",
    createdAt: "2026-04-22T13:25:00.000Z",
    paymentMethod: "card",
    city: "İstanbul",
  },
  {
    id: "#GA-2026-01415",
    customerName: "Hakan Kurt",
    customerEmail: "hakan.kurt@kurumsal.tr",
    phone: "0216 444 55 66",
    summary: "Sony WH-1000XM5 · SONY-WH1000XM5",
    searchSku: "SONY-WH1000XM5",
    amount: 11999,
    status: "cancelled",
    createdAt: "2026-04-21T11:11:00.000Z",
    paymentMethod: "card",
    city: "İstanbul",
  },
];

export const dashboardStats = {
  totalProducts: 703,
  totalCategories: 6,
  totalOrders: 1842,
  totalRevenue: 284650,
  revenueGrowth: 12.5,
  orderGrowth: 8.3,
  productGrowth: 4.2,
  categoryGrowth: 0,
};

function summaryFirstProduct(summary: string): string {
  const first = summary.split("·")[0]?.trim() ?? summary;
  return first.replace(/\s*\(\+\d+\s*ürün\)\s*$/i, "").trim();
}

/** Dashboard “Son Siparişler” kartı — en yeni 5 kayıt */
export const recentOrders: {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: MockOrderStatus;
  date: string;
}[] = [...customerOrders]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 5)
  .map((o) => ({
    id: o.id,
    customer: o.customerName,
    product: summaryFirstProduct(o.summary),
    amount: o.amount,
    status: o.status,
    date: o.createdAt.slice(0, 10),
  }));

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  productCount: number;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  categoryId: number;
  image: string;
  status: "active" | "inactive" | "draft";
  rating: number;
  reviewCount: number;
  sku: string;
  createdAt: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Elektronik",
    description: "Telefon, bilgisayar ve elektronik aksesuarlar",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
    productCount: 45,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Giyim",
    description: "Erkek, kadın ve çocuk giyim ürünleri",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
    productCount: 128,
    createdAt: "2024-01-16",
  },
  {
    id: 3,
    name: "Ev & Yaşam",
    description: "Ev dekorasyon ve yaşam ürünleri",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    productCount: 67,
    createdAt: "2024-01-17",
  },
  {
    id: 4,
    name: "Spor",
    description: "Spor malzemeleri ve fitness ekipmanları",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    productCount: 89,
    createdAt: "2024-01-18",
  },
  {
    id: 5,
    name: "Kitap & Kırtasiye",
    description: "Kitap, dergi ve kırtasiye ürünleri",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
    productCount: 234,
    createdAt: "2024-01-19",
  },
  {
    id: 6,
    name: "Kozmetik",
    description: "Cilt bakımı, makyaj ve parfüm ürünleri",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    productCount: 92,
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
    stock: 50,
    category: "Elektronik",
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
    status: "active",
    rating: 4.8,
    reviewCount: 324,
    sku: "APL-IP15PM-256",
    createdAt: "2024-02-01",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    description: "Samsung'un amiral gemisi akıllı telefonu. S Pen dahil, 200MP kamera.",
    price: 49999,
    originalPrice: 54999,
    stock: 35,
    category: "Elektronik",
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80",
    status: "active",
    rating: 4.7,
    reviewCount: 218,
    sku: "SAM-GS24U-512",
    createdAt: "2024-02-02",
  },
  {
    id: 3,
    name: "Nike Air Max 270",
    description: "Maksimum konfor ve stil için tasarlanmış Air Max 270 spor ayakkabı.",
    price: 3299,
    stock: 120,
    category: "Spor",
    categoryId: 4,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    status: "active",
    rating: 4.6,
    reviewCount: 567,
    sku: "NIKE-AM270-42",
    createdAt: "2024-02-03",
  },
  {
    id: 4,
    name: "MacBook Pro 14 M3",
    description: "Apple M3 Pro çipli MacBook Pro. Profesyonel iş akışları için mükemmel performans.",
    price: 84999,
    stock: 20,
    category: "Elektronik",
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
    status: "active",
    rating: 4.9,
    reviewCount: 145,
    sku: "APL-MBP14-M3",
    createdAt: "2024-02-04",
  },
  {
    id: 5,
    name: "Levi's 501 Jeans",
    description: "Klasik kesim Levi's 501 kot pantolon. Her tarza uygun zamansız tasarım.",
    price: 1899,
    originalPrice: 2299,
    stock: 200,
    category: "Giyim",
    categoryId: 2,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    status: "active",
    rating: 4.5,
    reviewCount: 892,
    sku: "LEV-501-32-32",
    createdAt: "2024-02-05",
  },
  {
    id: 6,
    name: "IKEA KALLAX Kitaplık",
    description: "4x4 modüler kitaplık. Farklı düzenleme seçenekleriyle çok amaçlı kullanım.",
    price: 2499,
    stock: 45,
    category: "Ev & Yaşam",
    categoryId: 3,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    status: "active",
    rating: 4.4,
    reviewCount: 234,
    sku: "IKEA-KAL-4X4",
    createdAt: "2024-02-06",
  },
  {
    id: 7,
    name: "Sony WH-1000XM5",
    description: "Sektörün en iyi gürültü önleme özelliğine sahip kablosuz kulaklık.",
    price: 11999,
    originalPrice: 13999,
    stock: 65,
    category: "Elektronik",
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80",
    status: "active",
    rating: 4.8,
    reviewCount: 445,
    sku: "SONY-WH1000XM5",
    createdAt: "2024-02-07",
  },
  {
    id: 8,
    name: "Adidas Ultraboost 23",
    description: "BOOST teknolojisiyle maksimum enerji geri dönüşü sağlayan koşu ayakkabısı.",
    price: 4599,
    stock: 0,
    category: "Spor",
    categoryId: 4,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80",
    status: "inactive",
    rating: 4.7,
    reviewCount: 312,
    sku: "ADI-UB23-44",
    createdAt: "2024-02-08",
  },
  {
    id: 9,
    name: "Atomik Alışkanlıklar",
    description: "James Clear tarafından yazılmış kişisel gelişim kitabı. Milyonlarca satış.",
    price: 189,
    stock: 500,
    category: "Kitap & Kırtasiye",
    categoryId: 5,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    status: "active",
    rating: 4.9,
    reviewCount: 1243,
    sku: "KIT-ATOM-ALI",
    createdAt: "2024-02-09",
  },
  {
    id: 10,
    name: "Dyson V15 Detect",
    description: "Lazer teknolojisiyle partikülleri tespit eden güçlü kablosuz elektrikli süpürge.",
    price: 22999,
    stock: 28,
    category: "Ev & Yaşam",
    categoryId: 3,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=80",
    status: "draft",
    rating: 4.7,
    reviewCount: 178,
    sku: "DYS-V15-DET",
    createdAt: "2024-02-10",
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

export const recentOrders = [
  { id: "#ORD-001", customer: "Ahmet Yılmaz", product: "iPhone 15 Pro Max", amount: 54999, status: "completed", date: "2024-02-10" },
  { id: "#ORD-002", customer: "Ayşe Kaya", product: "MacBook Pro 14 M3", amount: 84999, status: "processing", date: "2024-02-10" },
  { id: "#ORD-003", customer: "Mehmet Demir", product: "Nike Air Max 270", amount: 3299, status: "shipped", date: "2024-02-09" },
  { id: "#ORD-004", customer: "Fatma Şahin", product: "Sony WH-1000XM5", amount: 11999, status: "completed", date: "2024-02-09" },
  { id: "#ORD-005", customer: "Ali Çelik", product: "Levi's 501 Jeans", amount: 1899, status: "pending", date: "2024-02-08" },
];

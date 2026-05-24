export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  type: string;
  supplier: string;
  shortDesc: string;
  fullDesc: string;
  specs: ProductSpec[];
  features: string[];
  uses: string[];
  video: string;
  image: string;
}

export const PRODUCT_CATEGORIES = [
  "Hamısı",
  "Balıq",
  "Premium Məhsullar",
  "Yem & Texnologiya",
] as const;

export const PRODUCTS: Product[] = [
  {
    slug: "xezer-neresi",
    name: "Xəzər Nərəsi",
    category: "Balıq",
    type: "Acipenser persicus",
    supplier: "Fishers Aquaculture",
    shortDesc:
      "Premium keyfiyyətli Xəzər nərəsi — qapalı dövriyyə sistemlərində davamlı yetişdirmə texnologiyası ilə.",
    fullDesc:
      "Xəzər dənizinə məxsus nərə balığı, qapalı dövriyyə sistemlərində (RAS) yetişdirilir. ISO 22000 və HACCP standartlarına tam uyğun istehsal prosesi ilə ən yüksək keyfiyyət təmin edilir.\n\nBalığın eti zəngin Omega-3 yağ turşuları ilə doludur və premium restoranlar tərəfindən yüksək qiymətləndirilir. Hər bir balıq fərdi izlənmə sistemi ilə mənşədən süfrəyə qədər tam şəffaflıq təmin edir.\n\nXəzər nərəsi davamlı akvakultura prinsiplərinə uyğun olaraq yetişdirilir, təbii populyasiyanın qorunmasına töhfə verir.",
    specs: [
      { label: "Növ", value: "Acipenser persicus" },
      { label: "Orta Çəki", value: "3–8 kq" },
      { label: "Yetişdirmə Müddəti", value: "18–24 ay" },
      { label: "Su Temperaturu", value: "16–20°C" },
      { label: "pH Aralığı", value: "7.0–8.0" },
      { label: "Protein Miqdarı", value: "18–20%" },
      { label: "Yağ Miqdarı", value: "4–8%" },
      { label: "Sertifikasiya", value: "ISO 22000, HACCP, ASC" },
    ],
    features: [
      "Qapalı dövriyyə sistemində (RAS) yetişdirilir",
      "Antibiotik-free istehsal",
      "Omega-3 yağ turşuları ilə zəngin",
      "Fərdi QR-kod izlənmə sistemi",
      "Soyuq zəncir təchizatı",
      "Fərdi çəki sortlaşdırma",
    ],
    uses: [
      "Premium restoranlar və otellər",
      "Beynəlxalq ixracat bazarları",
      "Qida sənayesi və emal müəssisələri",
      "Kürü istehsalı üçün ana material",
    ],
    video: "/videos/farm-1.mp4",
    image: "/images/10.jpg",
  },
  {
    slug: "qara-kuru",
    name: "Qara Kürü",
    category: "Premium Məhsullar",
    type: "Beluga / Osetra",
    supplier: "Fishers Premium",
    shortDesc:
      "Əl ilə yığılan premium Xəzər kürüsü — Beluga və Osetra çeşidlərində.",
    fullDesc:
      "Fishers-in qara kürüsü Xəzər nərəsindən əl ilə yığılır və ənənəvi üsullarla emal edilir. Hər bir qab fərdi sertifikat və mənşə sənədi ilə təmin edilir.\n\nBeluga kürüsü iri dənəli, kremli teksturası ilə, Osetra isə qızıltəhər rəngi və qoz ləzzəti ilə seçilir. Hər iki çeşid dünya bazarında ən yüksək keyfiyyət standartlarına cavab verir.\n\nKürü istehsalı prosesi tam steril mühitdə həyata keçirilir və soyuq zəncir prinsipinə uyğun olaraq müştəriyə çatdırılır.",
    specs: [
      { label: "Çeşid", value: "Beluga, Osetra" },
      { label: "Dənə Ölçüsü", value: "2.5–3.5 mm (Beluga)" },
      { label: "Rəng", value: "Açıq boz – qara" },
      { label: "Duz Miqdarı", value: "3.5–4.5%" },
      { label: "Saxlama", value: "-2°C – +2°C" },
      { label: "Raf Ömrü", value: "4–6 ay (vakuum)" },
      { label: "Qablaşdırma", value: "30q, 50q, 125q, 250q" },
      { label: "Sertifikasiya", value: "CITES, ISO 22000" },
    ],
    features: [
      "Əl ilə yığılma və seçilmə",
      "Ənənəvi Malossol emal üsulu",
      "Fərdi sertifikat və mənşə sənədi",
      "Vakuum qablaşdırma texnologiyası",
      "CITES beynəlxalq sertifikatı",
      "Premium hədiyyə qablaşdırması",
    ],
    uses: [
      "Michelin ulduzlu restoranlar",
      "Lüks otellər və katerinq xidmətləri",
      "Diplomatik qəbullar və rəsmi tədbirlər",
      "Premium hədiyyə bazarı",
    ],
    video: "/videos/farm-2.mp4",
    image: "/images/3.jpg",
  },
  {
    slug: "alabaliq",
    name: "Göy Quşağı Alabalığı",
    category: "Balıq",
    type: "Oncorhynchus mykiss",
    supplier: "Fishers Aquaculture",
    shortDesc:
      "Təmiz dağ sularında yetişdirilən premium alabalıq — yüksək protein, aşağı yağ.",
    fullDesc:
      "Göy quşağı alabalığı Azərbaycanın təmiz dağ sularında axar su sistemlərində yetişdirilir. Təbii qida ilə dəstəklənmiş yem proqramı sayəsində üstün dad keyfiyyətinə malikdir.\n\nAlabalığın eti yüksək protein və aşağı yağ miqdarı ilə sağlam qidalanma üçün ideal seçimdir. Tünd çəhrayı rəngli ət Omega-3 və D vitamini ilə zəngindir.\n\nMüasir sortlaşdırma və qablaşdırma xətti vasitəsilə bütöv, fileto və porsiya kəsimli formatlarda təqdim edilir.",
    specs: [
      { label: "Növ", value: "Oncorhynchus mykiss" },
      { label: "Orta Çəki", value: "300–500 q (porsiya)" },
      { label: "Yetişdirmə Müddəti", value: "10–14 ay" },
      { label: "Su Temperaturu", value: "10–16°C" },
      { label: "Protein", value: "20–22%" },
      { label: "Yağ", value: "3–5%" },
      { label: "Formatlar", value: "Bütöv, fileto, porsiya" },
      { label: "Sertifikasiya", value: "GlobalGAP, ISO 22000" },
    ],
    features: [
      "Təmiz dağ sularında axar su sistemi",
      "Təbii qida ilə dəstəklənmiş yem proqramı",
      "Yüksək protein, aşağı yağ miqdarı",
      "Müxtəlif kəsim formatları mövcuddur",
      "Gündəlik təzə çatdırılma imkanı",
      "GlobalGAP sertifikatlı istehsal",
    ],
    uses: [
      "Restoran və kafeler",
      "Supermarketlər və balıq dükanları",
      "Hisə vermə müəssisələri",
      "Birbaşa istehlakçıya çatdırılma",
    ],
    video: "/videos/farm-3.mp4",
    image: "/images/14.jpg",
  },
  {
    slug: "hise-verilmis-alabaliq",
    name: "Hisə Verilmiş Alabalıq",
    category: "Premium Məhsullar",
    type: "Soyuq hisə / İsti hisə",
    supplier: "Fishers Premium",
    shortDesc:
      "Ənənəvi meşə ağacı ilə hisə verilmiş premium alabalıq — hazır istehlak üçün.",
    fullDesc:
      "Fishers Premium hisə verilmiş alabalığı öz təsərrüfatında yetişdirilmiş təzə alabalıqdan hazırlanır. Alma və fındıq ağacı talaşı ilə ənənəvi üsulda hisə verilir.\n\nSoyuq hisə variant 24 saat müddətində aşağı temperaturda hisə verilir, ipəyimsi tekstura və incə his ləzzəti verir. İsti hisə variant isə daha intensiv his dadı ilə seçilir.\n\nVakuum qablaşdırma ilə raf ömrü uzadılır, dilimli və bütöv formatlarda təqdim edilir.",
    specs: [
      { label: "Hisə Növü", value: "Soyuq / İsti" },
      { label: "Xammal", value: "Təzə alabalıq filetosu" },
      { label: "Ağac", value: "Alma, fındıq" },
      { label: "Duz Miqdarı", value: "2.5–3.5%" },
      { label: "Saxlama", value: "0°C – +4°C" },
      { label: "Raf Ömrü", value: "21 gün (vakuum)" },
      { label: "Formatlar", value: "Dilimli, bütöv fileto" },
      { label: "Çəki", value: "150q, 250q, 500q" },
    ],
    features: [
      "Öz təsərrüfatında yetişdirilmiş xammal",
      "Ənənəvi meşə ağacı ilə hisə vermə",
      "Süni əlavələrsiz təbii proses",
      "Dilimli və bütöv fileto formatları",
      "Vakuum qablaşdırma texnologiyası",
      "Hazır istehlak üçün uyğundur",
    ],
    uses: [
      "Restoranlar və kafelərdə aperitiv",
      "Supermarket delikates rəfləri",
      "Premium hədiyyə səbətləri",
      "Katerinq xidmətləri",
    ],
    video: "/videos/farm-4.mp4",
    image: "/images/9.jpg",
  },
  {
    slug: "premium-baliq-yemi",
    name: "Premium Balıq Yemi",
    category: "Yem & Texnologiya",
    type: "Ekstruze pelet",
    supplier: "Fishers Feed Tech",
    shortDesc:
      "Yüksək qidalılıq dəyərli, elm əsaslı balıq yemi — nərə və alabalıq üçün xüsusi formulalar.",
    fullDesc:
      "Fishers Feed Tech-in balıq yemləri elmi araşdırmalara əsaslanan formularla hazırlanır. Hər bir yem növü hədəf balıq növünün yaş mərhələsinə və ehtiyaclarına uyğun olaraq optimallaşdırılıb.\n\nYüksək həzm olunan protein mənbələri, esensial amin turşuları və Omega-3 yağ turşuları ilə zəngin tərkib optimal böyümə sürəti və yem çevirmə əmsalı (FCR) təmin edir.\n\nBütün yem məhsulları GMP standartlarına uyğun istehsal olunur və keyfiyyət laboratoriyasında yoxlanılır.",
    specs: [
      { label: "Tip", value: "Ekstruze üzən pelet" },
      { label: "Protein", value: "42–55%" },
      { label: "Yağ", value: "12–18%" },
      { label: "Lif", value: "< 3%" },
      { label: "Pelet Ölçüsü", value: "1.5–9 mm" },
      { label: "FCR", value: "1.1–1.4" },
      { label: "Saxlama", value: "Quru, sərin mühit" },
      { label: "Raf Ömrü", value: "12 ay" },
    ],
    features: [
      "Elmi araşdırmalara əsaslanan formulalar",
      "Yaş mərhələsinə uyğun xüsusi reseptlər",
      "Yüksək həzm oluna bilən protein mənbələri",
      "Optimal FCR (yem çevirmə əmsalı)",
      "GMP standartlarına uyğun istehsal",
      "Keyfiyyət laboratoriyası nəzarəti",
    ],
    uses: [
      "Nərə yetişdirmə təsərrüfatları",
      "Alabalıq fermaları",
      "Balıq artırma mərkəzləri",
      "Akvakultura tədqiqat institutları",
    ],
    video: "/videos/farm-5.mp4",
    image: "/images/12.jpg",
  },
  {
    slug: "iot-monitorinq",
    name: "AquaSense IoT Sistemi",
    category: "Yem & Texnologiya",
    type: "Su keyfiyyəti monitorinq platforması",
    supplier: "Fishers Tech Solutions",
    shortDesc:
      "Real-time su keyfiyyəti monitorinqi — temperatur, pH, oksigen və daha çox parametr.",
    fullDesc:
      "AquaSense IoT sistemi akvakultura təsərrüfatlarında su keyfiyyətini real vaxt rejimində izləyən ağıllı platformadır. Sualtı sensorlar vasitəsilə 12+ parametri eyni anda ölçür və bulud əsaslı paneldə vizuallaşdırır.\n\nSüni intellekt alqoritmləri tarixi verilənləri analiz edərək potensial riskləri əvvəlcədən xəbərdarlıq edir. Avtomatik reaksiya sistemi kritik hallarda aerasiya, su dəyişimi və yemləmə proseslərini idarə edir.\n\nMobil tətbiq vasitəsilə istənilən yerdən təsərrüfatınızı izləyə və idarə edə bilərsiniz.",
    specs: [
      { label: "Parametrlər", value: "pH, DO, temp, NH₃, NO₂ və s." },
      { label: "Sensor Sayı", value: "4–32 (genişlənə bilən)" },
      { label: "Ölçmə Aralığı", value: "Hər 30 saniyə" },
      { label: "Əlaqə", value: "4G / Wi-Fi / LoRa" },
      { label: "Platforma", value: "Bulud əsaslı (AWS)" },
      { label: "Mobil Tətbiq", value: "iOS / Android" },
      { label: "Enerji", value: "Solar + batareya" },
      { label: "Zəmanət", value: "3 il" },
    ],
    features: [
      "12+ su keyfiyyəti parametrini real-time ölçmə",
      "Süni intellekt əsaslı erkən xəbərdarlıq",
      "Avtomatik reaksiya sistemi",
      "Bulud əsaslı verilənlər paneli",
      "Mobil tətbiq ilə uzaqdan idarəetmə",
      "Solar enerji ilə işləmə imkanı",
    ],
    uses: [
      "Qapalı dövriyyə sistemləri (RAS)",
      "Açıq su hovuz təsərrüfatları",
      "Hatchery (artırma) mərkəzləri",
      "Tədqiqat laboratoriyaları",
    ],
    video: "/videos/farm-2.mp4",
    image: "/images/5.jpg",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "Hamısı") return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

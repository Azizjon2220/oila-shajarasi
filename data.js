// =====================================================================
//  OILA SHAJARASI — MA'LUMOTLAR
//  Saytdagi barcha ismlar shu faylda turadi.
//  Saytdagi "Tahrirlash" tugmasi ham shu faylni yozadi.
// =====================================================================

// Sayt tepasidagi sarlavha va kichik yozuv
const SHAJARA_NOMI = "Oila shajarasi";
const SHAJARA_TAVSIF = "Ota-bobolarimiz va avlodlarimiz";

// true bo'lsa, sayt tepasida "namuna ismlar" degan ogohlantirish chiqadi.
const NAMUNA = false;

// Shajarani tuzgan odam: sayt pastida yoziladi, kartasida "Tuzuvchi" belgisi chiqadi.
//   ism — ko'rsatiladigan ism, id — shajaradagi raqami
const TUZUVCHI = { ism: "Azizjon Baxtiyorov", id: 17 };

// ---------------------------------------------------------------------
//  ODAMLAR RO'YXATI
//
//  Har bir odam — { ... } ichida bitta qator, oxirida vergul (,) bilan.
//
//    id        — har bir odamning o'z raqami (takrorlanmasin: 1, 2, 3 ...)
//    ism       — ismi (qo'shtirnoq ichida: "Karimjon")
//    farzandi  — ota yoki onasining id raqami.
//                Eng katta bobo (shajara boshi) uchun yozilmaydi.
//    jinsi     — "e" (erkak) yoki "a" (ayol)
//    turmush   — turmush o'rtog'ining ismi         (ixtiyoriy)
//    tugilgan  — tug'ilgan yili, masalan 1965      (ixtiyoriy)
//    vafot     — vafot etgan yili                  (ixtiyoriy)
//    izoh      — qo'shimcha ma'lumot               (ixtiyoriy)
//
//  Muhim: ismlarni har doim qo'shtirnoq "..." ichida yozing.
//  Farzandlar saytda shu ro'yxatdagi tartibda (chapdan o'ngga) chiqadi.
// ---------------------------------------------------------------------

const ODAMLAR = [
  // 1-avlod
  { id: 1, ism: "Begmad", jinsi: "e", turmush: "Xijji", tugilgan: 1890, vafot: 1940 },

  // 2-avlod
  { id: 2, ism: "G'ani", jinsi: "e", farzandi: 1, turmush: "Zulfiya", tugilgan: 1915, vafot: 1980 },
  { id: 4, ism: "Xasan", jinsi: "e", farzandi: 1, turmush: "Toji", tugilgan: 1918, vafot: 2007 },
  { id: 5, ism: "Xusan", jinsi: "e", farzandi: 1, turmush: "Ra'no", tugilgan: 1918, vafot: 1968 },
  { id: 6, ism: "Po'lat", jinsi: "e", farzandi: 1, turmush: "Marhamat", tugilgan: 1925, vafot: 1996 },

  // 3-avlod
  { id: 7, ism: "Baxtiyor", jinsi: "e", farzandi: 4, turmush: "Karima", tugilgan: 1946, vafot: 1947 },

  // 4-avlod
  { id: 8, ism: "Dilobar", jinsi: "a", farzandi: 7, turmush: "Qurbonali", tugilgan: 1962 },
  { id: 9, ism: "Nigora", jinsi: "a", farzandi: 7, turmush: "Dilshod", tugilgan: 1965 },
  { id: 10, ism: "Baxodir", jinsi: "e", farzandi: 7, turmush: "Lobar", tugilgan: 1971 },
  { id: 11, ism: "Ixtiyor", jinsi: "e", farzandi: 7, turmush: "Fotima", tugilgan: 1973 },
  { id: 12, ism: "Baxrom", jinsi: "e", farzandi: 7, turmush: "Nazokat", tugilgan: 1977 },

  // 5-avlod
  { id: 33, ism: "Xursan", farzandi: 8, tugilgan: 1980 },
  { id: 34, ism: "Abdulaziz", jinsi: "e", farzandi: 9, tugilgan: 2000 },
  { id: 13, ism: "Feruza", jinsi: "a", farzandi: 10, turmush: "Yorqin", tugilgan: 1995 },
  { id: 14, ism: "Munisa", jinsi: "a", farzandi: 10, turmush: "Samariddin", tugilgan: 1996 },
  { id: 15, ism: "Sarvinoz", jinsi: "a", farzandi: 10, turmush: "Ravshan", tugilgan: 1999 },
  { id: 16, ism: "Gulshirin", jinsi: "a", farzandi: 10, turmush: "Murod", tugilgan: 2004 },
  { id: 17, ism: "Azizjon", jinsi: "e", farzandi: 10, tugilgan: 2008, izoh: "Yaratuvchi" },
  { id: 27, ism: "Elyor", jinsi: "e", farzandi: 11, tugilgan: 1995 },
  { id: 28, ism: "Maaftuna", jinsi: "a", farzandi: 11, tugilgan: 1996 },
  { id: 29, ism: "Doniyor", jinsi: "e", farzandi: 11, tugilgan: 2003 },
  { id: 30, ism: "Jasur", jinsi: "e", farzandi: 12, tugilgan: 2001 },
  { id: 31, ism: "Jahongir", jinsi: "e", farzandi: 12, tugilgan: 2003 },
  { id: 32, ism: "Javohir", jinsi: "e", farzandi: 12, tugilgan: 2007 },

  // 6-avlod
  { id: 18, ism: "Izzatbek", jinsi: "e", farzandi: 13, tugilgan: 2017 },
  { id: 19, ism: "Jasurbek", jinsi: "e", farzandi: 13, tugilgan: 2020 },
  { id: 20, ism: "Intizor", jinsi: "a", farzandi: 13, tugilgan: 2024 },
  { id: 21, ism: "Sardorbek", jinsi: "e", farzandi: 13, tugilgan: 2025 },
  { id: 22, ism: "Soliha", jinsi: "a", farzandi: 14, tugilgan: 2020 },
  { id: 23, ism: "Asilbek", jinsi: "e", farzandi: 14, tugilgan: 2022 },
  { id: 24, ism: "Xasan", jinsi: "e", farzandi: 15, tugilgan: 2020 },
  { id: 25, ism: "Xusan", jinsi: "e", farzandi: 15, tugilgan: 2020 },
  { id: 26, ism: "Yusuf", jinsi: "e", farzandi: 16, tugilgan: 2025 },
];

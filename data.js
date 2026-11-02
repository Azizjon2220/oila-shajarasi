// =====================================================================
//  OILA SHAJARASI — MA'LUMOTLAR
//  Saytdagi barcha ismlar shu faylda turadi. Faqat shu faylni o'zgartirasiz.
// =====================================================================

// Sayt tepasidagi sarlavha va kichik yozuv
const SHAJARA_NOMI = "Oila shajarasi";
const SHAJARA_TAVSIF = "Ota-bobolarimiz va avlodlarimiz";

// Hozir pastdagi ismlar — namuna. Haqiqiy ismlarni yozib bo'lgach,
// true so'zini false ga almashtiring (sayt tepasidagi ogohlantirish yo'qoladi).
const NAMUNA = true;

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
  { id: 1, ism: "Abdurahmon", jinsi: "e", turmush: "Oyshabibi", tugilgan: 1912, vafot: 1987, izoh: "Shajaramiz boshi. Bu namuna yozuv." },

  // 2-avlod — Abdurahmonning farzandlari
  { id: 2, ism: "Karimjon", jinsi: "e", farzandi: 1, turmush: "Zulfiya", tugilgan: 1938, vafot: 2010 },
  { id: 3, ism: "Rahimjon", jinsi: "e", farzandi: 1, turmush: "Mohira", tugilgan: 1942, vafot: 2015 },
  { id: 4, ism: "Saodat", jinsi: "a", farzandi: 1, turmush: "Anvar", tugilgan: 1946 },

  // 3-avlod
  { id: 5, ism: "Farhod", jinsi: "e", farzandi: 2, turmush: "Dilnoza", tugilgan: 1968 },
  { id: 6, ism: "Shoira", jinsi: "a", farzandi: 2, turmush: "Ulug'bek", tugilgan: 1971 },
  { id: 7, ism: "Jahongir", jinsi: "e", farzandi: 3, turmush: "Nigora", tugilgan: 1970 },
  { id: 8, ism: "Madina", jinsi: "a", farzandi: 3, tugilgan: 1975 },
  { id: 9, ism: "Nodira", jinsi: "a", farzandi: 4, turmush: "Sherzod", tugilgan: 1972 },

  // 4-avlod
  { id: 10, ism: "Sardor", jinsi: "e", farzandi: 5, tugilgan: 1996 },
  { id: 11, ism: "Malika", jinsi: "a", farzandi: 5, tugilgan: 1999 },
  { id: 12, ism: "Otabek", jinsi: "e", farzandi: 6, tugilgan: 1994 },
  { id: 13, ism: "Bekzod", jinsi: "e", farzandi: 7, tugilgan: 1995 },
  { id: 14, ism: "Kamola", jinsi: "a", farzandi: 7, tugilgan: 2001 },
  { id: 15, ism: "Laylo", jinsi: "a", farzandi: 9, tugilgan: 2000 },
];

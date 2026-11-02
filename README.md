# Oila shajarasi

Oilamizning shajarasi — ota-bobolarimiz va avlodlarimiz daraxti.
Sayt hamma uchun ochiq: havolani bilgan har kim telefon yoki kompyuterdan ko'ra oladi.

## Yangi odam qo'shish (GitHub saytining o'zida)

1. GitHub'da shu loyihani oching va **`data.js`** faylini bosing.
2. O'ng tomondagi **qalam** (✏️ Edit) belgisini bosing.
3. `ODAMLAR` ro'yxatining oxiriga (`];` dan oldin) yangi qator qo'shing:

   ```js
   { id: 16, ism: "Yangi ism", jinsi: "e", farzandi: 5, tugilgan: 2005 },
   ```

4. Yashil **Commit changes…** tugmasini bosing, keyin yana **Commit changes**.
5. 1–2 daqiqadan keyin sayt o'zi yangilanadi.

## Qoidalar

| Maydon | Ma'nosi | Majburiymi? |
|---|---|---|
| `id` | Har bir odamning o'z raqami. Takrorlanmasin. | ha |
| `ism` | Ismi, qo'shtirnoq ichida: `"Karimjon"` | ha |
| `farzandi` | Ota yoki onasining `id` raqami. Shajara boshi uchun yozilmaydi. | ha (boshidan tashqari) |
| `jinsi` | `"e"` — erkak, `"a"` — ayol | yo'q |
| `turmush` | Turmush o'rtog'ining ismi | yo'q |
| `tugilgan` | Tug'ilgan yili | yo'q |
| `vafot` | Vafot etgan yili | yo'q |
| `izoh` | Qo'shimcha ma'lumot | yo'q |

- Har bir qator oxirida vergul `,` bo'lsin.
- Ismlar doim qo'shtirnoq `"..."` ichida bo'lsin (`Ulug'bek` kabi ismlardagi `'` belgisi shunda muammo qilmaydi).
- Biror narsa noto'g'ri yozilsa, sayt tepasida qizil xabar chiqadi va qaysi qatorda xato borligini aytadi.

## Eslatma

Sayt ochiq — shuning uchun telefon raqami, manzil kabi shaxsiy ma'lumotlarni yozmang.

## Fayllar

- `data.js` — barcha ismlar (faqat shu faylni o'zgartirasiz)
- `index.html`, `style.css`, `app.js` — saytning o'zi

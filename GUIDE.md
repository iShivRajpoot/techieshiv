# Site guide: naya content kaise add karein

Sab kuch GitHub par hi edit ho jata hai. Koi coding ki zaroorat nahi, bas file kholo, entry add karo, aur **Commit changes** dabao. 1-2 minute mein site update ho jati hai.

## Files kya karti hain

| File | Kaam |
|------|------|
| `index.html` | Home page (portfolio) |
| `article.html` | Article padhne ka page (isko edit karne ki zaroorat nahi) |
| `style.css`, `site.js`, `home.js` | Design aur logic |
| `reviews.json` | Gadget reviews ki list |
| `articles.json` + `articles/` folder | Articles ki list + unka text |
| `videos.json` | Reels / YouTube videos ki list |
| `store.json` | Books / picks (affiliate store) |
| `stats.json` | Live stats. **Ise haath mat lagana**, GitHub job khud update karti hai |

## JSON edit karte waqt dhyan rakho
- Har entry `{ ... }` ke andar hoti hai, aur entries ke beech mein **comma `,`** lagta hai (aakhri entry ke baad nahi).
- Text hamesha `"double quotes"` mein likho.
- Koi cheez khali chhodni ho to `""` likho (price ke liye `null`).
- Galti ho jaye to GitHub commit se pehle hi lal error dikha deta hai, ya site par section khali dikhega. Pichla version wapas laa sakte ho.

## 1. Naya review add karna (`reviews.json`)
Last entry ke baad comma lagao aur ye paste karo:

```json
{
  "name": "Phone ka naam",
  "category": "Phones",
  "rating": 8.5,
  "price": 19999,
  "image": "reviews/phone-name.jpg",
  "summary": "Ek-do line mein tumhara verdict.",
  "pros": ["Pehli achhi baat", "Doosri achhi baat"],
  "cons": ["Pehli kami", "Doosri kami"],
  "video": "https://www.instagram.com/reel/XXXXXXXX/",
  "article": "phone-name-review",
  "buy": "https://amzn.to/XXXXXXX"
}
```

- `category` se filter buttons apne aap ban jate hain (Phones, Earbuds, Wearables...).
- `rating`, `price`, `image`, `video`, `article`, `buy` optional hain. Jo nahi hai wo `""` ya `null` chhod do, wo button/hissa dikhega hi nahi.
- `article` mein us review ke article ka slug likho (neeche dekho). Tab "Full review" button aa jata hai.
- Sample card (`"sample": true`) delete kar do jab asli review aa jaye.
- Photos `reviews` naam ka folder bana kar usme upload karo (Add file → Upload files).

## 2. Naya article add karna
1. `articles` folder mein nayi file banao, jaise `phone-name-review.html`. Usme sirf text likho:
   ```html
   <p>Pehla paragraph.</p>
   <h2>Camera</h2>
   <p>Camera ke baare mein...</p>
   <ul><li>Point 1</li><li>Point 2</li></ul>
   ```
2. `articles.json` mein ek entry add karo (slug = file ka naam, `.html` ke bina):
   ```json
   {
     "slug": "phone-name-review",
     "title": "Article ka title",
     "date": "2026-10-25",
     "tag": "Review",
     "readTime": 4,
     "summary": "Card par dikhne wali ek line."
   }
   ```
- Slug mein sirf chhote letters, numbers aur `-` use karo (spaces nahi).
- Photo article mein daalni ho: `<img src="../reviews/photo.jpg" alt="description">`

## 3. Naya video add karna (`videos.json`)
```json
{
  "title": "Video ka title",
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=XXXXXXXX",
  "tag": "ai",
  "thumb": ""
}
```
- `platform`: `instagram` ya `youtube`
- `tag`: `tips` (Tips & Tricks), `ai` (AI), `review` (Reviews)

## 4. Store mein naya product (`store.json`)
`store.json` mein pehle jaisi entry copy karke naam, price, `image` aur `url` badal do.

## Zaroori baatein
- **Affiliate links:** page par disclosure pehle se likha hai, use rakhna.
- **Genuine reviews:** specs aur price official source se check karke likho.
- Site ko apne computer par file kholkar (double-click) test mat karo, JSON load nahi hota. GitHub Pages par hi dekho.
- Jab apni website (domain) launch karoge, ye same files usi tarah chalengi. Sirf domain connect karna hoga.

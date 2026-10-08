# PCX Hub · QR Club

**v8.0.0** · Muhammed Can Ceylan

Bir motosiklet üzerindeki QR’dan açılan küçük bir ziyaretçi dünyası: motor sahibine ulaş, PCX’i 3D incele, on bir mini oyun oyna ve ufak sırlar keşfet.

Statik HTML/CSS/JavaScript. GitHub Pages uyumlu. Kurulum veya derleme gerektirmez. Bağımsız, kar amacı gütmeyen öğrenci projesidir; Honda ile bağlantılı değildir.

## QR adresi değişmez

Mevcut depo **qr-motor** ve giriş **index.html** olarak kalır. Yeni sürüm dosyalarını aynı yayın klasöründeki dosyaların üzerine yükle. `pcx-hub-v8` adında yeni bir web alt klasörü oluşturma; çıkarılan klasörün **içindekilerini** yükle. Depo adını, Pages yayın kaynağını ve varsa özel alan adını koru. Yayından sonra basılı QR’ın açtığı tam bağlantıyı test et.

### Önceki Git yükleme hatası için

`Publish-Update.ps1`, Windows PowerShell için aynı `qr-motor` deposunun `main` dalını yeni bir masaüstü klasörüne klonlar, v8 dosyalarını kopyalar ve normal commit/push yapar. `.git`, `.github`, `node_modules` ve `CNAME` kopyalanmaz. Eski çalışma klasörlerine dokunmaz. Uzak depoda yeni commit oluşmuşsa push reddedilir; otomatik force push veya geçmiş sıfırlama yapmaz.

ZIP'i tamamen çıkardıktan sonra klasörde PowerShell aç:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Publish-Update.ps1
```

Git kurulu ve GitHub oturumun açık olmalı. Script yeni sürümü yayın dalına gönderir. Başarılı push sonrasında mevcut Pages dağıtımının tamamlanmasını bekle. Script bu geliştirme ortamında Windows üzerinde çalıştırılmadı.

## v8: Ziyaretçi için oyun alanı

- Oyun sayısı **7 → 11**. Yeni oyunlar: Simit Snake, Brick Garage, Kask Avı, Işıklar Sönsün.
- Park kaydı ve kişisel not arayüzleri kaldırıldı. Yerine **Kulis**, motorun iç sesi, küçük şakalar ve keşif defteri geldi.
- Eski park/not kayıtları kaybolmaması için eski yedeklerin içinde korunur; yeni kayıt alma arayüzü/API'si yoktur.
- **9999 jetonluk Altın Motor**, gerçekten satın alınabilir ve City Ride’da kullanılabilir. Gerçek para veya satın alma yok; zor bir oyun içi hedef.
- 8 keşif: oyun başarıları, logo, pahalı vitrin ve meraklı parmaklar. Bir keşfin ödülü yalnızca bir kez verilir.
- Mevcut iletişim, yedi oyun, favoriler, görevler, skorlar ve 3D stüdyo korunur. v2–v8 profil yedekleri alınabilir.

## City Ride: Artan tempo

Hız, aktif oyun süresi boyunca 190’dan 435 oyun birimi/sn’ye doğru yumuşak biçimde artar. Bu değer gerçek motosiklet hızı değildir. Nitro süreli olarak 1,42× hız verir; kullanıldıktan sonra yeniden dolar. Yaklaşık her 18 saniyede yeni etap ve farklı ortam renkleri gelir.

- Üç can; çarpışma ve duraklamadan dönüş sonrası kısa koruma.
- Araçlar, koniler ve kısa süre direksiyonu ağırlaştıran yağ lekeleri.
- **K**: 7 sn kalkan; **M**: 7 sn jeton mıknatısı; **N**: nitroyu doldurur; sarı **+**: jeton.
- Her engel sırası en az bir serbest şerit bırakır. Süre ilerledikçe bazı sıralarda iki şerit dolabilir.
- Kıl payı geçiş puanı, oyun içi olay yazıları ve **1000 puanda** küçük sürpriz.
- Kazanılan tur jetonu skorla hesaplanır; yarışta toplanan jetonlar skoru artırır. Sıfır puanlı tur XP/jeton kazandırmaz.

## Oyunlar

| Oyun | Kontroller | Hedef |
| --- | --- | --- |
| City Ride | Kaydır, ← → / A-D; nitro düğmesi veya boşluk | Artan tempoda hayatta kal, puan topla |
| Simit Snake | Kaydır, yön düğmeleri, oklar / WASD | Simit topla; duvar ve kuyruktan kaç |
| Brick Garage | Sürükle, yön düğmeleri / oklar; boşlukla topu bırak | Üç canla üç tuğla etabını bitir |
| Kask Avı | Dokun; klavyede 1–9 | 25 saniyede kask yakala, konilerden kaç |
| Işıklar Sönsün | Dokun veya Tab / Enter | 4×4 tahtanın tüm ışıklarını kapat |
| City 2048 | Kaydır, yön düğmeleri / oklar | Sayıları birleştir; kayıt ve hamleyi geri alma |
| Sky Stack | Dokun / boşluk | Blokları üst üste yerleştir |
| Signal Loop | Dokun / 1–4 | Işık dizisini tekrar et |
| Green Light | Dokun / boşluk | Yeşile tepki ver |
| Tap Rush | Dokun / boşluk | 10 saniyede en çok dokunuş |
| Match Club | Dokun | Altı çifti eşleştir |

Oyunların ortak duraklat/devam et, sonuç, tekrar oyna ve skor paylaşımı vardır. Arka plana geçince veya ekran genişliği belirgin değişince duraklar. 2048 dışında yarım kalan turlar kalıcı olarak saklanmaz. Işık bulmacaları geçerli hamlelerle üretilir, her biri çözülebilir; ipuçları puanı azaltır.

## Mobil ve 3D

3D model ile görüntüleyici yalnızca “3D’yi başlat / 360° incele” ile indirilir. Model 1,89 MB; yerel üç boyutlu görüntüleyici yaklaşık 671 KB. Gerçek 360° döndürme, yaklaşma, kamera açıları, gece ışığı ve kaydırmaya bağlı kamera vardır. WebGL2 desteklenmezse veya yükleme başarısızsa SVG kalır. İlk başarılı yüklemeden sonra model de çevrimdışı önbelleğe alınır.

Hareket azaltma tercihi desteklenir. Oyun sırasında görünüm duraklatıldığında canvas çizimi durur. Ses ve titreşim profil ayarlarından kapatılabilir. Dokunmatik kontroller ve yön düğmeleri birlikte sunulur.

Fiziksel iPhone/Android ve Floorp/Firefox testleri burada yapılmadı. Ekran/dokunma emülasyonu gerçek cihaz performansı garantisi değildir. Ayrıntılar: `TESTING.md`.

## Yerelde çalıştırma

```sh
python -m http.server 8080
```

`http://localhost:8080/index.html` adresini aç. `file://` ile sayfa ve oyunlar açılır; 3D ve service worker için HTTP(S) kullan. Sayfa önceki sürümde kalırsa yeniden yükle; gerekirse tarayıcıda siteyi yenile. Profil verisini silmek yerine önce profil menüsünden yedek al.

## Kod ve veriler

- `js/ride-engine.js`: yarış simülasyonu; `js/ride.js`: çizim ve kontroller.
- `js/extra-games.js`: dört yeni oyun; `js/games.js`: ortak oyun yaşam döngüsü ve önceki oyunlar.
- `js/visitor.js`: ziyaretçi kulisi; `js/store.js`: yerel profil, ekonomi ve keşif kayıtları.
- `src/viewer.js`: 3D kaynak; yeniden derlemek için `npm ci` ve `npm run build:3d`.
- `js/config.js`: motor sahibinin iletişim bilgileri.

İlerleme yalnızca o tarayıcıdadır. Sunucuya skor/konum yüklenmez; hesap ve ortak sıralama yoktur. İletişim düğmeleri ancak kullanıcı seçtiğinde arama/WhatsApp gibi ilgili uygulamayı açar. Yedekler geçmiş sürümlerde tutulmuş kişisel notları/park kayıtlarını içerebilir.

Kod lisansı `LICENSE`, bağımlılıklar `THIRD-PARTY-NOTICES.txt`, model bilgileri `MODEL-NOTES.md` içindedir. Kullanıcı tarafından sağlanan motor görselleri/modeline ayrıca lisans atanmaz.

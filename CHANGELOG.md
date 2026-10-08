## 8.0.0 — 2026-10-08

- Ziyaretçi odaklı Kulis; park/not arayüzleri kaldırıldı, eski veriler yedeklerde korunuyor.
- Dört yeni oyun: Simit Snake, Brick Garage, Kask Avı, Işıklar Sönsün. Toplam 11 oyun.
- City Ride: sürekli artan tempo, nitro, kalkan, mıknatıs, koni/yağ, ortam değişimleri, kıl payı puanı ve 1000 sürprizi.
- 9999 jetonluk kullanılabilir Altın Motor ve tek seferlik ödüllü sekiz keşif.
- Mobil oyun kontrolleri; oyun duraklatıldığında çizim durur; sıfır puanlı tura para/XP verilmez.
- v2–v8 profil yedekleri, yeni oyun rekorları/favorileri/günlük hedefleri.
- Mevcut QR URL'sini koruyarak qr-motor/main/index.html güncellemesi için PowerShell yardımcı dosyası.

## 7.0.0 — 2026-10-07

- Kullanıcının PCX GLB modeli yerel bağımlılıklarla entegre edildi; yaklaşık %87 daha küçük model dosyası.
- Kaydırmaya bağlı gerçek 3D kamera, dokunmatik 360° stüdyo, açı/zoom/sıfırla kontrolleri, gece ışığı ve isteğe bağlı dönüş.
- Ana sayfaya yeni stüdyo bölümü, garaja 3D inceleme kısayolu.
- Mobil kadraj, tek WebGL bağlamı, isteğe bağlı indirme, görünürlük tabanlı çizim, azaltılmış hareket ve SVG hata görünümü.
- GitHub Pages alt dizin, çevrimdışı önbellek ve file:// yönlendirmesi; v2–v7 profil yedekleri.

# Değişiklikler

## 6.0.0 — 2026-10-07

- Üç sahneli kaydırmalı ana sayfa: motor/paralaks/renk geçişleri.
- Kullanıcının PCX SVG görseli korunarak derinlik/perspektif hareketleri.
- Bölüm atlama, hızlı keşif ve isteğe bağlı otomatik tur.
- Kalıcı hareket tercihi; sistem hareket azaltma ve kısa yatay ekran için sade görünüm.
- Yeni keşif bölümü ve ana sayfadan City Ride başlatma.
- Arka plan/görünürlük denetimi; görünmeyen sahnelerde odak engeli.
- v2–v5 yedeklerini kabul eden v6 profil yedeği.

## 5.0.0 — 2026-10-06

- Kişisel park noktası: GPS/manual tarif, harita bağlantısı, geçen süre, kaldırma onayı.
- Kişisel notlar: tür, arama, silme ve son silinen notu geri alma.
- İlerleme merkezi: oyun bazında sayaçlar, son 30 tur ve iki ek günlük hedef.
- v5 veri/yedek şeması; eski v2–v4 yedekleriyle uyum.
- Yön değişiminde oyun duraklatma, devam koruması, klavye odağı ve kaydırma durumunu temizleme.
- Ana sayfadaki kullanıcı PCX SVG görseli korundu.

## 4.0.0 — 2026-10-06

- Kullanıcının sağladığı PCX SVG görseli ana sayfa ve garaja eklendi; orantılı ölçekleme ve boşluk kırpma.

- Lane Split yerine özgün vektör araçlarla City Ride: kaydırma, düğme/klavye kontrolü, jetonlar, üç can ve artan zorluk.
- Yeni City 2048 (otomatik kayıt/geri alma), Sky Stack ve Signal Loop.
- Green Light, Tap Rush ve Match Club için ortak oyun ekranı.
- Duraklat/devam et, sekme arka planında duraklama, sonuç/yeniden oynama/skor paylaşımı.
- Favoriler, oyun filtreleri, son oyun, günlük bonus ve jetonla açılan renkler.
- GitHub Pages alt klasör desteği; file:// açılışında manifest yüklemesini atlama.
- v2/v3 kayıtlarını koruyan veri genişletmesi, v4 JSON yedekleri.


## 3.0.0 — 2026-10-06

### Tasarım
- City Edition: sade renk sistemi, özgün vektör scooter, tutarlı arayüz ikonları.
- Mobil ve masaüstü için farklı navigasyon ve düzen.
- İletişim odaklı ana sayfa; boş gelecek özellik kartlarının kaldırılması.
- Açık/koyu tema, erişilebilir odak görünümü, dialog rolleri ve odak yönetimi.

### Eklenenler
- Profil JSON yedekleme/geri yükleme ve dosya doğrulama.
- Lane Split için klavye yön tuşları.
- Konum alındıktan sonra WhatsApp'a gönderme bağlantısı.

### Düzeltmeler
- Tüm kapatma yollarında oyun timer/animation temizliği.
- Arka plana geçildiğinde aktif oyunun durdurulması.
- Lane Split'te aynı bitiş için tekrar ödül yazılması önlemi.
- Hafıza kartları için Fisher–Yates karıştırma ve timer temizliği.
- Gizli rozet ödülünün tekrar tekrar alınmasının engellenmesi.
- Gün değişiminde görev reseti ve ödül sonrası seviye/rozet hesabı.
- Profil adının düzenleme alanına yüklenmesi ve tarayıcı geri/ileri navigasyonu.
- localStorage yazma hatalarında arayüzü açık tutma ve yedekleme uyarısı.
- Ses bittiğinde AudioContext kapatma.
- Service worker temizliğinin yalnızca PCX önbellekleriyle sınırlandırılması.
- Çevrimdışı gezinmede uygulamaya dönüş; dosya isteklerine HTML dönmeme.

## 2.0.0
- İlk modüler dijital garaj, dört oyun, yerel profil ve PWA sürümü.

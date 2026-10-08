# v8.0.0 doğrulama

2026-10-08 · Playwright / Headless Chromium.

## Geçen kontroller

- 11 oyunun gerçek arayüzden açılması, başlaması, duraklaması, devam etmesi ve kapatılması; yakalanmamış JavaScript hatası yok.
- Simit Snake: gerçek zamanlı duvar çarpışmasıyla sonuç ekranı ve tur kaydı.
- Işıklar Sönsün: üretilmiş tahtanın çözümü gerçek düğmelere basılarak tamamlandı; skor/keşif kaydı doğrulandı.
- Brick Garage: sabit zaman adımlı kontrolcü simülasyonunda üç etap, 2100 puan ve bitiriş keşfi doğrulandı.
- Kask Avı: kontrolcü simülasyonunda kasklara basılarak 25 saniyelik tur tamamlandı; puan üretimi doğrulandı.
- City Ride simülasyonu: zamanla monoton artan temel hız, nitro tüketimi/dolumu, kalkan/mıknatıs/şarj/jeton/yağ etkileri, üç çarpışmayla bitiş, engel sırasında serbest şerit ve 1000 olayının tek sefer oluşması.
- 320×568, 390×844 ve 844×390 ekranlarında yarış ve nitro düğmelerine erişim; yatay taşma yok.
- DOKUNMA keşfinin yalnızca bir kez 25 jeton vermesi; pahalı vitrin keşfi.
- Altın Motor için yetersiz bakiye, 9999 jetonla satın alma, tekrar seçerken yeniden ücret alınmaması.
- v7 profil yedeğinde eski notların, ismin ve kayıtların korunması; yeni alanların varsayılanlarla tamamlanması.
- Park ve kişisel not arayüzleri kaldırıldı. Yeni oyun çevrimdışı açıldı; `/pcx-hub/` alt dizin yolları çalıştı.
- Sonraki oyuna geçerken önceki bildirim ve konfeti temizlenir; tur içi sırlar sonuç ekranında listelenir.

## Sınırlar

Fiziksel telefonlarda, Safari ve Floorp/Firefox üzerinde test yapılmadı. Ekran/dokunma emülasyonu gerçek cihaz FPS/pil ölçümü değildir. 3D varlıkları değiştirilmedi; önceki 3D testleri TESTING-v7.md içindedir. GitHub'a burada yayın yapılmadı. PowerShell yükleme dosyası Windows üzerinde çalıştırılmadı.

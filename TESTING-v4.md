# v4.0.0 doğrulama

Chromium otomasyonu ve dokunmatik tarayıcı emülasyonu ile:

- 320, 390, 768, 1440 px: dört site sayfasında yatay taşma yok.
- 320 × 568 dikey / 844 × 390 yatay: yedi oyun panelinde yatay taşma yok.
- Yedi oyunda başlatma, duraklatma, devam ve kapatma: geçti.
- City Ride dokunmatik yön düğmesi ve duraklatıldığında sayacın sabit kalması: geçti.
- 2048 birleştirme kuralları (çifte birleştirmeyi önleme), geçersiz hamlede değişmeme: geçti.
- 2048 kayıt, oyunu kapatıp devam etme ve tur bitirme: geçti.
- Favori seçme, filtreleme ve yenilemede korunması: geçti.
- Renk satın alma; sahip olunan renkte tekrar jeton düşmemesi: geçti.
- Green Light sonuç ve rekor; Tap Rush tur tamamlama: geçti.
- Sky Stack ilk kat yerleştirme: geçti.
- Match Club altı çift, altı hamle sonucu: geçti.
- Signal Loop üç doğru tur: geçti. Tur geçişinde önceki ışığın temizlenmesi doğrulandı.
- v4 yedek geri yükleme (favori ve seçili renk dahil): geçti.
- `/pcx-hub/` alt yolundan açılış ve çevrimdışı oyun açma: geçti.
- file:// açılışı: manifest isteği yok; Sky Stack başlıyor.
- Kullanıcı PCX SVG'si: iki sayfada yüklenme ve dört genişlikte taşma kontrolü geçti; mobil/masaüstü görsel inceleme yapıldı.
- Bu test akışında yakalanan JavaScript çalışma zamanı hatası: 0.

Fiziksel iPhone/Safari, Firefox ve Android cihazlarda test yapılmadı. Gerçek WhatsApp gönderimi, arama veya konum paylaşımı yapılmadı. Ekran emülasyonu gerçek cihaz performans testi değildir.

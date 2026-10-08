# v7.0.0 doğrulama

2026-10-07 · Headless Chromium + yazılım WebGL (SwiftShader), Playwright.

- GitHub Pages benzeri `/pcx-hub/` alt dizininden açılış ve göreli GLB/bundle yolları.
- İlk ziyarette GLB isteği yok; açık kullanıcı isteği sonrası GLB yüklenir.
- 320×568, 390×844, 768×900, 1440×1000, 844×390 ekranlarında stüdyo kontrolleri ekrana sığar; yatay taşma yok.
- Gerçek WebGL çizimi, dört kamera açısı, yakınlaştırma ile değişen çizim, gündüz/gece ışığı.
- Dokunmatik olaylarla model döndürme ve kaydırma ile değişen 3D sahne doğrulandı.
- Aynı canvas stüdyoya taşınır ve kapanınca ana sayfaya döner; ek bağlam açılmaz.
- Escape ile kapanma, odağın geri dönmesi, sayfa kaydırmasının açılması.
- Sistem hareket azaltma seçeneği yavaş dönüşü durdurur ve düğmesini devre dışı bırakır.
- İlk başarılı kullanımdan sonra çevrimdışı 3D açılışı.
- Model isteği 404 olduğunda SVG kalır; yeniden deneme ile model açılır.
- file:// kullanımı 3D ağ isteği yerine GitHub Pages / HTTP açıklamasını gösterir.
- Ana sayfa sahneleri, hareket tercihi, iletişim, oyun başlatma ve sayfa gezinmesi için regresyon kontrolleri.

Önizlemeler `preview/` klasöründedir. Bunlar gerçek sayfanın tarayıcı ekran görüntüleridir.

## Sınırlar

Fiziksel iPhone/Android, Safari ve Floorp/Firefox bu ortamda çalıştırılmadı. Tarayıcı boyut/dokunma emülasyonu gerçek cihaz FPS veya pil ölçümü değildir. Gerçek GitHub hesabına yayın yapılmadı; dağıtım yolları yerel HTTP alt dizininde doğrulandı. WebGL2 kullanamayan cihazlarda SVG görünümü korunur.

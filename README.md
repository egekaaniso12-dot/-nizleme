# EgeHS AI Vitrin

EgeHS Medya için işletme bilgilerini yapay zekâ ile tanıtım metinlerine ve tek sayfalık bir web vitrini önizlemesine dönüştüren açık kaynaklı masaüstü uygulaması.

## Özellikler

- OpenAI, Google Gemini, OpenRouter, DeepSeek, Groq ve özel OpenAI uyumlu sağlayıcılar
- API anahtarı ve model ayarlarını uygulama içinden yönetme
- İşletme bilgilerine göre Türkçe web vitrini, sosyal medya metni, Google İşletme Profili açıklaması ve marka mesajı üretme
- Altı farklı site teması; logo, kapak fotoğrafı ve ürün fotoğrafı ekleme
- Adres, çalışma saatleri, Instagram, WhatsApp ve telefon bağlantıları içeren kapsamlı vitrin
- Görselleri HTML dosyasına gömerek dışa aktarma, canlı önizleme ve yerel proje arşivi
- GitHub Releases üzerinden sürüm kontrolü ve uygulama içinden güncelleme indirme/kurma
- Windows x64 kurulum dosyası ve kaynak kodu açık MIT lisansı

## Windows uygulaması

Son Windows kurulum dosyasını [Releases](../../releases/latest) sayfasından indirin. Dosyayı çalıştırıp kurulumu tamamlayın.

## Geliştirme ve paketleme

Node.js 22 veya üzeri gerekir.

```bash
npm install
npm start
```

Windows kurulum dosyasını Windows üzerinde oluşturmak için:

```bash
npm run dist:win
```

`main` dalına gönderilen her güncelleme GitHub Actions ile Windows x64 NSIS kurulum paketi ve otomatik güncelleme dosyaları üretip yeni bir GitHub Release olarak yayımlar. Uygulama yeni sürüm bulduğunda güncelleme bildirimi gösterir; indirme ve kurma uygulama içinden yapılır. Ayrıca kaynak kod, GitHub Pages önizlemesi için yapılandırılmıştır.

## API ayarları ve gizlilik

Masaüstü uygulamasında API anahtarları Electron `safeStorage` ile şifrelenerek uygulamanın kullanıcı ayarlarında tutulur. Anahtarlar GitHub deposuna gönderilmez. Sağlayıcıların API kullanımı hesaplarında ücret oluşturabilir; sağlayıcı hesabınızın limit ve fiyatlarını kontrol edin.

GitHub Pages önizlemesinde, tarayıcı API isteklerini doğrudan sağlayıcıya gönderir. Bu önizleme anahtarları o tarayıcının yerel depolamasında tutar; paylaşılan bir bilgisayarda gerçek anahtar kullanmayın. Bazı API sağlayıcıları web tarayıcısından gelen istekleri CORS nedeniyle engelleyebilir; Windows uygulaması bu kısıtı kullanmaz.

## Lisans

MIT. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.

// api/analyze.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Vercel sunucu fonksiyonu
module.exports = async (req, res) => {
  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Gelen veriyi al (Metin ve Resim)
    const { prompt, image, mimeType } = req.body;

    // 2. Google API Anahtarını güvenli ortamdan çek
    // (Bu anahtarı kodun içine YAZMIYORUZ, Vercel panelinden ekleyeceğiz)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Modeli seç
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. Google'a gönderilecek paketi hazırla
    let parts = [{ text: prompt }];

    if (image) {
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: image
        }
      });
    }

    // 4. Analizi Başlat
    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
      // Sistem talimatını frontend'den de gönderebilirsiniz veya buraya gömebilirsiniz.
      // Şimdilik basit tutuyoruz, frontend prompt'u her şeyi içerecek.
    });

    const response = await result.response;
    const text = response.text();

    // 5. Sonucu Frontend'e (Senin HTML sayfana) geri gönder
    res.status(200).json({ result: text });

  } catch (error) {
    console.error("API Hatası:", error);
    res.status(500).json({ error: error.message || "Sunucu tarafında bir hata oluştu." });
  }
};

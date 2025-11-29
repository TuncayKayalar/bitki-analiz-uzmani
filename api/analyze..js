const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Gelen veriyi al
    const { prompt, image, mimeType } = req.body;

    // 2. API Anahtarını Vercel ayarlarından çek
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı. Vercel Environment Variables ayarını kontrol edin.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      contents: [{ role: "user", parts: parts }]
    });

    const response = await result.response;
    const text = response.text();

    // 5. Sonucu Frontend'e geri gönder
    res.status(200).json({ result: text });

  } catch (error) {
    console.error("API Hatası:", error);
    res.status(500).json({ error: error.message || "Sunucu hatası oluştu." });
  }
};

const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, image, mimeType } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ÖNEMLİ DEĞİŞİKLİK: 'googleSearch' aracı burada aktif ediliyor.
    // Artık model internete bağlanıp gerçek videoları bulabilecek.
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        tools: [{ googleSearch: {} }] 
    });

    let parts = [{ text: prompt }];

    if (image) {
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: image
        }
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }]
    });

    const response = await result.response;
    const text = response.text();

    // 5. Sonucu Frontend'e gönder
    res.status(200).json({ result: text });

  } catch (error) {
    console.error("API Hatası:", error);
    res.status(500).json({ error: error.message || "Sunucu hatası oluştu." });
  }
};

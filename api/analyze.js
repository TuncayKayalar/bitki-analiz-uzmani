const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // CORS İzinleri
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, image, mimeType } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY ortam değişkeni bulunamadı.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ✅ DÜZELTME: gemini-1.5-flash kullanıyoruz (daha stabil ve hızlı)
    // Eğer gemini-1.5-flash da çalışmazsa, aşağıdaki alternatifleri dene:
    // - "gemini-2.0-flash"
    // - "gemini-pro-vision"
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash"
    });

    let parts = [{ text: prompt }];
    
    // Görüntü ekle
    if (image) {
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: image
        }
      });
    }

    // AI'ye sor
    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }]
    });

    const response = await result.response;
    const text = response.text();

    res.status(200).json({ result: text });

  } catch (error) {
    console.error("❌ API Hatası:", error.message);
    
    // Hata türüne göre mesaj
    let errorMsg = error.message;
    if (error.message.includes("404")) {
      errorMsg = "Model bulunamadı. Lütfen API anahtarını kontrol edin.";
    } else if (error.message.includes("401")) {
      errorMsg = "API anahtarı geçersiz.";
    } else if (error.message.includes("429")) {
      errorMsg = "Çok fazla istek. Lütfen biraz bekleyin.";
    }

    res.status(500).json({ 
      error: errorMsg
    });
  }
};

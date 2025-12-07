const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, image, mimeType } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable bulunamadı.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // En güncel ve hızlı model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
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

    res.status(200).json({ result: text });

  } catch (error) {
    console.error("API Hatası:", error);
    
    // Daha detaylı hata mesajları
    let errorMessage = "Sunucu tarafında işlem hatası.";
    
    if (error.message.includes("API key")) {
      errorMessage = "API anahtarı geçersiz veya eksik.";
    } else if (error.message.includes("quota")) {
      errorMessage = "API kullanım kotası aşıldı.";
    } else if (error.message.includes("model")) {
      errorMessage = "Model bulunamadı veya desteklenmiyor.";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

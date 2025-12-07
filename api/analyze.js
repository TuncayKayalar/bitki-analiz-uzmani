const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // CORS ayarları
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
      throw new Error("API Anahtarı bulunamadı.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // DEĞİŞİKLİK: Model ismini en garantili sürüm koduyla değiştirdik.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-001", // En kararlı sürüm
      // tools: [{ googleSearch: {} }] // Şimdilik search'ü kapatalım, temel analiz çalışsın.
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
    console.error("API Error:", error);
    res.status(500).json({ 
      error: error.message || "Sunucu hatası." 
    });
  }
};

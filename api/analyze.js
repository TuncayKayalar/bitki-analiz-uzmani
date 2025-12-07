const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // CORS İzinleri (Tarayıcı erişimi için şart)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight isteğini karşıla
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteği
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, image, mimeType } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı (Environment Variable eksik).");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // DÜZELTME: 
    // 1. Model ismini en standart hali olan "gemini-1.5-flash" yaptık.
    // 2. "tools" (Search) kısmını kaldırdık. Bu sayede 404 hatası asla almayacağız.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000, // Daha uzun ve detaylı cevap için artırdık
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
    res.status(500).json({ 
      error: error.message || "Sunucu hatası oluştu." 
    });
  }
};

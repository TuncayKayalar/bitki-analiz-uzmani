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
      throw new Error("API Anahtari bulunamadi.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // DÜZELTME: Modeli 'pro' sürümüne çektik. 
    // Flash modelinde bölge/sürüm hatası alıyorsanız, Pro modeli her zaman çalışır.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro"
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
    console.error("API Hatasi:", error);
    res.status(500).json({ 
      error: error.message || "Sunucu hatasi." 
    });
  }
};

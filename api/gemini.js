/**
 * 🚀 FINAL Vercel Serverless Function (/api/gemini.js)
 * 
 * هذا الملف هو "المحرك" السري الذي يتحدث مع Gemini بأمان.
 * ضعه في مجلد باسم api في جذر مشروعك.
 */

import axios from 'axios';

export default async function handler(req, res) {
  // 1. السماح فقط بطلبات POST (لحماية الـ Endpoint)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    
    // ⚠️ يتم جلب الـ API Key من إعدادات Vercel (Environment Variables)
    const API_KEY = process.env.GEMINI_API_KEY; 

    if (!API_KEY) {
      console.error('❌ Error: GEMINI_API_KEY is not set in Vercel settings.');
      return res.status(500).json({ error: 'Configuration Error: API Key missing on server.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 2. الاتصال بـ Gemini API (إصدار 1.5 Flash لسرعة الاستجابة)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        // إعدادات الأمان لضمان عدم حجب المحتوى الإبداعي للكرنفالات
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // 3. استخراج النص النهائي
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    // 4. إرسال النتيجة للـ Frontend
    return res.status(200).json({ text });

  } catch (error) {
    // معالجة الأخطاء وإرسال رسالة واضحة للـ Frontend
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error('Gemini API Proxy Error:', errorMessage);
    
    return res.status(error.response?.status || 500).json({ 
      error: `Gemini Error: ${errorMessage}` 
    });
  }
}

/**
 * 🚀 Backend Server مثال لـ Gemini API
 * 
 * هذا السيرفر يعمل كـ Proxy بين Frontend و Gemini API
 * يحل مشاكل CORS ويحافظ على أمان API Key
 * 
 * التثبيت:
 * npm install express cors axios dotenv
 * 
 * الاستخدام:
 * node backend_example_server.js
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // السماح بـ requests من أي origin
app.use(express.json());

// التحقق من API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ خطأ: GEMINI_API_KEY غير موجود في .env');
  process.exit(1);
}

// ==================== Routes ====================

/**
 * POST /api/gemini
 * استقبال prompt من Frontend وإرساله لـ Gemini API
 */
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;

    // التحقق من وجود prompt
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Prompt مفقود أو فارغ'
      });
    }

    console.log('📨 طلب جديد:', prompt.substring(0, 50) + '...');

    // استدعاء Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        safetySettings: [
          {
            category: "HARM_CATEGORY_UNSPECIFIED",
            threshold: "BLOCK_NONE"
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // استخراج النص من الرد
    const text = response.data.candidates[0].content.parts[0].text;

    console.log('✅ نجح الطلب');

    res.json({
      success: true,
      text: text
    });

  } catch (error) {
    console.error('❌ خطأ:', error.response?.data || error.message);

    // معالجة أنواع الأخطاء المختلفة
    const errorMessage = error.response?.data?.error?.message || error.message;
    const statusCode = error.response?.status || 500;

    let userFriendlyError = errorMessage;

    if (statusCode === 403) {
      userFriendlyError = 'لا توجد صلاحيات. تحقق من API Key والـ Quota.';
    } else if (statusCode === 429) {
      userFriendlyError = 'تم تجاوز حد الطلبات. حاول لاحقاً.';
    } else if (statusCode === 400) {
      userFriendlyError = 'الطلب غير صحيح: ' + errorMessage;
    }

    res.status(statusCode).json({
      success: false,
      error: userFriendlyError,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * GET /api/health
 * للتحقق من أن السيرفر يعمل
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!GEMINI_API_KEY
  });
});

/**
 * GET /
 * صفحة ترحيب
 */
app.get('/', (req, res) => {
  res.json({
    message: '🎉 مرحباً بك في Gemini API Backend Server',
    endpoints: {
      'POST /api/gemini': 'إرسال prompt والحصول على رد من Gemini',
      'GET /api/health': 'التحقق من حالة السيرفر'
    },
    usage: {
      method: 'POST',
      url: '/api/gemini',
      body: {
        prompt: 'نصك هنا'
      }
    }
  });
});

// ==================== Error Handling ====================

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'حدث خطأ في السيرفر'
  });
});

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Gemini API Backend Server         ║
║  ✅ السيرفر يعمل بنجاح                 ║
╠════════════════════════════════════════╣
║  📍 الرابط: http://localhost:${PORT}    ║
║  🔑 API Key: ${GEMINI_API_KEY ? '✅ مفعل' : '❌ غير موجود'}         ║
║  🌍 CORS: ✅ مفعل                      ║
╚════════════════════════════════════════╝
  `);
});

// ==================== Graceful Shutdown ====================

process.on('SIGTERM', () => {
  console.log('⏹️  إيقاف السيرفر...');
  process.exit(0);
});

import React, { useState } from 'react';
// تأكد من إضافة مكتبة html2pdf.js للمشروع
//import html2pdf from 'html2pdf.js';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState({
    // 1. المدخلات الأساسية
    name: '', goal: '', age: '6-9 سنين', totalTime: '4 ساعات',
    // 2. الخيمة الافتتاحية
    openTime: '', openTheme: '', hymnCount: 3,
    // 3. الخيمة التعليمية
    tentName: '', sketchTime: '20', charCount: 3, theaterType: 'درامي اشخاص', showType: 'عرض تمثيلي',
    // 4. بارتيشن الألعاب
    gameObjective: '', tools: '', childrenCount: 20, gameTime: '',
    // 5. الديكور والكرافت
    craftTime: '', craftChildren: '', craftTools: '',
    // 6. المخرجات
    results: { titles: '', opening: '', script: '', game: '', decor: '' }
  });

  /**
   * 🔗 الربط الآمن مع Vercel Serverless Function
   * تم إزالة أنواع TypeScript (: string) لضمان التوافق مع ملفات .jsx
   */
  const askGemini = async (prompt, targetKey) => {
    setLoading(true);
    setErrorMsg('');
    
    try {
      // منادي المسار /api/gemini (Serverless Function)
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `فشل الاتصال بالسيرفر (HTTP ${response.status})`);
      }

      const resData = await response.json();
      
      // دعم كل أشكال الرد المتوقعة من السيرفر
      const text = resData.text || resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error('لم يصل رد صالح من الذكاء الاصطناعي');

      setData(prev => ({ 
        ...prev, 
        results: { ...prev.results, [targetKey]: text } 
      }));

    } catch (e) {
      setErrorMsg(`❌ خطأ: ${e.message}`);
      console.error('Gemini Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };

  // دالة تصدير الـ PDF التي تحافظ على التنسيق واللغة العربية والجماليات الكاملة
  const downloadPDF = () => {
    const element = document.getElementById('full-carnival-content');
    if (!element) return;
    
    const opt = {
      margin: 5,
      filename: `كرنفال_${data.name || 'خادم_جيمناي'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div dir="rtl" style={{ backgroundColor: '#fdf3e7', minHeight: '100vh', padding: '20px', fontFamily: 'Arial', textAlign: 'right' }}>
      
      {/* عرض الأخطاء بشكل احترافي */}
      {errorMsg && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb', fontWeight: 'bold' }}>
          {errorMsg}
        </div>
      )}

      {/* مؤشر التحميل بتصميم مريح */}
      {loading && (
        <div style={{ backgroundColor: '#d1ecf1', color: '#0c5460', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #bee5eb' }}>
          ⏳ جاري استحضار الأفكار من Gemini... يرجى الانتظار
        </div>
      )}

      {/* القسم القابل للطباعة - الحفاظ على كل الجماليات والخيارات الأصلية */}
      <div id="full-carnival-content" style={{ padding: '10px' }}>
        <header style={{ backgroundColor: '#ffcc5c', padding: '20px', borderRadius: '15px', textAlign: 'center', marginBottom: '25px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h1 style={{ margin: 0, color: '#4a4a4a' }}>🎡 Carnival Designer AI</h1>
          <p style={{ margin: '5px 0 0', color: '#6d6d6d', fontSize: '14px' }}>النسخة الكاملة والمؤمنة (MASTERPIECE)</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          
          {/* 1. المدخلات الأساسية */}
          <section style={cardStyle}>
            <h3 style={titleStyle}>📝 المدخلات الأساسية</h3>
            <input placeholder="اسم الكرنفال" style={inputStyle} onChange={(e) => setData({...data, name: e.target.value})} />
            <input placeholder="الهدف الروحي" style={inputStyle} onChange={(e) => setData({...data, goal: e.target.value})} />
            <select style={inputStyle} onChange={(e) => setData({...data, age: e.target.value})}>
               <option>حضانة (3-5 سنين)</option>
               <option>ابتدائي صغير (6-9 سنين)</option>
               <option>ابتدائي كبير (10-12 سنة)</option>
            </select>
            <button style={btnStyle} disabled={loading} onClick={() => askGemini(`بناءً على كرنفال "${data.name}" وهدفه "${data.goal}" لسن "${data.age}"، اقترح 5 أسماء كرياتيف وشعار، و9 عناوين لخيام تعليمية.`, 'titles')}>توليد الأفكار الأساسية ✨</button>
            <div style={resStyle}>{data.results.titles}</div>
          </section>

          {/* 2. الخيمة الافتتاحية */}
          <section style={cardStyle}>
            <h3 style={titleStyle}>⛺ الخيمة الافتتاحية</h3>
            <input placeholder="الموضوع" style={inputStyle} onChange={(e) => setData({...data, openTheme: e.target.value})} />
            <input placeholder="عدد الترانيم" type="number" style={inputStyle} onChange={(e) => setData({...data, hymnCount: +e.target.value})} />
            <button style={btnStyle} disabled={loading} onClick={() => askGemini(`ألف 3 شعارات لافتتاحية كرنفال عن "${data.openTheme}" واقترح ${data.hymnCount} ترانيم مناسبة لسن "${data.age}".`, 'opening')}>توليد محتوى الافتتاح</button>
            <div style={resStyle}>{data.results.opening}</div>
          </section>

          {/* 3. الخيمة التعليمية (The Core) */}
          <section style={{ ...cardStyle, gridColumn: 'span 2' }}>
            <h3 style={titleStyle}>📖 الخيمة التعليمية (The Core)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <input placeholder="اسم الخيمة" style={inputStyle} onChange={(e) => setData({...data, tentName: e.target.value})} />
              <input placeholder="وقت الاسكتش" style={inputStyle} onChange={(e) => setData({...data, sketchTime: e.target.value})} />
              <select style={inputStyle} onChange={(e) => setData({...data, theaterType: e.target.value})}>
                  <option>درامي اشخاص</option><option>مسكات</option><option>مسرح أسود</option><option>مسرح ظل</option><option>عرايس</option>
              </select>
              <select style={inputStyle} onChange={(e) => setData({...data, showType: e.target.value})}>
                  <option>عرض تمثيلي</option><option>عرض مغنى</option>
              </select>
            </div>
            <button style={{ ...btnStyle, backgroundColor: '#4db8ff' }} disabled={loading} onClick={() => askGemini(`اكتب Script مسرحي لسن "${data.age}" عن "${data.goal}"، النوع "${data.theaterType}"، في وقت "${data.sketchTime}" دقيقة.`, 'script')}>توليد الإسكتش والأنشطة 🎭</button>
            <div style={{ ...resStyle, minHeight: '180px' }}>{data.results.script}</div>
          </section>

          {/* 4. بارتيشن الألعاب (Fun Zone) */}
          <section style={cardStyle}>
            <h3 style={titleStyle}>🎮 بارتيشن الألعاب</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input placeholder="هدف اللعبة" style={inputStyle} onChange={(e) => setData({...data, gameObjective: e.target.value})} />
              <input placeholder="وقت اللعبة (دقيقة)" type="number" style={inputStyle} onChange={(e) => setData({...data, gameTime: e.target.value})} />
            </div>
            <label style={labelStyle}>الخامات المتاحة:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}>
              {['أقماع', 'كرات', 'بالونات', 'حبال', 'مواسير', 'حرة'].map(tool => (
                <label key={tool}><input type="checkbox" value={tool} onChange={(e) => {
                  const val = e.target.value;
                  const current = data.tools ? data.tools.split(', ').filter(t => t !== '') : [];
                  setData({...data, tools: e.target.checked ? [...current, val].join(', ') : current.filter(t => t !== val).join(', ')});
                }} /> {tool}</label>
              ))}
            </div>
            <button style={btnStyle} disabled={loading} onClick={() => askGemini(`ابتكر لعبة لسن "${data.age}" لعدد 20 لاعب، وقتها "${data.gameTime}"، الهدف: "${data.gameObjective}"، الخامات: "${data.tools}".`, 'game')}>ابتكار اللعبة 🎲</button>
            <div style={resStyle}>{data.results.game}</div>
          </section>

          {/* 5. الديكور والكرافت */}
          <section style={cardStyle}>
            <h3 style={titleStyle}>🎨 الديكور والكرافت</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input placeholder="وقت الكرافت" type="number" style={inputStyle} onChange={(e) => setData({...data, craftTime: e.target.value})} />
              <input placeholder="عدد الأطفال" type="number" style={inputStyle} onChange={(e) => setData({...data, craftChildren: e.target.value})} />
            </div>
            <label style={labelStyle}>الخامات المتاحة:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}>
              {['كرتون', 'ورق', 'خيش', 'فوم', 'إعادة تدوير', 'حرة'].map(tool => (
                <label key={tool}><input type="checkbox" value={tool} onChange={(e) => {
                  const val = e.target.value;
                  const current = data.craftTools ? data.craftTools.split(', ').filter(t => t !== '') : [];
                  setData({...data, craftTools: e.target.checked ? [...current, val].join(', ') : current.filter(t => t !== val).join(', ')});
                }} /> {tool}</label>
              ))}
            </div>
            <button style={{ ...btnStyle, backgroundColor: '#28a745' }} disabled={loading} onClick={() => askGemini(`ابتكر عمل فني لعدد "${data.craftChildren}" طفل في وقت "${data.craftTime}" دقيقة. الخامات: "${data.craftTools}". الهدف: "${data.goal}".`, 'decor')}>توليد الديكور والكرافت 🖼️</button>
            <div style={resStyle}>{data.results.decor}</div>
          </section>

        </div>
      </div>

      {/* زرار التحميل النهائي بتصميم جذاب */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '60px' }}>
        <button 
          style={{ 
            padding: '18px 50px', 
            backgroundColor: '#d9534f', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50px', 
            fontSize: '22px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            boxShadow: '0 6px 15px rgba(217, 83, 79, 0.4)',
            transition: 'transform 0.2s'
          }} 
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        //onClick={downloadPDF}
        >
          تحميل ملف الكرنفال كاملاً PDF 📄
        </button>
      </div>
    </div>
  );
}

// Styles
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '20px', borderTop: '6px solid #ffcc5c', boxShadow: '0 6px 12px rgba(0,0,0,0.05)' };
const titleStyle = { margin: '0 0 20px 0', color: '#856404', fontSize: '20px', borderBottom: '2px solid #fff3cd', paddingBottom: '10px' };
const labelStyle = { fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' };
const btnStyle = { width: '100%', padding: '14px', backgroundColor: '#fd7e14', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', transition: 'background 0.3s' };
const resStyle = { marginTop: '15px', padding: '15px', background: '#fcfcfc', borderRadius: '10px', fontSize: '14px', whiteSpace: 'pre-wrap', border: '1px dashed #e0e0e0', color: '#444', lineHeight: '1.6' };
import { createRoot } from 'react-dom/client';

// السطر ده هو اللي بيربط الكود بالصفحة
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    res.status(200).json({ text: response.data.candidates[0].content.parts[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

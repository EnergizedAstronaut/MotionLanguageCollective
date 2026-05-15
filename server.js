import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Proxy /api/analyze → Gemini API (adds key server-side)
app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }
  try {
    const { messages, max_tokens } = req.body;
    const userMsg = messages[0];

    // Convert Anthropic-style content blocks to Gemini parts
    const parts = [];
    const blocks = Array.isArray(userMsg.content)
      ? userMsg.content
      : [{ type: 'text', text: userMsg.content }];

    for (const block of blocks) {
      if (block.type === 'text') {
        parts.push({ text: block.text });
      } else if (block.type === 'image' && block.source?.type === 'base64') {
        parts.push({ inlineData: { mimeType: block.source.media_type, data: block.source.data } });
      }
    }

    const geminiBody = {
      contents: [{ role: 'user', parts }],
      generationConfig: { maxOutputTokens: max_tokens || 1000, temperature: 0.4 },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) }
    );
    const geminiData = await response.json();

    // Normalize to Anthropic-style response shape so the frontend stays unchanged
    const text = geminiData?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '{}';
    res.json({ content: [{ type: 'text', text }] });
  } catch (err) {
    console.error('Gemini proxy error:', err);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});

// Serve built React app
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Motion Language Collective running on port ${PORT}`));

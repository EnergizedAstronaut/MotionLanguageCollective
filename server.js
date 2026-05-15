import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Accepts the same request body shape the React frontend sends
// (Anthropic messages format with base64 image content blocks),
// translates to Gemini format, returns an Anthropic-shaped response.
app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    // ── Extract content blocks from the Anthropic-format request ────────────
    const messages = req.body.messages || [];
    const userMsg = messages.find(m => m.role === 'user');
    if (!userMsg) return res.status(400).json({ error: 'No user message found' });

    const blocks = Array.isArray(userMsg.content) ? userMsg.content : [{ type: 'text', text: userMsg.content }];

    // ── Build Gemini parts array ─────────────────────────────────────────────
    const parts = blocks.map(block => {
      if (block.type === 'text') {
        return { text: block.text };
      }
      if (block.type === 'image') {
        // Anthropic: { source: { type:'base64', media_type, data } }
        return {
          inline_data: {
            mime_type: block.source.media_type,
            data: block.source.data,
          },
        };
      }
      return null;
    }).filter(Boolean);

    // ── Call Gemini 1.5 Flash ────────────────────────────────────────────────
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiBody = {
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 1000,
      },
    };

    const upstream = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    const geminiData = await upstream.json();

    if (!upstream.ok) {
      console.error('Gemini error:', geminiData);
      return res.status(upstream.status).json({ error: geminiData?.error?.message || 'Gemini request failed' });
    }

    // ── Translate Gemini response → Anthropic response shape ────────────────
    // Gemini: candidates[0].content.parts[0].text
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const anthropicShaped = {
      id: 'gemini-translated',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text }],
      model: 'gemini-1.5-flash',
      stop_reason: 'end_turn',
    };

    res.json(anthropicShaped);
  } catch (err) {
    console.error('Gemini proxy error:', err);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});

// ── Serve built React app ────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Crush Calculator (Gemini) running on port ${PORT}`));

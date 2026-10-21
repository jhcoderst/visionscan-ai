require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'VisionScan AI backend active' });
});

app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Falta GEMINI_API_KEY. Añádela en el archivo .env'
    });
  }

  const { image } = req.body || {};

  if (!image) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
  }

  const prompt = `Eres una IA experta en reconocimiento visual en español. Analiza la imagen y responde ÚNICAMENTE en formato JSON válido con esta estructura exacta:
  {
    "nombre": "Nombre preciso del objeto en español",
    "categoria": "Categoría (ej: Tecnología, Naturaleza, Alimentos, Mobiliario, Animales, Herramientas)",
    "confianza": "Porcentaje estimado de certeza entre 80% y 99%",
    "descripcion": "Descripción clara, concisa y detallada de 2 a 3 frases sobre el elemento principal.",
    "datoCurioso": "Un dato curioso, histórico o científico interesante sobre este elemento.",
    "elementosSecundarios": ["Elemento 1", "Elemento 2", "Elemento 3"]
  }`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Gemini:', errorText);
      return res.status(response.status).json({
        error: 'La API de Gemini respondió con un error.',
        details: errorText
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: 'La IA no devolvió contenido útil.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      const cleaned = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json(parsed);
  } catch (error) {
    console.error('Error al analizar imagen:', error);
    res.status(500).json({ error: 'Error interno del backend al procesar la imagen.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`VisionScan AI running at http://localhost:${PORT}`);
});

require("dotenv").config({ path: "./server/key.env" });
const path = require('node:path');
const fs = require('node:fs/promises');
const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
//const OpenAI = require("openai");


const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 5050;
/**console.log("API KEY LOADED:", process.env.OPENAI_API_KEY ? "YES" : "NO");
//console.log("Working directory:", process.cwd());
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});**/

app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/parse', upload.single('file'), async (req, res) => {
  try {
    let buffer;

    if (req.file?.buffer) {
      buffer = req.file.buffer;
    } else if (req.body?.path) {
      const requestedPath = req.body.path;
      const resolvedPath = path.isAbsolute(requestedPath)
        ? requestedPath
        : path.resolve(process.cwd(), requestedPath);

      if (!resolvedPath.toLowerCase().endsWith('.pdf')) {
        return res.status(400).json({ error: 'Only .pdf files are supported.' });
      }

      buffer = await fs.readFile(resolvedPath);
    } else {
      return res.status(400).json({
        error: 'Provide a PDF via multipart field "file" or JSON body { "path": "path/to/file.pdf" }.',
      });
    }

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    const limit = Number.parseInt(req.query.limit ?? '', 10);
    const text = Number.isFinite(limit) && limit > 0 ? result.text.slice(0, limit) : result.text;

    res.json({
      pages: result.total ?? result.numpages ?? null,
      text,
    });
  } catch (error) {
    res.status(500).json({ error: error?.message ?? 'Failed to parse PDF.' });
  }
});

/**app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });
    const response = await fetch(
    'https://gateway.pixazo.ai/studio-ghibli/v1/studio-ghibli/generate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.PIXAZO_API_KEY
      },
      body: JSON.stringify({
        prompt: prompt
      })
    }
    );
    const result = await response.json();
    console.log(result);
    const base64Image = response.data[0].base64Image;
    console.log(base64Image);
    res.json({
      image: `data:image/png;base64,${base64Image}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image generation failed" });
  }
});**/


app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`PDF parse server listening on http://localhost:${port}`);
});

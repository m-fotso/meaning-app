require("dotenv").config({ path: require("node:path").resolve(__dirname, "key.env") });
const path = require('node:path');
const fs = require('node:fs/promises');
const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const OpenAI = require("openai");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 5050;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

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
  let parser = null;
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

    // pdf-parse v2: class-based API (v1 used pdf(buffer) promise)
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const limit = Number.parseInt(req.query.limit ?? '', 10);
    const text = Number.isFinite(limit) && limit > 0 ? result.text.slice(0, limit) : result.text;

    res.json({
      pages: result.total ?? null,
      text,
    });
  } catch (error) {
    console.error('[parse]', error);
    res.status(500).json({ error: error?.message ?? 'Failed to parse PDF.' });
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (_) {
        /* ignore cleanup errors */
      }
    }
  }
});

app.post("/generate-image", async (req, res) => {
  if (!openai) {
    return res.status(503).json({ error: "NO_API_KEY" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt.slice(0, 1000),
      n: 1,
      size: "256x256",
      response_format: "url",
    });

    res.json({ url: response.data[0].url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image generation failed" });
  }
});


app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`PDF parse server listening on http://localhost:${port}`);
});

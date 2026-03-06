const path = require('node:path');
const fs = require('node:fs/promises');
const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 5050;

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

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`PDF parse server listening on http://localhost:${port}`);
});

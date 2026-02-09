import cors from 'cors';
import express from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';

const app = express();
const upload = multer();
app.use(cors());

app.post('/parse-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = await pdf(req.file.buffer);

    res.json({
      title: data.info?.Title || 'Untitled',
      author: data.info?.Author || null,
      pages: data.numpages,
      text: data.text,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF parsing failed' });
  }
});

app.listen(3000, () => {
  console.log('PDF parser API running on port 3000');
});
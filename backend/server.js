const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const upload = multer();
const PORT = 3000;

app.use(cors());

app.post('/ocr', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const formData = new FormData();
  formData.append('file', req.file.buffer, { filename: 'image.jpg' });
  formData.append('language', 'eng');
  formData.append('apikey', process.env.OCR_API_KEY);

  try {
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const data = await response.json();
    const parsedText = data?.ParsedResults?.[0]?.ParsedText;
    if (parsedText) {
      res.json({ text: parsedText.trim() });
    } else {
      res.status(422).json({ error: 'Could not extract text' });
    }
  } catch (err) {
    console.error('❌ OCR Upload Failed:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

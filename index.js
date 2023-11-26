const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require("fs")
const crypto = require("crypto");

const app = express();
const port = 8080;

function randomHex(length) {
  const bytes = Math.ceil(length / 2);
  const randomBytes = crypto.randomBytes(bytes);
  return randomBytes.toString('hex').slice(0, length);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/temp/');
  },
  filename: (req, file, cb) => {
    cb(null, randomHex(21) + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    res.status(200).json({
      name: req.file.filename,
      original: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: "/file/" + req.file.filename,
      url: `https://${req.hostname}/file/` + req.file.filename,
    })
  } catch (e) {
    res.status(404).json({
      status: 404,
      message: "An error occurred while uploading the file."
    })
  }
});

app.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/temp', filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ 
      status: 404,
      message: 'File not found' 
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
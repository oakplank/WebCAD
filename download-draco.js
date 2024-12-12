const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/draco_decoder.js',
    filename: 'draco_decoder.js'
  },
  {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/draco_decoder.wasm',
    filename: 'draco_decoder.wasm'
  },
  {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/draco_wasm_wrapper.js',
    filename: 'draco_wasm_wrapper.js'
  }
];

const dracoDir = path.join(__dirname, 'public', 'draco');

// Create directories if they don't exist
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
}
if (!fs.existsSync(dracoDir)) {
  fs.mkdirSync(dracoDir);
}

files.forEach(file => {
  const filePath = path.join(dracoDir, file.filename);
  const fileStream = fs.createWriteStream(filePath);

  https.get(file.url, response => {
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${file.filename}`);
    });
  }).on('error', err => {
    fs.unlink(filePath);
    console.error(`Error downloading ${file.filename}:`, err.message);
  });
}); 
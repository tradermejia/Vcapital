const fs = require('fs');
const path = require('path');

// 1x1 transparent PNG base64
const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const buffer = Buffer.from(pngBase64, 'base64');
fs.writeFileSync(path.join(__dirname, 'public', 'pwa-192x192.png'), buffer);
fs.writeFileSync(path.join(__dirname, 'public', 'pwa-512x512.png'), buffer);
fs.writeFileSync(path.join(__dirname, 'public', 'apple-touch-icon.png'), buffer);
fs.writeFileSync(path.join(__dirname, 'public', 'maskable-icon.png'), buffer);
console.log("Placeholder PWA icons generated.");

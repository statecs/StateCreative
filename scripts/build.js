// Copies only the files the live site uses from new/ into build/.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'new');
const out = path.join(__dirname, '..', 'build');

const files = [
  'index.html',
  'googleaff90c0cbc638f3b.html',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'site.webmanifest',
  'assets/css/style.css',
  'assets/js/site.js',
  'assets/js/vendor/lenis.min.js',
  'assets/img/brand',
];

fs.rmSync(out, { recursive: true, force: true });
for (const f of files) {
  const from = path.join(src, f);
  if (!fs.existsSync(from)) throw new Error(`Missing ${f}`);
  fs.cpSync(from, path.join(out, f), {
    recursive: true,
    filter: (p) => path.basename(p) !== '.DS_Store',
  });
}
console.log(`Built ${files.length} entries → build/`);

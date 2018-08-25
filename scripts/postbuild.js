'use-strict';

// ----------------------------------------------------------------------------
// Replace the path to bundled static files (.js and .css) in the layout.pug
// ----------------------------------------------------------------------------

const path = require('path');
const replace = require('replace-in-file');

const assetsManifest = path.resolve(process.cwd(), 'public', 'assets.json');
const templateLayout = path.resolve(process.cwd(), 'views', 'layout.pug');

const assets = require(assetsManifest);

console.log('Executing post build script....');
console.log('-------------- ASSETS Manifest ----------------');
console.log(assets);

// Replace css bundle
replace.sync({
  files: templateLayout,
  from: /\/public\/dist\/main(\..+)?\.css/g,
  to: `/public/dist/${assets.main.css}`,
});

// Replace js bundle
replace.sync({
  files: templateLayout,
  from: /\/public\/dist\/main(\..+)?\.js/g,
  to: `/public/dist/${assets.main.js}`,
});

// if (process.env.NODE_ENV === 'development') {
//   require('./copyStaticAssets');
// }

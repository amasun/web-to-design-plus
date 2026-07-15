const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  console.log('Starting build...');

  // 1. Clean dist directory
  console.log('Cleaning dist directory...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR);
  fs.mkdirSync(path.join(DIST_DIR, 'logo'));

  // 2. Process and write manifest.json
  console.log('Processing manifest.json...');
  const manifestPath = path.join(SRC_DIR, 'manifest.json');
  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  // Restore name to final production name
  if (manifest.name.endsWith(' (Dev)')) {
    manifest.name = manifest.name.slice(0, -6);
  }
  fs.writeFileSync(path.join(DIST_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  // 3. Copy static assets
  console.log('Copying static assets (Logos)...');
  copyDirSync(path.join(SRC_DIR, 'logo'), path.join(DIST_DIR, 'logo'));

  console.log('Copying offscreen.html...');
  fs.copyFileSync(path.join(SRC_DIR, 'offscreen.html'), path.join(DIST_DIR, 'offscreen.html'));

  console.log('Copying lib directory...');
  if (fs.existsSync(path.join(SRC_DIR, 'lib'))) {
    copyDirSync(path.join(SRC_DIR, 'lib'), path.join(DIST_DIR, 'lib'));
  }

  console.log('Copying _locales directory...');
  if (fs.existsSync(path.join(SRC_DIR, '_locales'))) {
    copyDirSync(path.join(SRC_DIR, '_locales'), path.join(DIST_DIR, '_locales'));
  }

  // 4. Minify JS files
  const jsFiles = ['background.js', 'capture.js', 'inpage-toolbar.js', 'offscreen.js', 'svg-grabber.js', 'font-inspector.js', 'svg-sanitizer.js'];
  for (const file of jsFiles) {
    console.log(`Minifying ${file}...`);
    const srcFilePath = path.join(SRC_DIR, file);
    const destFilePath = path.join(DIST_DIR, file);
    
    if (fs.existsSync(srcFilePath)) {
      const code = fs.readFileSync(srcFilePath, 'utf8');
      try {
        const minified = await minify(code, {
          compress: {
            dead_code: true,
            drop_debugger: true,
            conditionals: true,
            evaluate: true,
            booleans: true,
            loops: true,
            unused: true,
            hoist_funs: true,
            keep_fargs: false,
            if_return: true,
            join_vars: true
          },
          mangle: {
            toplevel: true
          }
        });
        fs.writeFileSync(destFilePath, minified.code, 'utf8');
      } catch (err) {
        console.error(`Error minifying ${file}:`, err);
        process.exit(1);
      }
    } else {
      console.warn(`Warning: File ${file} not found in src/`);
    }
  }

  console.log('Build completed successfully!');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});

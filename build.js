const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const sharp = require('sharp');

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');

// Helper to copy files recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  console.log('Starting build...');

  // 1. Clean dist folder
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir);

  // 2. Copy CNAME, logos, and HTML files
  const rootFiles = ['index.html', 'privacy-policy.html', 'terms-of-service.html', 'CNAME'];
  rootFiles.forEach(file => {
    const srcPath = path.join(srcDir, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(distDir, file));
    }
  });

  if (fs.existsSync(path.join(srcDir, 'logo'))) {
    copyDir(path.join(srcDir, 'logo'), path.join(distDir, 'logo'));
  }

  // 3. Process CSS files (minify)
  const cssSrcDir = path.join(srcDir, 'assets/css');
  const cssDistDir = path.join(distDir, 'assets/css');
  fs.mkdirSync(cssDistDir, { recursive: true });

  const cssFiles = fs.readdirSync(cssSrcDir).filter(f => f.endsWith('.css'));
  const cleanCSS = new CleanCSS();

  cssFiles.forEach(file => {
    const srcPath = path.join(cssSrcDir, file);
    const destPath = path.join(cssDistDir, file);
    const cssContent = fs.readFileSync(srcPath, 'utf8');
    const minified = cleanCSS.minify(cssContent);
    
    if (minified.errors.length) {
      console.error(`CSS Minify errors in ${file}:`, minified.errors);
    }
    fs.writeFileSync(destPath, minified.styles);
    console.log(`Minified CSS: ${file}`);
  });

  // 4. Process images
  const imageSrcDir = path.join(srcDir, 'assets/images');
  const imageDistDir = path.join(distDir, 'assets/images');
  fs.mkdirSync(imageDistDir, { recursive: true });

  const imageFiles = fs.readdirSync(imageSrcDir);
  for (let file of imageFiles) {
    const srcPath = path.join(imageSrcDir, file);
    const destPath = path.join(imageDistDir, file);
    
    const ext = path.extname(file).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      // Copy original image
      fs.copyFileSync(srcPath, destPath);

      // Generate webp version if it doesn't already exist in the source
      const baseName = path.basename(file, ext);
      const webpPath = path.join(imageDistDir, `${baseName}.webp`);

      if (!fs.existsSync(path.join(imageSrcDir, `${baseName}.webp`))) {
        await sharp(srcPath)
          .webp({ quality: 80 })
          .toFile(webpPath);
        console.log(`Generated WebP: ${baseName}.webp`);
      }
    } else {
      // Copy other assets (like WebP or SVG icons) directly
      fs.copyFileSync(srcPath, destPath);
    }
  }

  console.log('Build completed successfully!');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});

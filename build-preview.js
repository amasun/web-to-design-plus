const fs = require('fs');

const code = fs.readFileSync('src/font-inspector.js', 'utf8');

// Extract CSS
const cssMatch = code.match(/function getStyles\(\) {\s*return \`([\s\S]*?)\`;\s*}/);
let css = cssMatch ? cssMatch[1] : '';
css = css.replace(':host', 'body');

// Extract HTML blocks
// closeHtml
const closeMatch = code.match(/function closeHtml\(\) {\s*return \`([\s\S]*?)\`;\s*}/);
const closeHtml = closeMatch ? closeMatch[1] : '';

// renderInspectCard innerHTML
const inspectMatch = code.match(/panelEl\.innerHTML = \`([\s\S]*?)\`;\s*bindPanel\(\);/);
let inspectHtml = inspectMatch ? inspectMatch[1] : '';

if (inspectHtml) {
  // Replace interpolations with dummy values
  inspectHtml = inspectHtml
    .replace(/\$\{closeHtml\(\)\}/g, closeHtml)
    .replace(/\$\{safeFamily\}/g, 'Inter')
    .replace(/\$\{weight\}/g, '500')
    .replace(/\$\{fontStyle\}/g, 'normal')
    .replace(/\$\{letterSp\}/g, '-0.01em')
    .replace(/\$\{textTransform\}/g, 'none')
    .replace(/\$\{textDecoration\}/g, 'none')
    .replace(/\$\{textAlign\}/g, 'left')
    .replace(/\$\{currentSpecimenText\}/g, 'Aa 汉仪细等线 / 1234')
    .replace(/\$\{cleanFamily\}/g, 'Inter')
    .replace(/\$\{size\}/g, '16px')
    .replace(/\$\{lineHt\}/g, '24px')
    .replace(/\$\{color\}/g, '#ffffff');

  // Handle conditionals manually
  // We want to show both Google Font and Best File blocks in preview
  // ${(bestFile || isGF) ? `...` : ""}
  
  // Clean up the template logic wrapping
  inspectHtml = inspectHtml.replace(/\$\{\(bestFile \|\| isGF\) \? \`/g, '');
  inspectHtml = inspectHtml.replace(/\` \: ""\}/g, '');
  
  // ${bestFile ? `...` : `<div class="fi-dl-info"></div>`}
  inspectHtml = inspectHtml.replace(/\$\{bestFile \? \`/g, '');
  inspectHtml = inspectHtml.replace(/\` \: \`<div class="fi-dl-info"><\/div>\`\}/g, '');
  
  // ${isGF ? `...` : ""}
  inspectHtml = inspectHtml.replace(/\$\{isGF \? \`/g, '');
  
  // ${bestFile ? `<button class="fi-btn accent" id="fiBtnDl">↓ ${bestFile.ext.toUpperCase()}</button>` : ""}
  inspectHtml = inspectHtml.replace(/\$\{bestFile\.ext\.toUpperCase\(\)\}/g, 'WOFF2');
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Font Inspector Preview</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <style>
    body {
      background-color: #0b0b0c;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: 'Inter', sans-serif;
    }
    
    ${css}
    
    /* override position for preview */
    .fi-panel {
      position: static;
      display: flex;
      margin: 0;
    }
  </style>
</head>
<body>
  <!-- Inspect Mode Preview -->
  <div class="fi-panel">
    ${inspectHtml}
  </div>

  <script>
    const closeBtn = document.getElementById('fiBtnClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.querySelector('.fi-panel').style.display = 'none';
      });
    }
    const resetBtn = document.getElementById('fiResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const txt = document.getElementById('fiSpecimenText');
        if(txt) txt.textContent = 'Aa 汉仪细等线 / 1234';
      });
    }
  </script>
</body>
</html>`;

fs.writeFileSync('preview/font-inspector-preview.html', html);
console.log('Preview file created successfully!');

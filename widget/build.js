const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

function build() {
  console.log('🔨 Building Lyzr Support Widget...');
  
  try {
    // Read source files
    const widgetJS = fs.readFileSync(path.join(__dirname, 'src/widget.js'), 'utf8');
    const widgetCSS = fs.readFileSync(path.join(__dirname, 'src/widget.css'), 'utf8');
    
    // Create bundled widget with CSS inlined
    const bundledWidget = `
// Lyzr Support Widget v1.0.0
(function() {
  'use strict';
  
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = \`${widgetCSS.replace(/`/g, '\\`')}\`;
  document.head.appendChild(style);
  
  // Widget JavaScript
  ${widgetJS}
})();
`;
    
    // Write to dist
    fs.writeFileSync(path.join(__dirname, 'dist/widget.js'), bundledWidget);
    fs.writeFileSync(path.join(__dirname, 'dist/widget.min.js'), bundledWidget.replace(/\s+/g, ' ').trim());
    
    console.log('✅ Widget built successfully!');
    console.log('📁 Output: dist/widget.js');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
  }
}

// Initial build
build();

if (isWatch) {
  console.log('👀 Watching for changes...');
  fs.watchFile(path.join(__dirname, 'src/widget.js'), () => {
    console.log('🔄 widget.js changed, rebuilding...');
    build();
  });
  fs.watchFile(path.join(__dirname, 'src/widget.css'), () => {
    console.log('🔄 widget.css changed, rebuilding...');
    build();
  });
}

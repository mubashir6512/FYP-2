const fs = require('fs');
const path = require('path');

const filePath = path.join('ai-paint-palace-import', 'ALL_PROJECT_CODE.txt');
if (!fs.existsSync(filePath)) {
  console.error(`Error: ${filePath} not found.`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const regex = /^={40}\r?\n\s*(FILE|SQL MIGRATION):\s*(.*?)\r?\n={40}\r?\n/gm;

let match;
let lastIndex = 0;
let currentFile = null;
const filesToWrite = [];

while ((match = regex.exec(content)) !== null) {
  if (currentFile) {
    const fileContent = content.substring(lastIndex, match.index);
    filesToWrite.push({ ...currentFile, content: fileContent });
  }
  currentFile = {
    type: match[1],
    srcPath: match[2]
  };
  lastIndex = regex.lastIndex;
}

if (currentFile) {
  const fileContent = content.substring(lastIndex);
  filesToWrite.push({ ...currentFile, content: fileContent });
}

console.log(`Found ${filesToWrite.length} entries. Starting extraction...`);

filesToWrite.forEach(file => {
  let destPath = '';
  const cleanPath = file.srcPath.replace(/\\/g, '/');
  
  if (file.type === 'SQL MIGRATION') {
    destPath = path.join('backend', 'db', 'migrations', path.basename(cleanPath));
  } else if (cleanPath.includes('src/')) {
    const relativePart = cleanPath.split('src/')[1];
    destPath = path.join('frontend', 'src', relativePart);
  } else if (cleanPath.includes('supabase/functions/')) {
    const relativePart = cleanPath.split('supabase/functions/')[1];
    destPath = path.join('backend', 'db', 'functions', relativePart);
  } else if (cleanPath.endsWith('docs/schema.prisma')) {
    destPath = path.join('backend', 'prisma', 'schema.prisma');
  } else {
    const filename = path.basename(cleanPath);
    if ([
      'package.json', 'package-lock.json', 'tailwind.config.ts', 'tsconfig.json', 
      'tsconfig.app.json', 'tsconfig.node.json', 'vite.config.ts', 'vitest.config.ts', 
      'eslint.config.js', 'components.json', 'postcss.config.js', 'index.html'
    ].includes(filename)) {
      destPath = path.join('ai-paint-palace-import', 'configs', filename);
    } else {
      console.log(`Skipping unknown file path: ${file.srcPath}`);
      return;
    }
  }
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(destPath, file.content, 'utf8');
  console.log(`Extracted: ${destPath}`);
});

console.log('Extraction complete!');

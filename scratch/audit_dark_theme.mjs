import fs from 'fs';
import path from 'path';

const publicDirs = [
  'd:/Projects/Brain Storm Club/src/pages/public',
  'd:/Projects/Brain Storm Club/src/components/layout',
  'd:/Projects/Brain Storm Club/src/components/events',
  'd:/Projects/Brain Storm Club/src/components/sections',
  'd:/Projects/Brain Storm Club/src/components/common',
];

const issues = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Find all className blocks (strings and template literals)
  const regex = /className\s*=\s*(?:\{`([\s\S]*?)`\}|"([^"]*)"|'([^']*)')/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const rawClass = match[1] || match[2] || match[3] || '';
    const index = match.index;
    const lineNumber = content.substring(0, index).split('\n').length;
    
    // Split into individual class words or tokens
    const tokens = rawClass.split(/\s+/).filter(Boolean);
    
    const hasDarkBg = tokens.some(t => t.startsWith('dark:bg-') || t.startsWith('dark:hover:bg-'));
    const hasDarkText = tokens.some(t => t.startsWith('dark:text-') || t.startsWith('dark:hover:text-'));
    const hasDarkBorder = tokens.some(t => t.startsWith('dark:border-') || t.startsWith('dark:hover:border-'));

    // Check light backgrounds
    const lightBgs = tokens.filter(t => ['bg-white', 'bg-slate-50', 'bg-slate-100', 'bg-slate-200', 'bg-gray-50', 'bg-gray-100'].includes(t));
    if (lightBgs.length > 0 && !hasDarkBg) {
      // Check if it's explicitly white button, badge, or within dark section
      issues.push({
        file: path.basename(filePath),
        line: lineNumber,
        category: 'MISSING_DARK_BG',
        tokens: lightBgs.join(', '),
        context: rawClass.replace(/\s+/g, ' ').substring(0, 100)
      });
    }

    // Check dark-on-dark contrast: text-slate-500, text-slate-600 without dark:text-
    const lowContrastTexts = tokens.filter(t => ['text-slate-500', 'text-slate-600', 'text-slate-700', 'text-slate-800', 'text-slate-900'].includes(t));
    if (lowContrastTexts.length > 0 && !hasDarkText) {
      issues.push({
        file: path.basename(filePath),
        line: lineNumber,
        category: 'MISSING_DARK_TEXT',
        tokens: lowContrastTexts.join(', '),
        context: rawClass.replace(/\s+/g, ' ').substring(0, 100)
      });
    }

    // Check borders: border-slate-200, border-slate-300 without dark:border-
    const lightBorders = tokens.filter(t => ['border-slate-100', 'border-slate-200', 'border-slate-300'].includes(t));
    if (lightBorders.length > 0 && !hasDarkBorder) {
      issues.push({
        file: path.basename(filePath),
        line: lineNumber,
        category: 'MISSING_DARK_BORDER',
        tokens: lightBorders.join(', '),
        context: rawClass.replace(/\s+/g, ' ').substring(0, 100)
      });
    }
  }
}

publicDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        scanFile(path.join(dir, file));
      }
    });
  }
});

console.log(`Deep audit found ${issues.length} potential issues:`);
issues.forEach(i => {
  console.log(`[${i.file}:${i.line}] [${i.category}] [${i.tokens}] => ${i.context}`);
});

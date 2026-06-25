const fs = require('fs');
const path = require('path');

const pagesDir = './src/pages';
const files = [];
function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full);
    else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) files.push(full);
  }
}
walkDir(pagesDir);
files.sort();

let hasIssues = false;

// 1. ??? garbled text
console.log('=== 1. ??? Garbled text ===');
for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  const lines = content.split('\n');
  for (let li = 0; li < lines.length; li++) {
    if (/\?\?\?/.test(lines[li])) {
      console.log('  FOUND: ' + f + ':' + (li+1) + ': ' + lines[li].trim());
      hasIssues = true;
    }
  }
}
if (!hasIssues) console.log('  CLEAN');

// 2. Duplicate import sources
console.log('\n=== 2. Duplicate import sources ===');
hasIssues = false;
for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  const lines = content.split('\n');
  
  // Collect all real import statements
  const importLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) {
      let full = lines[i];
      if (!lines[i].includes(';') && !lines[i].includes('} from')) {
        i++;
        while (i < lines.length) {
          full += lines[i].trim();
          if (lines[i].includes(';') || lines[i].includes('} from')) break;
          i++;
        }
      }
      importLines.push(full);
    }
  }
  
  // Extract sources
  const sources = importLines.map(imp => {
    const m = imp.match(/from\s+['"](.+?)['"]/);
    return m ? m[1] : null;
  }).filter(Boolean);
  
  // Check for duplicates
  const seen = new Set();
  for (const src of sources) {
    if (seen.has(src)) {
      console.log('  DUPLICATE: ' + f + ' -> "' + src + '"');
      importLines.filter(imp => imp.includes(src)).forEach(imp => console.log('    ' + imp.trim()));
      hasIssues = true;
    }
    seen.add(src);
  }
}
if (!hasIssues) console.log('  CLEAN');

// 3. Duplicate identifiers within same import brace
console.log('\n=== 3. Duplicate identifiers in import ===');
hasIssues = false;
for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  const importLines = content.match(/^import\s+.*\{[^}]+\}.*from\s+['"][^'"]+['"]\s*;?$/gm) || [];
  
  for (const imp of importLines) {
    const braceMatch = imp.match(/\{([^}]+)\}/);
    if (braceMatch) {
      const items = braceMatch[1].split(',').map(s => {
        // Remove 'as X' aliases, whitespace, newlines
        return s.replace(/\s+as\s+\w+/g, '').replace(/[\n\r\s]/g, '').trim();
      }).filter(Boolean);
      const seen = new Set();
      for (const item of items) {
        if (seen.has(item)) {
          const lineNum = content.indexOf(imp);
          console.log('  DUPLICATE: ' + f + ' (line ~' + lineNum + '): "' + item + '" appears twice');
          console.log('    ' + imp.replace(/\s+/g, ' ').trim());
          hasIssues = true;
        }
        seen.add(item);
      }
    }
  }
}
if (!hasIssues) console.log('  CLEAN');

// 4. Latin garbled chars
console.log('\n=== 4. Garbled Latin chars ===');
hasIssues = false;
const latinGarbled = /[çãéêëèîïôöûüÿœæ]/i;
for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  const lines = content.split('\n');
  for (let li = 0; li < lines.length; li++) {
    if (latinGarbled.test(lines[li])) {
      const trimmed = lines[li].trim();
      if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        console.log('  FOUND: ' + f + ':' + (li+1) + ': ' + trimmed.substring(0, 120));
        hasIssues = true;
      }
    }
  }
}
if (!hasIssues) console.log('  CLEAN');

// 5. Check for unused imports from local modules (correct)
console.log('\n=== 5. Unused imports from local modules ===');
hasIssues = false;
for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  
  // Find all import lines using a multiline-aware approach
  const lines = content.split('\n');
  const importStatements = [];
  let i = 0;
  while (i < lines.length) {
    if (/^import\s/.test(lines[i])) {
      let combined = lines[i];
      // Check if this is a multiline import
      if (combined.includes('{') && !combined.includes('}')) {
        i++;
        while (i < lines.length && !combined.includes('}')) {
          combined += ' ' + lines[i].trim();
          i++;
        }
        // Also capture the from part and semicolon
        if (i < lines.length) {
          combined += ' ' + lines[i].trim();
        }
      } else if (combined.includes('{') && combined.includes('}') && !combined.includes(';')) {
        i++;
        while (i < lines.length && !combined.includes(';')) {
          combined += ' ' + lines[i].trim();
          i++;
        }
      }
      importStatements.push(combined);
    }
    i++;
  }
  
  const body = content;
  
  for (const imp of importStatements) {
    const srcMatch = imp.match(/from\s+['"](.+?)['"]/);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    
    // Only check local imports
    if (!src.startsWith('.') && !src.startsWith('@/')) continue;
    
    // Default imports
    const defaultMatch = imp.match(/^import\s+(\w+)\s+from/);
    if (defaultMatch && defaultMatch[1] !== 'React') {
      const name = defaultMatch[1];
      // Count occurrences IN THE BODY (after imports section)
      // We search the entire file but exclude the import line itself
      const bodyLines = content.split('\n');
      const importLineIdx = bodyLines.findIndex(l => l.includes(name) && l.includes('import'));
      let bodyContent = content;
      if (importLineIdx >= 0) {
        bodyContent = bodyLines.slice(importLineIdx + 1).join('\n');
      }
      const re = new RegExp('(?<![a-zA-Z])' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-zA-Z])', 'g');
      const matches = bodyContent.match(re);
      if (!matches || matches.length === 0) {
        console.log('  UNUSED DEFAULT IMPORT: ' + name + ' from "' + src + '" in ' + f);
        hasIssues = true;
      }
    }
    
    // Named imports
    const braceMatch = imp.match(/\{([^}]+)\}/);
    if (braceMatch) {
      const items = braceMatch[1].split(',').map(s => {
        return s.replace(/\s+as\s+\w+/g, '').replace(/[\n\r\s]/g, '').trim();
      }).filter(Boolean);
      
      for (const item of items) {
        if (!item || item === 'React' || item === 'Fragment') continue;
        
        const bodyLines = content.split('\n');
        const importLineIdx = bodyLines.findIndex(l => l.includes(item) && l.includes('import'));
        let bodyContent = content;
        if (importLineIdx >= 0) {
          bodyContent = bodyLines.slice(importLineIdx + 1).join('\n');
        }
        
        // If it's API_ENDPOINTS or similar, check for usage as property
        if (bodyContent.includes(item + '.') || bodyContent.includes(item + '(') || bodyContent.includes(item + ')') || bodyContent.includes(item + '[') || bodyContent.includes(item + ']') || bodyContent.includes(' ' + item + ' ') || bodyContent.includes('.' + item + ' ') || bodyContent.includes('(' + item + ')') || bodyContent.includes('[' + item + ']')) {
          // Used
        } else {
          // Check more carefully with regex
          const re = new RegExp('(?<![a-zA-Z])' + item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-zA-Z])', 'g');
          const matches = bodyContent.match(re);
          if (!matches) {
            console.log('  UNUSED NAMED IMPORT: ' + item + ' from "' + src + '" in ' + f);
            hasIssues = true;
          }
        }
      }
    }
  }
}
if (!hasIssues) console.log('  CLEAN');

console.log('\n=== ALL CHECKS COMPLETE ===');

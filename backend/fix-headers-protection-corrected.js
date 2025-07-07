#!/usr/bin/env node

/**
 * FIXED Script to add header protection to all controller catch blocks
 * This prevents connection pool exhaustion by ensuring we don't send multiple responses
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');

function fixControllerFile(filePath) {
  console.log(`🔧 Fixing headers protection in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // First, restore the files by removing broken patterns
  content = content.replace(/return if \(!res\.headersSent\) \{\s*res\.status\(\d+\)\.json\([^}]+\}?\);\s*\}/g, (match) => {
    // Extract the response part
    const responseMatch = match.match(/res\.status\(\d+\)\.json\([^}]+\}?\)/);
    if (responseMatch) {
      return `return ${responseMatch[0]}`;
    }
    return match;
  });
  
  // Fix other broken patterns
  content = content.replace(/if \(!res\.headersSent\) \{\s*res\.status\(\d+\)\.json\([^}]+\}?\);\s*\}/g, (match) => {
    const responseMatch = match.match(/res\.status\(\d+\)\.json\([^}]+\}?\)/);
    if (responseMatch) {
      return responseMatch[0];
    }
    return match;
  });
  
  // Now properly fix the patterns
  // Fix return res.status(...).json() patterns
  content = content.replace(/(return\s+)(res\.status\(\d+\)\.json\([^}]+\}?\))/g, (match, returnKeyword, response) => {
    if (match.includes('if (!res.headersSent)')) {
      return match; // Already protected
    }
    changes++;
    return `if (!res.headersSent) {\n      ${returnKeyword}${response};\n    }`;
  });
  
  // Fix standalone res.status(...).json() patterns (not return statements)
  content = content.replace(/^(\s+)(res\.status\(\d+\)\.json\([^}]+\}?\);?)$/gm, (match, indent, response) => {
    if (match.includes('if (!res.headersSent)')) {
      return match; // Already protected
    }
    if (match.includes('return')) {
      return match; // Don't touch return statements
    }
    changes++;
    return `${indent}if (!res.headersSent) {\n${indent}  ${response.endsWith(';') ? response : response + ';'}\n${indent}}`;
  });
  
  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${changes} response patterns in ${path.basename(filePath)}`);
  } else {
    console.log(`ℹ️ No changes needed in ${path.basename(filePath)}`);
  }
  
  return changes;
}

function main() {
  console.log('🚀 Starting CORRECTED headers protection fix for all controllers...\n');
  
  const files = fs.readdirSync(controllersDir);
  let totalChanges = 0;
  
  files.forEach(file => {
    if (file.endsWith('.controller.js')) {
      const filePath = path.join(controllersDir, file);
      const changes = fixControllerFile(filePath);
      totalChanges += changes;
    }
  });
  
  console.log(`\n🎉 CORRECTED headers protection fix completed!`);
  console.log(`📊 Total files processed: ${files.length}`);
  console.log(`🔧 Total changes made: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log('\n⚠️ IMPORTANT: Please review the changes before committing!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixControllerFile };

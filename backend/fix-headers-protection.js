#!/usr/bin/env node

/**
 * Script to add header protection to all controller catch blocks
 * This prevents connection pool exhaustion by ensuring we don't send multiple responses
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');

// Pattern to find res.status(...).json() in catch blocks
const responsePattern = /(\s+)(res\.status\(\d+\)\.json\([^}]+\}?\))/g;
const returnResponsePattern = /(\s+)(return res\.status\(\d+\)\.json\([^}]+\}?\))/g;

function fixControllerFile(filePath) {
  console.log(`🔧 Fixing headers protection in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Fix res.status(...).json() patterns (without return)
  content = content.replace(responsePattern, (match, indent, response) => {
    // Skip if already protected
    if (match.includes('if (!res.headersSent)')) {
      return match;
    }
    
    changes++;
    return `${indent}if (!res.headersSent) {\n${indent}  ${response};\n${indent}}`;
  });
  
  // Fix return res.status(...).json() patterns  
  content = content.replace(returnResponsePattern, (match, indent, response) => {
    // Skip if already protected
    if (match.includes('if (!res.headersSent)')) {
      return match;
    }
    
    changes++;
    return `${indent}if (!res.headersSent) {\n${indent}  ${response};\n${indent}}`;
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
  console.log('🚀 Starting headers protection fix for all controllers...\n');
  
  const files = fs.readdirSync(controllersDir);
  let totalChanges = 0;
  
  files.forEach(file => {
    if (file.endsWith('.controller.js')) {
      const filePath = path.join(controllersDir, file);
      const changes = fixControllerFile(filePath);
      totalChanges += changes;
    }
  });
  
  console.log(`\n🎉 Headers protection fix completed!`);
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

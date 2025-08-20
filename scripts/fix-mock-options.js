const fs = require('fs');
const path = require('path');

// Read the questions file
const filePath = path.join(__dirname, '../lib/mock-data/questions.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all option objects with just the option_text strings
content = content.replace(/options: \[([\s\S]*?)\],/g, (fullMatch, optionsContent) => {
  // Extract just the option_text values
  const optionTexts = [];
  const regex = /option_text: '([^']+)'/g;
  let textMatch;
  while ((textMatch = regex.exec(optionsContent)) !== null) {
    optionTexts.push(`'${textMatch[1]}'`);
  }
  
  if (optionTexts.length > 0) {
    return `options: [${optionTexts.join(', ')}],`;
  }
  return fullMatch;
});

// Write the fixed content back
fs.writeFileSync(filePath, content);
console.log('Fixed mock data options format');
const fs = require('fs');
const path = require('path');

const files = [
  'src/app/modules/player/song-card.component.ts',
  'src/app/modules/player/player.component.ts',
  'src/app/modules/import/playlist-import.component.ts',
  'src/app/modules/import/playlist-detail.component.ts',
  'src/app/modules/home/search.component.ts',
  'src/app/app.component.ts'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Use regex to locate: template: `...`
  // We match "template:" followed by any whitespace, then a backtick.
  // Then we lazily match any characters (including newlines) until we hit a backtick followed by optional whitespace and a comma or newline.
  const regex = /template\s*:\s*`([\s\S]*?)`\s*(,?)/;
  
  const match = content.match(regex);
  if (match) {
    const templateContent = match[1];
    
    // Construct HTML filename
    const htmlFilename = path.basename(file, '.ts') + '.html';
    const htmlFullPath = path.join(path.dirname(fullPath), htmlFilename);
    
    // Write template content to HTML file
    // Trim leading/trailing blank lines
    fs.writeFileSync(htmlFullPath, templateContent.trim() + '\n', 'utf8');
    
    // Replace template with templateUrl
    const replacement = `templateUrl: './${htmlFilename}'${match[2]}`;
    content = content.replace(regex, replacement);
    
    // Write back to TS file
    fs.writeFileSync(fullPath, content, 'utf8');
    
    console.log(`Refactored ${file} -> extracted ${htmlFilename}`);
  } else {
    console.log(`No inline template found (or already refactored) in: ${file}`);
  }
});

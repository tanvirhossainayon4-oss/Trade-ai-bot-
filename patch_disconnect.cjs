const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/console\.error\('WebSocket Disconnected:', \{\n\s*url: "",\n\s*reason: reason,\n\s*details: details,\n\s*state: socket\.connected \? 'connected' : 'disconnected'\n\s*\}\);/g, 
  \`if (reason !== 'io client disconnect') {
        console.error('WebSocket Disconnected:', {
          reason,
          details
        });
      }\`);
  fs.writeFileSync(file, code);
}

patchFile('src/pages/Dashboard.tsx');
patchFile('src/pages/Analysis.tsx');

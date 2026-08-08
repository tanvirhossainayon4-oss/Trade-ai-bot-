const fs = require('fs');
let code = fs.readFileSync('src/pages/Markets.tsx', 'utf8');

const oldFetch = `    const res = await fetch(\`\${API_URL}/api/v1/markets\`);
    const data = await res.json();
    setMarkets(data);`;
const newFetch = `    try {
      const res = await fetch(\`\${API_URL}/api/v1/markets\`);
      const data = await res.json();
      if (!res.ok) {
        console.error('API Error:', {
          url: res.url,
          status: res.status,
          body: data,
          message: data.error || 'API Request Failed'
        });
        throw new Error(data.error || 'API Request Failed');
      }
      setMarkets(data);
    } catch (e) {
      console.error(e);
    }`;
code = code.replace(oldFetch, newFetch);

fs.writeFileSync('src/pages/Markets.tsx', code);

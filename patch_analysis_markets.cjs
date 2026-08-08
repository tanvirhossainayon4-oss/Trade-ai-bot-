const fs = require('fs');
let code = fs.readFileSync('src/pages/Analysis.tsx', 'utf8');

const oldFetch = `  const fetchMarkets = async () => {
    const res = await fetch(\`\${API_URL}/api/v1/markets\`);
    const data = await res.json();
    setMarkets(data);`;
const newFetch = `  const fetchMarkets = async () => {
    try {
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
      setMarkets(data);`;
code = code.replace(oldFetch, newFetch);

// we also need to close the try/catch at the end of fetchMarkets
code = code.replace(/    if \(\!selectedMarket \|\| data\.length > 0\) \{\n      setSelectedMarket\(data\[0\]\);\n    \}\n  \};/g,
`    if (!selectedMarket || data.length > 0) {
      setSelectedMarket(data[0]);
    }
    } catch (e) {
      console.error(e);
    }
  };`);

fs.writeFileSync('src/pages/Analysis.tsx', code);

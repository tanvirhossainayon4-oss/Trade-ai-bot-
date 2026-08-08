const fs = require('fs');
let code = fs.readFileSync('src/pages/Analysis.tsx', 'utf8');

const original = `  const fetchMarkets = async () => {
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
      setMarkets(data);
    
    // Check if a symbol was passed via navigation state
    const initialSymbol = location.state?.selectedSymbol;
    if (initialSymbol) {
      const initialMarket = data.find((m: Market) => m.symbol === initialSymbol);
      if (initialMarket) {
        setSelectedMarket(initialMarket);
        setSelectedCategory(initialMarket.type);
      }
    }
  };`;

const fixed = `  const fetchMarkets = async () => {
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
      setMarkets(data);
    
      // Check if a symbol was passed via navigation state
      const initialSymbol = location.state?.selectedSymbol;
      if (initialSymbol) {
        const initialMarket = data.find((m: Market) => m.symbol === initialSymbol);
        if (initialMarket) {
          setSelectedMarket(initialMarket);
          setSelectedCategory(initialMarket.type);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };`;

code = code.replace(original, fixed);
fs.writeFileSync('src/pages/Analysis.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace websocket connection logging
code = code.replace(/socket\.on\('disconnect', \(\) => setIsConnected\(false\)\);/g, 
`socket.on('disconnect', (reason, details) => {
      setIsConnected(false);
      console.error('WebSocket Disconnected:', {
        url: socket.io.uri,
        reason: reason,
        details: details,
        state: socket.connected ? 'connected' : 'disconnected'
      });
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket Connection Error:', {
        url: socket.io.uri,
        message: error.message,
        state: socket.connected ? 'connected' : 'disconnected'
      });
    });`);

// Replace API fetch logging
const oldFetch = `      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
    } catch (e) {
      console.error(e);`;
const newFetch = `      const data = await res.json();
      if (!res.ok) {
        console.error('API Error:', {
          url: res.url,
          status: res.status,
          body: data,
          message: data.error || 'API Request Failed'
        });
        throw new Error(data.error || 'API Request Failed');
      }
      setAnalysis(data);
    } catch (e) {
      console.error(e);`;
code = code.replace(oldFetch, newFetch);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

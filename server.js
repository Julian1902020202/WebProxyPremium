const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const app = express();
const port = 3000;

// Proxy-Liste laden
const rawProxyList = fs.readFileSync('./proxy-list.json');
const proxyList = JSON.parse(rawProxyList).data; // Zugriff auf das "data" Array

// Funktion zum zufälligen Proxy-Auswählen
const getRandomProxy = () => {
  if (!proxyList || proxyList.length === 0) {
    throw new Error('Proxy list is empty or undefined.');
  }
  const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];
  return `http://${proxy.ip}:${proxy.port}`;
};

// Proxy-Middleware einrichten
app.use('/proxy', (req, res, next) => {
  const targetUrl = req.query.url; // Ziel-URL wird über Query-Parameter übergeben, z.B. /proxy?url=https://google.com
  if (!targetUrl) {
    return res.status(400).send('No target URL provided.');
  }

  try {
    const proxyUrl = getRandomProxy();

    console.log(`Routing request to: ${proxyUrl}`);

    const proxyMiddleware = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('X-Forwarded-For', proxyUrl);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy failed.');
      }
    });

    proxyMiddleware(req, res, next);
  } catch (error) {
    console.error('Error selecting proxy:', error);
    res.status(500).send('Failed to select proxy.');
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});

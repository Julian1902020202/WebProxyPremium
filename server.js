const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const app = express();
const port = 3000;

// Beispielhafte Proxy-Liste
const proxies = require('./proxy-list.json');

// Funktion zum zufälligen Proxy-Auswählen
const getRandomProxy = () => {
  const proxy = proxies[Math.floor(Math.random() * proxies.length)];
  return `http://${proxy.ip}:${proxy.port}`;
};

// Proxy-Middleware einrichten
app.use('/:targetUrl', (req, res, next) => {
  const targetUrl = req.params.targetUrl;
  const proxyUrl = getRandomProxy();

  console.log(`Routing request to: ${proxyUrl}`);

  const proxyMiddleware = createProxyMiddleware({
    target: `http://${targetUrl}`,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('X-Forwarded-For', proxyUrl);
    },
    onError: (err, req, res) => {
      res.status(500).send('Proxy failed.');
    }
  });

  proxyMiddleware(req, res, next);
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});

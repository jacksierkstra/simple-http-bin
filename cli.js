#!/usr/bin/env node

const http = require('node:http');

const DEFAULT_PORT = 51234;
const args = process.argv.slice(2);
const portFlagIndex = args.findIndex((arg) => arg === '--port' || arg === '-p');
const cliPort = portFlagIndex >= 0 ? Number(args[portFlagIndex + 1]) : Number(args[0]);
const envPort = Number(process.env.PORT);
const port = Number.isInteger(cliPort) && cliPort > 0 ? cliPort : Number.isInteger(envPort) && envPort > 0 ? envPort : DEFAULT_PORT;
const host = process.env.HOST || '127.0.0.1';

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(''));
  });
}

function helpText(baseUrl) {
  return [
    'simple-http-bin',
    '',
    `Running at: ${baseUrl}`,
    `Port: ${port} (use --port <n> or PORT=<n>)`,
    '',
    'Endpoints:',
    '  GET /           Show this help text',
    '  GET /headers    Echo request headers as JSON',
    '  ANY /anything   Echo method, path, query, headers, and body',
    '  ANY /status/:n  Return the given HTTP status code',
    '',
    'Examples:',
    `  curl ${baseUrl}/headers`,
    `  curl -X POST ${baseUrl}/anything -d "hello"`,
    `  curl -i ${baseUrl}/status/418`,
  ].join('\n');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(helpText(`http://${host}:${port}`));
    return;
  }

  if (path === '/headers') {
    sendJson(res, 200, { headers: req.headers });
    return;
  }

  if (path.startsWith('/status/')) {
    const code = Number(path.split('/')[2]);
    res.writeHead(Number.isInteger(code) ? code : 400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`status ${Number.isInteger(code) ? code : 400}`);
    return;
  }

  if (path === '/anything') {
    const body = await readBody(req);
    sendJson(res, 200, {
      method: req.method,
      path,
      query: Object.fromEntries(url.searchParams.entries()),
      headers: req.headers,
      body,
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('not found');
});

server.listen(port, host, () => {
  const baseUrl = `http://${host}:${port}`;
  console.log(helpText(baseUrl));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

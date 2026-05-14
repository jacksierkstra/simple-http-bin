#!/usr/bin/env node

const http = require('node:http');
const chalk = require('chalk');

const DEFAULT_PORT = 51234;
const args = process.argv.slice(2);
let cliPort;
let verbosity = 0;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg === '--port' || arg === '-p') {
    cliPort = Number(args[i + 1]);
    i += 1;
    continue;
  }

  if (arg === '--verbose') {
    verbosity += 1;
    continue;
  }

  if (/^-v+$/.test(arg)) {
    verbosity += arg.length - 1;
    continue;
  }

  if (cliPort === undefined && !arg.startsWith('-')) {
    cliPort = Number(arg);
  }
}

const envPort = Number(process.env.PORT);
const port = Number.isInteger(cliPort) && cliPort > 0 ? cliPort : Number.isInteger(envPort) && envPort > 0 ? envPort : DEFAULT_PORT;
const host = process.env.HOST || '127.0.0.1';
const logLevel = Math.max(1, verbosity + 1);

const colors = {
  method: chalk.cyan.bold,
  path: chalk.white,
  statusOk: chalk.green.bold,
  statusWarn: chalk.yellow.bold,
  statusError: chalk.red.bold,
  meta: chalk.gray,
  dim: chalk.dim,
  title: chalk.green.bold,
};

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

function logRequest(req, res, path, startedAt, details = {}) {
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const remoteAddress = req.socket.remoteAddress || 'unknown';
    const remotePort = req.socket.remotePort || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const statusColor = res.statusCode >= 500 ? colors.statusError : res.statusCode >= 400 ? colors.statusWarn : colors.statusOk;
    const statusText = statusColor(res.statusCode);
    const baseLine = `${colors.method(req.method)} ${colors.path(path)} ${colors.meta('->')} ${statusText} ${colors.dim(`(${durationMs}ms)`)}`;

    if (logLevel === 1) {
      console.log(baseLine);
      return;
    }

    if (logLevel === 2) {
      console.log(`${baseLine} ${colors.meta('from')} ${colors.meta(`${remoteAddress}:${remotePort}`)} ${colors.meta('ua=')}${chalk.white(JSON.stringify(userAgent))}`);
      return;
    }

    console.log([
      `${baseLine} ${colors.meta('from')} ${colors.meta(`${remoteAddress}:${remotePort}`)}`,
      `${colors.meta('ua=')}${chalk.white(JSON.stringify(userAgent))}`,
      `${colors.meta('headers=')}${chalk.white(JSON.stringify(req.headers, null, 2))}`,
      details.bodyBytes !== undefined ? `${colors.meta('bodyBytes=')}${chalk.white(details.bodyBytes)}` : null,
    ].filter(Boolean).join('\n'));
  });
}

function helpText(baseUrl) {
  return [
    colors.title('simple-http-bin'),
    '',
    `${colors.meta('Running at:')} ${chalk.white(baseUrl)}`,
    `Port: ${port} (use --port <n> or PORT=<n>)`,
    'Requests are logged to the console.',
    'Use -v or --verbose for more detail; repeat -v for even more.',
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
  const startedAt = Date.now();
  const url = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/') {
    logRequest(req, res, `${path}${url.search}`, startedAt);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(helpText(`http://${host}:${port}`));
    return;
  }

  if (path === '/headers') {
    logRequest(req, res, `${path}${url.search}`, startedAt);
    sendJson(res, 200, { headers: req.headers });
    return;
  }

  if (path.startsWith('/status/')) {
    logRequest(req, res, `${path}${url.search}`, startedAt);
    const code = Number(path.split('/')[2]);
    res.writeHead(Number.isInteger(code) ? code : 400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`status ${Number.isInteger(code) ? code : 400}`);
    return;
  }

  if (path === '/anything') {
    const body = await readBody(req);
    logRequest(req, res, `${path}${url.search}`, startedAt, { bodyBytes: Buffer.byteLength(body) });
    sendJson(res, 200, {
      method: req.method,
      path,
      query: Object.fromEntries(url.searchParams.entries()),
      headers: req.headers,
      body,
    });
    return;
  }

  logRequest(req, res, `${path}${url.search}`, startedAt);
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

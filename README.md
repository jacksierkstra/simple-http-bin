# simple-http-bin

A tiny local httpbin-like utility.

Requests are logged to the console.
Colored output is enabled when the terminal supports it.

## Run

```bash
npx simple-http-bin --port 8081
```

## Install

### Global

```bash
npm install -g simple-http-bin
```

### Project

```bash
npm install simple-http-bin
```

## Options

| flag | description | example(s) |
| --- | --- | --- |
| `--port <n>`, `-p <n>` | Set the port to listen on. | `simple-http-bin --port 8080`, `simple-http-bin -p 8080` |
| `<n>` | Pass the port as the first non-flag argument. | `simple-http-bin 8080` |
| `PORT=<n>` | Set the port via environment variable. | `PORT=8080 simple-http-bin` |
| `HOST=<host>` | Bind to a different host. | `HOST=0.0.0.0 simple-http-bin` |
| `-v`, `-vv`, `-vvv`, `--verbose` | Increase request logging detail. Repeat `-v` for more verbosity. | `simple-http-bin -v`, `simple-http-bin -vv`, `simple-http-bin --verbose` |

## Endpoints

- `GET /` show help text
- `GET /headers` echo request headers as JSON
- `ANY /anything` echo method, path, query, headers, and body
- `ANY /status/:code` return the given HTTP status code

## Example

```bash
curl http://127.0.0.1:51234/headers
curl -X POST http://127.0.0.1:51234/anything -d "hello"
curl -i http://127.0.0.1:51234/status/418
```

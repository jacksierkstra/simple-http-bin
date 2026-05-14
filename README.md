# simple-http-bin

A tiny local httpbin-like utility.

Requests are logged to the console.
Use `-v` or `--verbose` for more detail. Repeat `-v` for extra detail.
Colored output is enabled when the terminal supports it.

## Install

```bash
npm install -g simple-http-bin
```

## Run

```bash
simple-http-bin
```

Or:

```bash
npx simple-http-bin
```

## Options

```bash
simple-http-bin --port 8080
simple-http-bin -p 8080
simple-http-bin -v
simple-http-bin -vv
PORT=8080 simple-http-bin
HOST=0.0.0.0 simple-http-bin
```

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

## Release

```bash
make release-patch
make release-minor
make release-major
make publish
```

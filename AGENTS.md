# AGENTS.md

- Repo is a tiny Node CLI: `cli.js` is the only runtime file and `package.json` only declares the `bin` entry.
- No build, test, or lint scripts exist. Use a manual smoke test instead.
- Local run: `node cli.js`.
- To try the installed command locally: `npm link` then `simple-http-bin`.
- `npx simple-http-bin` only works once the package is published or otherwise available to `npx`.
- Default host is `127.0.0.1` and default port is `51234`.
- Override the port with `--port <n>`, `-p <n>`, `node cli.js <n>`, or `PORT=<n>`.
- The server prints its own endpoint help on startup; keep that output accurate when changing routes.
- Supported routes are `/`, `/headers`, `/anything`, and `/status/:code`.
- Keep dependencies at zero unless a new package is clearly justified.

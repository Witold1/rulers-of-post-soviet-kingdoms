# Contributing

Visualization and web improvements are welcome. Better UI/UX and technical implementation.
Data corrections and additions are welcome - especially date fixes, missing rulers, better act naming and sources, and unrest entries and metadata.

## How to contribute /data

1. Fork the repository.
2. Edit the relevant file under `data/countries/` (or `data/meta.json` / `data/sources.json`).
3. Note material date or act changes in `data/CHANGELOG.md`.
4. Open a pull request with a short explanation and sources where possible.

Schema and field notes: [`data/README.md`](data/README.md).

### Local check

Preferred:
`python -m http.server 8080` or `npx serve .`

Alternatives:
```powershell
.\serve.ps1
```
Then open the URL printed in the terminal (usually `http://localhost:8080`).

Open the printed URL and confirm the timeline still loads, and exports, and works.

## What makes a good PR

- Prefer primary or clearly reliable sources; add ids in `sources.json` and link them from country files via `sources[]`.
- Keep dates year-first; add month/day only when known.
- Use `notes[]` for caveats; keep `act.title` concise.
- One country or one logical topic per PR when practical.

## License of contributions

- **Code and site files** (HTML, CSS, JS, scripts) are contributed under the **MIT License** ([`LICENSE`](LICENSE)).
- **Dataset and editorial content** under `data/` are contributed under **CC BY-SA 4.0** ([`LICENSE-DATA`](LICENSE-DATA)).

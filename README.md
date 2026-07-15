# Rulers of Post-Soviet Kingdoms

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=222)
![JSON](https://img.shields.io/badge/Data-JSON-000000?style=flat-square&logo=json&logoColor=white)
![html2canvas](https://img.shields.io/badge/Export-html2canvas-4A90D9?style=flat-square)
![No build](https://img.shields.io/badge/Build-none-lightgrey?style=flat-square)
![Status](https://img.shields.io/badge/Status-public--beta-orange)

Interactive timeline that shows leadership change in 15 former Soviet republics from 1985 to 2026.

Static site - no framework, no bundler. Data is plain JSON, one file per country.

## Description

### 1. Layers

| Element | Meaning |
|---------|---------|
| Colored bars | Soviet-era republic heads and post-independence presidents |
| Slate vertical line | Date of sovereignty declaration |
| Gold vertical line | Date of independence declaration (or restoration) |
| Red zigzag | Date of USSR ceased to exist (Declaration No. 142-N, 26 Dec 1991) |
| Patterned strips | Unrest & conflict *(off by default; incomplete coverage)* |

Hover bars or markers for names, roles, dates, and act titles.

### 2. Unrest layer

`js/events.js` and `css/events.css` ship with the page but rendering starts **off**. Turn the layer on in Settings when you want event strips, the unrest legend, and the short chart note.

For a rulers-only build, remove these two lines from `index.html`:

```html
<link rel="stylesheet" href="css/events.css" />
<script src="js/events.js"></script>
```

Unrest records stay in `data/countries/*.json`; they simply will not render.

### 3. Controls

Top bar:

- **Filter** - narrow by country or ruler name
- **Theme** - light or dark; follows system preference until you choose
- **Save PNG** - export legend + full-width chart (needs network for the html2canvas CDN; filename includes a timestamp)
- **Settings (gear)** - display and marker toggles

Settings panel:

- **Show rulers** / **Show names** / **Show republic groups**
- **Show sovereignty** / **Show independence** / **Show USSR dissolution**
- **Show unrest & conflict** (β) - event strips; experimental dataset

Legend items match whatever layers are currently visible.

## Data

Source of truth is JSON under `data/`:

- `meta.json` - timeline bounds and USSR dissolution date
- `sources.json` - bibliography keyed by id
- `countries/{id}.json` - one republic each (order from `countries/index.json`)

Per-country fields: `sovereignty`, `independence`, `sovietLeaders`, `rulers`, and optional `unrest`. Schema notes live in [`data/README.md`](data/README.md); material changes to dates or acts should be logged in [`data/CHANGELOG.md`](data/CHANGELOG.md).

Dates are year-first (month/day where known). Act titles are working labels - verify against primary sources before treating them as canonical. Corrections welcome: see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Run locally

Preferred (live JSON under `data/`): run a local server, then open the URL it prints.

```powershell
.\serve.ps1
```

Or: `python -m http.server 8080`

Opening `index.html` via `file://` will not load data (browsers block local `fetch`). Use the server above or host on GitHub Pages.

## Repository layout

```text
index.html         Page shell
serve.ps1          Local static server (Windows)
css/
  themes.css       Light / dark tokens
  styles.css       Layout and chart
  events.css       Optional unrest styling
js/
  load.js          Fetches JSON at runtime
  theme.js         Theme switcher
  export.js        PNG export (html2canvas CDN)
  events.js        Optional unrest layer
  geometry.js      Year→pixel mapping + ruler palette
  controls.js      Settings panel + display toggles
  render.js        Timeline DOM (rows, bars, markers, filter)
  app.js           Boot glue (init + resize/theme hooks)
  debug.js         Environment info (bug reports)
data/
  meta.json
  sources.json     Act / document bibliography (keyed ids)
  SOURCES.md       Office-list URLs for rulers & dates
  countries/       Per-republic JSON + index.json
```

## License & credit

| Part | License |
|------|---------|
| Website code (HTML, CSS, JS, scripts) | [MIT](LICENSE) |
| Dataset under `data/` | [CC BY-SA 4.0](LICENSE-DATA) |

_Made with AI. Curated by Human._
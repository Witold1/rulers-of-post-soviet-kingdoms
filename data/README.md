# Post-Soviet Kingdoms — dataset

Structured historical data for the rulers timeline (1985–2026).

## Layout

```text
data/
  meta.json              Timeline bounds, USSR dissolution date
  sources.json           Bibliography keyed by id (acts / documents)
  SOURCES.md             Wikipedia / list pages used for rulers & dates
  countries/
    index.json           Display order (array of country ids)
    {id}.json            One file per republic
```

Loaded at runtime by `js/load.js` (HTTP required — see root README). See **[SOURCES.md](./SOURCES.md)** for office-list URLs used when compiling `sovietLeaders` / `rulers`.
## Country file fields

| Field | Description |
|-------|-------------|
| `id`, `name`, `flag`, `region` | Identity & grouping |
| `sovereignty` | Date + `act.title`, optional `notes[]`, `sources[]` |
| `independence` | Same shape as sovereignty |
| `sovietLeaders` | USSR-era republic heads (`start`/`end` + `startMonth`/`startDay`/`endMonth`/`endDay`) |
| `rulers` | Post-independence heads of state (same date fields) |
| `unrest` | Wars, revolutions, protests *(optional events layer)* |

### Act documents

```json
"independence": {
  "year": 1991,
  "month": 8,
  "day": 24,
  "act": { "title": "Act of Declaration of Independence of Ukraine †" },
  "notes": ["Editorial caveat or follow-up act"],
  "sources": ["source-id"]
}
```

Keep long prose in `notes[]`. Link evidence via `sources[]` ids defined in `sources.json`.

## Editing

Edit the JSON files directly, then refresh the page (with a local server or on GitHub Pages). No build step.

```powershell
.\serve.ps1
```

## Methodology

- Tenure fields are year + month + day for chart placement and tooltips.
- Prefer inauguration / resignation days when documented; where only the month is solid, starts often use day `1` and ends align to the day before the successor when contiguous.
- Late-Soviet First Secretary transitions are often month-precision—verify before citing as exact.
- Document titles are working labels — verify against primary sources before treating as canonical.
- Symbols in act titles (`†`, `*`) mark entries needing editorial review.

See **[SOURCES.md](./SOURCES.md)** for succession-list URLs and **[CHANGELOG.md](./CHANGELOG.md)** for a record of data revisions.

## License

This dataset is licensed under [CC BY-SA 4.0](../LICENSE-DATA). Contributions: see [CONTRIBUTING.md](../CONTRIBUTING.md).

_Made with AI. Curated by Human._

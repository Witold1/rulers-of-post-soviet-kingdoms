/**
 * Load timeline dataset from JSON under data/ (requires HTTP — local server or GitHub Pages).
 */
(function () {
  const DATA_BASE = "data";

  async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return res.json();
  }

  async function load() {
    const [meta, index, sources] = await Promise.all([
      fetchJson(`${DATA_BASE}/meta.json`),
      fetchJson(`${DATA_BASE}/countries/index.json`),
      fetchJson(`${DATA_BASE}/sources.json`),
    ]);

    const countries = await Promise.all(
      index.map((id) => fetchJson(`${DATA_BASE}/countries/${id}.json`))
    );

    for (const [i, id] of index.entries()) {
      if (countries[i]?.id !== id) {
        throw new Error(`Country file id mismatch for ${id}`);
      }
    }

    return { ...meta, sources, countries };
  }

  function showLoadError(message) {
    const el = document.getElementById("timeline");
    if (!el) return;
    el.innerHTML = "";
    const box = document.createElement("div");
    box.className = "data-load-error";
    box.setAttribute("role", "alert");
    box.innerHTML = `<strong>Timeline data did not load.</strong><p>${message}</p>`;
    el.appendChild(box);
  }

  async function init() {
    if (location.protocol !== "http:" && location.protocol !== "https:") {
      console.error(
        "Timeline data requires HTTP. Run .\\serve.ps1 or use GitHub Pages — opening index.html directly will not work."
      );
      showLoadError(
        "Browsers block local JSON over <code>file://</code>. Run <code>.\\serve.ps1</code> and open the localhost URL."
      );
      return;
    }

    try {
      window.TIMELINE_DATA = await load();
      window.dispatchEvent(new Event("timeline-data-ready"));
    } catch (err) {
      console.error("Failed to load timeline data:", err);
      showLoadError(
        "Could not fetch JSON under <code>data/</code>. Check the console, then refresh."
      );
    }
  }

  init();
})();

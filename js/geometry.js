/**
 * Timeline metrics, year→pixel mapping, and ruler palette helpers.
 */
(function () {
  const PALETTE_VARS = [
    "--palette-1",
    "--palette-2",
    "--palette-3",
    "--palette-4",
    "--palette-5",
    "--palette-6",
  ];

  let rulerPaletteCache = null;

  function timelineBounds() {
    const data = window.TIMELINE_DATA || {};
    return {
      start: data.TIMELINE_START,
      end: data.TIMELINE_END,
    };
  }

  function getMetrics() {
    const { start, end } = timelineBounds();
    const style = getComputedStyle(document.documentElement);
    const yearWidth = parseFloat(style.getPropertyValue("--year-w")) || 44;
    const labelWidth = parseFloat(style.getPropertyValue("--label-w")) || 132;
    // Inclusive span: TIMELINE_END is a visible year column (1985…2026).
    const years = end - start + 1;
    return {
      yearWidth,
      labelWidth,
      trackWidth: years * yearWidth,
    };
  }

  function yearToX(year, month = 1, day = 1, metrics = getMetrics()) {
    const { start } = timelineBounds();
    const fraction = year + (month - 1) / 12 + (day - 1) / 365 - start;
    return fraction * metrics.yearWidth;
  }

  function dateLabel(startYear, endYear, startMeta = {}, endMeta = {}) {
    const { end } = timelineBounds();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    function formatPoint(year, meta = {}) {
      const month = meta.month;
      const day = meta.day;
      if (month) {
        const mon = months[month - 1] || "";
        if (day && day !== 1) return `${mon} ${day}, ${year}`;
        return `${mon} ${year}`;
      }
      return String(year);
    }

    const startStr = formatPoint(startYear, startMeta);
    if (endYear >= end) return `${startStr} – present`;
    if (
      startYear === endYear &&
      !startMeta.month &&
      !endMeta.month
    ) {
      return String(startYear);
    }
    const endStr = formatPoint(endYear, endMeta);
    return `${startStr} – ${endStr}`;
  }

  function leaderDateLabel(leader) {
    return dateLabel(
      leader.start,
      leader.end,
      { month: leader.startMonth, day: leader.startDay },
      { month: leader.endMonth, day: leader.endDay }
    );
  }

  function readRulerPalette() {
    const style = getComputedStyle(document.documentElement);
    const stripe = style.getPropertyValue("--palette-stripe").trim();
    return PALETTE_VARS.map((key) => ({
      color: style.getPropertyValue(key).trim(),
      stripe,
    })).filter((entry) => entry.color);
  }

  function rulerPalette(index) {
    if (!rulerPaletteCache) rulerPaletteCache = readRulerPalette();
    const palette = rulerPaletteCache;
    if (!palette.length) {
      return { color: "#8f8f8a", stripe: "rgba(0,0,0,0.07)" };
    }
    return palette[index % palette.length];
  }

  function invalidateRulerPalette() {
    rulerPaletteCache = null;
  }

  /** Match bars for the same person (e.g. Karimov USSR → independent). */
  function normalizeLeaderName(name) {
    return name.trim().toLowerCase();
  }

  function buildLeaderPaletteMap(leaders) {
    const map = new Map();
    let nextIndex = 0;
    for (const leader of leaders) {
      const key = normalizeLeaderName(leader.name);
      if (!map.has(key)) {
        map.set(key, rulerPalette(nextIndex));
        nextIndex += 1;
      }
    }
    return map;
  }

  function rulerBarBackground(palette) {
    return `repeating-linear-gradient(90deg, transparent 0 3px, ${palette.stripe} 3px 4px), ${palette.color}`;
  }

  function parseHexColor(hex) {
    const value = hex.replace("#", "");
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }

  /** Contrast-aware label colors (editorial chart style). */
  function barLabelTheme(hex) {
    const { r, g, b } = parseHexColor(hex);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const style = getComputedStyle(document.documentElement);
    if (luminance > 0.58) {
      return {
        fg: style.getPropertyValue("--label-scrim-light-fg").trim(),
        bg: style.getPropertyValue("--label-scrim-light-bg").trim(),
      };
    }
    return {
      fg: style.getPropertyValue("--label-scrim-dark-fg").trim(),
      bg: style.getPropertyValue("--label-scrim-dark-bg").trim(),
    };
  }

  window.TimelineGeometry = {
    getMetrics,
    yearToX,
    dateLabel,
    leaderDateLabel,
    invalidateRulerPalette,
    normalizeLeaderName,
    buildLeaderPaletteMap,
    rulerBarBackground,
    barLabelTheme,
  };

  window.getTimelineMetrics = getMetrics;
})();

/**
 * Optional unrest / events layer for the rulers timeline.
 * Remove this script (and css/events.css) from index.html for rulers-only mode.
 */
(function () {
  const STORAGE_KEY = "timeline-events-visible";

  const EVENT_TYPES = [
    { id: "war", label: "Armed conflict" },
    { id: "revolution", label: "Revolution" },
    { id: "protest", label: "Mass protest" },
    { id: "crisis", label: "Political crisis" },
    { id: "regional", label: "Regional unrest" },
  ];

  const TYPE_LABELS = Object.fromEntries(EVENT_TYPES.map((t) => [t.id, t.label]));

  let showEventsCheckbox = null;
  let layerVisible = false;

  function getUnrest(country) {
    return country.unrest || [];
  }

  function hasUnrest(country) {
    return getUnrest(country).length > 0;
  }

  function typeLabel(type) {
    return TYPE_LABELS[type] || type;
  }

  function isLayerVisible() {
    return layerVisible;
  }

  function renderLegend(container) {
    if (!container || container.dataset.built) return;

    const heading = document.createElement("span");
    heading.className = "legend-heading";
    heading.textContent = "Unrest & conflict";
    container.appendChild(heading);

    for (const { id, label } of EVENT_TYPES) {
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `<span class="swatch ${id}" aria-hidden="true"></span> ${label}`;
      container.appendChild(item);
    }

    container.dataset.built = "true";
  }

  function renderCountryEvents(track, country, ctx) {
    if (!layerVisible) return;

    const { yearToX, metrics, dateLabel, bindBarTooltip, bindNameCopy } = ctx;

    const { TIMELINE_END } = window.TIMELINE_DATA || {};
    const trackRight = metrics.trackWidth;

    for (const period of getUnrest(country)) {
      const left = Math.max(0, yearToX(period.start, 1, 1, metrics));
      const endYear = Math.min(period.end, TIMELINE_END ?? period.end);
      const endX =
        TIMELINE_END != null && period.end >= TIMELINE_END
          ? trackRight
          : yearToX(endYear, 12, 31, metrics);
      const right = Math.min(endX, trackRight);
      const isPoint = period.start === period.end;
      const bar = document.createElement("div");
      bar.className = `bar event-strip ${period.type}${isPoint ? " event-point" : ""}`;
      bar.style.left = `${left}px`;
      bar.style.width = `${Math.max(right - left, isPoint ? 6 : 8)}px`;
      bar.dataset.search = `${period.name} ${country.name}`.toLowerCase();
      bar.style.cursor = "pointer";

      const tip = `<strong>${period.name}</strong>
      <span class="role">${country.name} · ${typeLabel(period.type)}</span>
      <div class="dates">${dateLabel(period.start, period.end)}</div>`;
      bindBarTooltip(bar, tip);
      bindNameCopy?.(bar, period.name);
      track.appendChild(bar);
    }
  }

  function getFilterSearchTerms(country) {
    if (!layerVisible) return [];
    return getUnrest(country).map((u) => u.name);
  }

  function applyLayerVisibility() {
    layerVisible = showEventsCheckbox?.checked ?? false;

    try {
      localStorage.setItem(STORAGE_KEY, layerVisible ? "1" : "0");
    } catch {
      /* ignore */
    }

    document.documentElement.classList.toggle("events-enabled", layerVisible);
  }

  function onLayerVisibilityChange() {
    applyLayerVisibility();
    if (typeof window.renderTimeline === "function") window.renderTimeline();
    if (typeof window.applyTimelineFilters === "function") window.applyTimelineFilters();
  }

  function bindControls() {
    showEventsCheckbox = document.getElementById("show-events");

    if (showEventsCheckbox) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "1") showEventsCheckbox.checked = true;
        else if (stored === "0") showEventsCheckbox.checked = false;
      } catch {
        /* ignore */
      }

      showEventsCheckbox.addEventListener("change", onLayerVisibilityChange);
    }
  }

  function init() {
    const controls = document.getElementById("events-controls");
    if (controls) controls.hidden = false;

    const legend = document.getElementById("legend-events");
    renderLegend(legend);

    bindControls();
    applyLayerVisibility();
  }

  window.TimelineEvents = {
    init,
    isLayerVisible,
    renderCountryEvents,
    getFilterSearchTerms,
    hasUnrest,
    EVENT_TYPES,
  };
})();

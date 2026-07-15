/**
 * Timeline DOM: axis, country rows, bars, markers, search filters, tooltips.
 */
(function () {
  const geo = () => window.TimelineGeometry;

  const timelineEl = document.getElementById("timeline");
  const tooltipEl = document.getElementById("tooltip");
  const searchInput = document.getElementById("search");

  const events = window.TimelineEvents || null;

  const REGION_LABELS = {
    slavic: "Slavic republics",
    baltic: "Baltic republics",
    transcaucasus: "Transcaucasian republics",
    "central-asia": "Central Asian republics",
  };

  function timelineData() {
    return window.TIMELINE_DATA || {};
  }

  function countries() {
    return timelineData().countries || [];
  }

  function monthName(m) {
    return (
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
        m - 1
      ] || ""
    );
  }

  function formatMarkerDate({ year, month, day }) {
    return `${monthName(month)} ${day}, ${year}`;
  }

  function markerAct(date) {
    if (!date) return "";
    const act = date.act;
    if (typeof act === "string") return act;
    if (act?.title) return act.title;
    return date.label || "";
  }

  function markerNotes(date) {
    const notes = [];
    if (date?.note) notes.push(date.note);
    if (Array.isArray(date?.notes)) notes.push(...date.notes);
    return notes;
  }

  function buildMarkerTooltip({ heading, date, extraLines = [] }) {
    const act = markerAct(date);
    const parts = [`<strong>${heading}</strong>`];

    if (act) {
      parts.push(`<span class="role">${act}</span>`);
    }

    for (const note of markerNotes(date)) {
      parts.push(`<p class="tooltip-note">${note}</p>`);
    }

    if (date?.year) {
      parts.push(`<div class="dates">${formatMarkerDate(date)}</div>`);
    }

    for (const line of extraLines) {
      parts.push(`<p class="role">${line}</p>`);
    }

    return parts.join("");
  }

  function showTooltip(html, x, y) {
    tooltipEl.innerHTML = html;
    tooltipEl.hidden = false;
    const rect = tooltipEl.getBoundingClientRect();
    let left = x + 12;
    let top = y + 12;
    if (left + rect.width > window.innerWidth - 8) left = x - rect.width - 12;
    if (top + rect.height > window.innerHeight - 8) top = y - rect.height - 12;
    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
  }

  function hideTooltip() {
    tooltipEl.hidden = true;
  }

  let selectedLeaderKey = null;

  function clearBarSelection() {
    selectedLeaderKey = null;
    document.querySelectorAll(".bar.selected").forEach((el) => {
      el.classList.remove("selected");
    });
    document.documentElement.classList.remove("bar-selected");
  }

  function selectLeaderBars(leaderKey) {
    clearBarSelection();
    if (!leaderKey) return;

    selectedLeaderKey = leaderKey;
    let any = false;
    document.querySelectorAll(".bar.ruler").forEach((bar) => {
      if (bar.dataset.leader === leaderKey) {
        bar.classList.add("selected");
        any = true;
      }
    });
    document.documentElement.classList.toggle("bar-selected", any);
    if (!any) selectedLeaderKey = null;
  }

  function bindBarTooltip(el, html) {
    el.addEventListener("mouseenter", (e) => showTooltip(html, e.clientX, e.clientY));
    el.addEventListener("mousemove", (e) => showTooltip(html, e.clientX, e.clientY));
    el.addEventListener("mouseleave", hideTooltip);
  }

  function copyTextToClipboard(text) {
    const value = String(text || "").trim();
    if (!value) return;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => fallbackCopyText(value));
      return;
    }
    fallbackCopyText(value);
  }

  function fallbackCopyText(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* ignore */
    }
    document.body.removeChild(ta);
  }

  function bindNameCopy(el, name) {
    if (!name) return;
    el.dataset.copyName = name;
    el.title = el.title || "Click to copy name";
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      copyTextToClipboard(name);
    });
  }

  function bindRulerSelection(bar, leaderKey, leaderName) {
    bar.dataset.leader = leaderKey;
    bar.setAttribute("role", "button");
    bar.tabIndex = 0;
    bar.style.cursor = "pointer";
    bar.title = "Click to highlight · name copied";

    const toggle = (e) => {
      e.stopPropagation();
      copyTextToClipboard(leaderName);
      const already =
        selectedLeaderKey === leaderKey && bar.classList.contains("selected");
      if (already) clearBarSelection();
      else selectLeaderBars(leaderKey);
    };

    bar.addEventListener("click", toggle);
    bar.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle(e);
      }
    });
  }

  function abbreviatedLeaderName(fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return fullName;
    const surname = parts[parts.length - 1];
    const initials = parts
      .slice(0, -1)
      .map((p) => `${p[0].toUpperCase()}.`)
      .join(" ");
    return `${initials} ${surname}`;
  }

  function renderTimelineMarker(track, date, options) {
    if (!date?.year) return null;

    const { yearToX } = geo();
    const { metrics, className, heading, extraLines = [] } = options;
    const x = yearToX(date.year, date.month, date.day, metrics);
    const marker = document.createElement("div");
    marker.className = `marker ${className}`;
    marker.style.left = `${x}px`;

    bindBarTooltip(marker, buildMarkerTooltip({ heading, date, extraLines }));
    marker.style.pointerEvents = "auto";
    marker.style.cursor = "help";
    track.appendChild(marker);
    return x;
  }

  function renderAxis(metrics) {
    const { TIMELINE_START, TIMELINE_END, USSR_DISSOLVED } = timelineData();
    const axis = document.createElement("div");
    axis.className = "axis";
    axis.style.width = `${metrics.trackWidth}px`;

    for (let y = TIMELINE_START; y <= TIMELINE_END; y++) {
      const isDecade = y % 10 === 0;
      const isMajor = isDecade || y % 5 === 0;
      const cell = document.createElement("div");
      cell.className = `axis-year ${isMajor ? "major" : "minor"}`;
      if (isDecade) cell.classList.add("decade");
      if (y === USSR_DISSOLVED.year) cell.classList.add("dissolution");

      const label = document.createElement("span");
      label.className = "axis-label";
      label.textContent = String(y);
      cell.appendChild(label);

      axis.appendChild(cell);
    }

    return axis;
  }

  function renderAxisCorner() {
    const corner = document.createElement("div");
    corner.className = "country-label axis-corner";
    corner.innerHTML = `
    <span class="axis-corner-label axis-corner-country">Country</span>
    <span class="axis-corner-label axis-corner-year">Year</span>
  `;
    return corner;
  }

  function renderAxisRow(metrics) {
    const row = document.createElement("div");
    row.className = "axis-row";
    row.appendChild(renderAxisCorner());
    row.appendChild(renderAxis(metrics));
    return row;
  }

  function renderYearGrid(metrics) {
    const { TIMELINE_START, TIMELINE_END } = timelineData();
    const grid = document.createElement("div");
    grid.className = "year-grid";

    for (let y = TIMELINE_START; y <= TIMELINE_END; y++) {
      const cell = document.createElement("div");
      const isDecade = y % 10 === 0;
      const isMajor = isDecade || y % 5 === 0;
      cell.className = "year-cell";
      if (isMajor) cell.classList.add("major");
      else cell.classList.add("minor");
      if (isDecade) cell.classList.add("decade");
      grid.appendChild(cell);
    }

    return grid;
  }

  function renderLeaderBar(track, leader, options) {
    const { yearToX, leaderDateLabel, rulerBarBackground, barLabelTheme, normalizeLeaderName } = geo();
    const { TIMELINE_START, TIMELINE_END } = timelineData();
    const {
      metrics,
      countryName,
      className,
      palette,
      indepX,
      roleLabel,
      minWidth = 6,
      labelMinWidth = 36,
    } = options;

    const startX = yearToX(leader.start, leader.startMonth || 1, leader.startDay || 1, metrics);
    const endYear = Math.min(leader.end, TIMELINE_END);
    // Present / open-ended terms fill through the last year column edge.
    const endX =
      leader.end >= TIMELINE_END
        ? metrics.trackWidth
        : yearToX(endYear, leader.endMonth || 12, leader.endDay || 31, metrics);
    const timelineStartX = yearToX(TIMELINE_START, 1, 1, metrics);
    const left = Math.max(startX, timelineStartX);
    let right = Math.min(endX, metrics.trackWidth);
    if (indepX != null) right = Math.min(right, indepX);
    const width = right - left;
    if (width < 2) return;

    const bar = document.createElement("div");
    bar.className = className;
    bar.style.left = `${left}px`;
    bar.style.width = `${Math.max(width, minWidth)}px`;
    bar.style.background = rulerBarBackground(palette);
    bar.dataset.search = `${leader.name} ${countryName}`.toLowerCase();

    if (width > labelMinWidth) {
      const theme = barLabelTheme(palette.color);
      const lbl = document.createElement("span");
      lbl.className = "bar-label";
      const text = document.createElement("span");
      text.className = "bar-label-text";
      text.textContent = abbreviatedLeaderName(leader.name);
      text.style.color = theme.fg;
      text.style.backgroundColor = theme.bg;
      lbl.appendChild(text);
      bar.appendChild(lbl);
    }

    const role = leader.role || roleLabel;
    const tip = `<strong>${leader.name}</strong>
    <span class="role">${countryName} · ${role}</span>
    <div class="dates">${leaderDateLabel(leader)}</div>`;
    bindBarTooltip(bar, tip);
    bindRulerSelection(bar, normalizeLeaderName(leader.name), leader.name);
    track.appendChild(bar);
  }

  function renderCountryRow(country, metrics, rowIndex) {
    const {
      yearToX,
      dateLabel,
      normalizeLeaderName,
      buildLeaderPaletteMap,
    } = geo();

    const row = document.createElement("div");
    row.className = "country-row";
    if (rowIndex % 2 === 1) row.classList.add("alt");
    row.dataset.countryId = country.id;
    row.dataset.region = country.region;

    const label = document.createElement("div");
    label.className = "country-label";

    const regionLabel = REGION_LABELS[country.region];
    if (regionLabel) {
      const hairline = document.createElement("span");
      hairline.className = "region-hairline";
      hairline.title = regionLabel;
      label.appendChild(hairline);
    }

    const flag = document.createElement("span");
    flag.className = "flag";
    flag.setAttribute("aria-hidden", "true");
    flag.textContent = country.flag;
    label.appendChild(flag);

    const name = document.createElement("span");
    name.className = "country-name";
    name.textContent = country.name;
    label.appendChild(name);

    row.appendChild(label);

    const track = document.createElement("div");
    track.className = "country-track";
    track.style.width = `${metrics.trackWidth}px`;

    track.appendChild(renderYearGrid(metrics));

    const indep = country.independence;
    const indepX = indep
      ? yearToX(indep.year, indep.month, indep.day, metrics)
      : null;

    const allLeaders = [
      ...(country.sovietLeaders || []).map((leader) => ({ ...leader, soviet: true })),
      ...country.rulers.map((leader) => ({ ...leader, soviet: false })),
    ];

    const leaderPalettes = buildLeaderPaletteMap(allLeaders);

    for (const leader of allLeaders) {
      const palette = leaderPalettes.get(normalizeLeaderName(leader.name));
      renderLeaderBar(track, leader, {
        metrics,
        countryName: country.name,
        className: "bar ruler",
        palette,
        indepX: leader.soviet ? indepX : null,
        roleLabel: leader.soviet ? "Republic head (USSR)" : "Head of state",
        minWidth: 4,
        labelMinWidth: 52,
      });
    }

    if (events) {
      events.renderCountryEvents(track, country, {
        yearToX,
        metrics,
        dateLabel,
        bindBarTooltip,
        bindNameCopy,
      });
    }

    if (country.sovereignty) {
      renderTimelineMarker(track, country.sovereignty, {
        metrics,
        className: "sovereignty",
        heading: "Sovereignty declared",
      });
    }

    if (indep) {
      const lastSoviet = (country.sovietLeaders || []).at(-1);
      renderTimelineMarker(track, indep, {
        metrics,
        className: "independence",
        heading: "Independence declared",
        extraLines: lastSoviet ? [`Last Soviet-era head · ${lastSoviet.name}`] : [],
      });
    }

    row.appendChild(track);
    return row;
  }

  function applyFilters() {
    const list = countries();
    const q = searchInput.value.trim().toLowerCase();

    document.querySelectorAll(".country-row").forEach((row) => {
      const id = row.dataset.countryId;
      const country = list.find((c) => c.id === id);
      if (!country) return;

      let matchesSearch = !q;
      if (q) {
        const haystack = [
          country.name,
          ...(country.sovietLeaders || []).map((l) => `${l.name} ${l.role || ""}`),
          ...country.rulers.map((r) => r.name),
          ...(events ? events.getFilterSearchTerms(country) : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        matchesSearch = haystack.includes(q);
      }

      row.classList.toggle("hidden", !matchesSearch);

      row.querySelectorAll(".bar").forEach((bar) => {
        if (!q) {
          bar.classList.remove("focused", "dimmed");
          return;
        }
        const match = (bar.dataset.search || "").includes(q);
        bar.classList.toggle("focused", match);
        bar.classList.toggle("dimmed", !match);
      });
    });
  }

  function render() {
    const list = countries();
    if (!list.length) return;

    const { getMetrics, yearToX } = geo();
    const { USSR_DISSOLVED } = timelineData();

    const t0 = performance.now();
    const metrics = getMetrics();

    timelineEl.innerHTML = "";
    timelineEl.style.position = "relative";

    timelineEl.appendChild(renderAxisRow(metrics));

    const body = document.createElement("div");
    body.className = "timeline-body";

    for (const [index, country] of list.entries()) {
      body.appendChild(renderCountryRow(country, metrics, index));
    }

    const dissolutionX = yearToX(
      USSR_DISSOLVED.year,
      USSR_DISSOLVED.month,
      USSR_DISSOLVED.day,
      metrics
    );
    const dissolution = document.createElement("div");
    dissolution.className = "zigzag-cut dissolution-cut";
    dissolution.style.left = `${metrics.labelWidth + dissolutionX}px`;
    bindBarTooltip(
      dissolution,
      buildMarkerTooltip({
        heading: "USSR ceased to exist",
        date: { ...USSR_DISSOLVED, act: "Declaration No. 142-N" },
      })
    );
    dissolution.style.pointerEvents = "auto";
    dissolution.style.cursor = "help";
    body.appendChild(dissolution);

    timelineEl.appendChild(body);
    applyFilters();
    if (selectedLeaderKey) selectLeaderBars(selectedLeaderKey);
    window.__lastTimelineRenderMs = performance.now() - t0;
    window.dispatchEvent(new Event("timeline-debug-refresh"));
  }

  document.addEventListener("click", () => {
    if (selectedLeaderKey) clearBarSelection();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && selectedLeaderKey) clearBarSelection();
  });

  searchInput.addEventListener("input", applyFilters);

  window.applyTimelineFilters = applyFilters;
  window.renderTimeline = render;

  window.TimelineRender = { render, applyFilters };
})();

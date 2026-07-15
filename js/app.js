/**
 * Boot glue for the timeline page.
 *
 * Public window API (after scripts load / data ready):
 *   TIMELINE_DATA              — loaded dataset (load.js)
 *   renderTimeline             — rebuild chart DOM
 *   applyTimelineFilters       — re-apply search filter
 *   getTimelineMetrics         — { yearWidth, labelWidth, trackWidth }
 *   TimelineGeometry           — year mapping + ruler palette helpers
 *   TimelineControls           — settings panel + display toggles
 *   TimelineRender             — render / applyFilters
 *   TimelineTheme / TimelineExport / TimelineEvents — feature modules
 */
(function () {
  const scrollEl = document.getElementById("timeline-scroll");

  function initTimelineApp() {
    const data = window.TIMELINE_DATA;
    if (!data?.countries?.length || window.__timelineAppInitialized) return;
    window.__timelineAppInitialized = true;

    window.TimelineEvents?.init();
    window.TimelineTheme?.init();
    window.TimelineExport?.init();

    window.renderTimeline();

    requestAnimationFrame(() => {
      const { getMetrics, yearToX } = window.TimelineGeometry;
      const metrics = getMetrics();
      const x1991 = yearToX(1991, 1, 1, metrics) - 80;
      scrollEl.scrollLeft = Math.max(0, x1991);
    });
  }

  window.TimelineControls?.init();

  window.addEventListener("timeline-data-ready", initTimelineApp);
  if (window.TIMELINE_DATA?.countries?.length) initTimelineApp();

  window.addEventListener("timeline-theme-change", () => {
    window.TimelineGeometry?.invalidateRulerPalette();
    if (typeof window.renderTimeline === "function") window.renderTimeline();
  });

  window.addEventListener("resize", () => {
    clearTimeout(window._timelineResizeTimer);
    window._timelineResizeTimer = setTimeout(() => {
      if (typeof window.renderTimeline === "function") window.renderTimeline();
    }, 150);
  });
})();

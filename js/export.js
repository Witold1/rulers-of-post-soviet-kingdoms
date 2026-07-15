/**
 * Export legend + full-width timeline as PNG (html2canvas).
 */
(function () {
  const FILENAME_BASE = "post-soviet-rulers-timeline";

  function exportFilename() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const stamp = [
      d.getFullYear(),
      pad(d.getMonth() + 1),
      pad(d.getDate()),
      pad(d.getHours()),
      pad(d.getMinutes()),
      pad(d.getSeconds()),
    ].join("-");
    return `${FILENAME_BASE}-${stamp}.png`;
  }

  function chartBg() {
    return getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  }

  /** Exact pixel width of country column + year track (no gutter). */
  function timelineContentWidth() {
    if (typeof window.getTimelineMetrics === "function") {
      const { labelWidth, trackWidth } = window.getTimelineMetrics();
      return labelWidth + trackWidth;
    }
    const timelineEl = document.getElementById("timeline");
    return timelineEl?.scrollWidth || 0;
  }

  function expandTimelineForCapture() {
    const scrollEl = document.getElementById("timeline-scroll");
    const timelineEl = document.getElementById("timeline");
    if (!scrollEl || !timelineEl) return null;

    const fullWidth = timelineContentWidth();
    const saved = {
      scrollEl,
      timelineEl,
      scrollOverflow: scrollEl.style.overflow,
      scrollWidth: scrollEl.style.width,
      scrollMaxWidth: scrollEl.style.maxWidth,
      timelineWidth: timelineEl.style.width,
    };

    scrollEl.style.overflow = "visible";
    scrollEl.style.width = `${fullWidth}px`;
    scrollEl.style.maxWidth = `${fullWidth}px`;
    timelineEl.style.width = `${fullWidth}px`;

    return saved;
  }

  function restoreTimelineLayout(saved) {
    if (!saved) return;
    saved.scrollEl.style.overflow = saved.scrollOverflow;
    saved.scrollEl.style.width = saved.scrollWidth;
    saved.scrollEl.style.maxWidth = saved.scrollMaxWidth;
    saved.timelineEl.style.width = saved.timelineWidth;
  }

  function insertCaptureHeader(surface) {
    const header = document.createElement("div");
    header.className = "export-capture-header";
    header.innerHTML = `
      <h2 class="export-capture-title">Rulers of Post-Soviet Kingdoms</h2>
      <p class="export-capture-subtitle">How political leadership changed - or didn't - across the 15 post-Soviet states after the collapse of the Soviet Union (1985–2026).</p>
    `;
    surface.insertBefore(header, surface.firstChild);
    return header;
  }

  async function savePng() {
    if (typeof html2canvas !== "function") {
      window.alert("PNG export library failed to load. Check your network connection.");
      return;
    }

    const surface = document.getElementById("export-surface");
    const btn = document.getElementById("save-png");
    const tooltip = document.getElementById("tooltip");

    if (!surface) return;

    const label = btn?.querySelector(".export-btn-label");
    const prevLabel = label?.textContent || "Save PNG";

    if (btn) {
      btn.disabled = true;
      if (label) label.textContent = "Exporting…";
    }

    if (tooltip) tooltip.hidden = true;
    document.body.classList.add("is-exporting");

    const layout = expandTimelineForCapture();
    const header = insertCaptureHeader(surface);
    const fullWidth = timelineContentWidth();

    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const canvas = await html2canvas(surface, {
        backgroundColor: chartBg(),
        scale: 2,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        onclone: (doc) => {
          const cloneSurface = doc.getElementById("export-surface");
          const cloneScroll = doc.getElementById("timeline-scroll");
          const cloneTimeline = doc.getElementById("timeline");
          const width = fullWidth;

          if (cloneScroll && cloneTimeline) {
            cloneScroll.style.overflow = "visible";
            cloneScroll.style.width = `${width}px`;
            cloneScroll.style.maxWidth = `${width}px`;
            cloneTimeline.style.width = `${width}px`;
          }

          doc.querySelectorAll(".country-label").forEach((el) => {
            el.style.position = "relative";
            el.style.left = "auto";
            el.style.boxShadow = "none";
          });

          doc.querySelectorAll(".country-track, .axis").forEach((el) => {
            el.style.flexShrink = "0";
          });

          if (cloneSurface) {
            cloneSurface.style.maxWidth = "none";
            cloneSurface.style.width = "max-content";
            cloneSurface.style.margin = "0";
            cloneSurface.style.left = "0";
            cloneSurface.style.top = "0";
          }

          doc.querySelectorAll(".legend, .chart-panel, .footer").forEach((el) => {
            el.style.maxWidth = `${width}px`;
            el.style.width = `${width}px`;
            el.style.margin = "0";
            el.style.boxSizing = "border-box";
          });
        },
      });

      const link = document.createElement("a");
      link.download = exportFilename();
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      window.alert(
        "Could not save PNG. If you opened the file directly, try the local server (serve.ps1) so fonts load correctly."
      );
    } finally {
      header.remove();
      restoreTimelineLayout(layout);
      document.body.classList.remove("is-exporting");
      if (btn) {
        btn.disabled = false;
        if (label) label.textContent = prevLabel;
      }
    }
  }

  function init() {
    document.getElementById("save-png")?.addEventListener("click", savePng);
  }

  window.TimelineExport = { init, savePng };
})();

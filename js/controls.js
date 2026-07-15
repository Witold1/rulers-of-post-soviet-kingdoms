/**
 * Settings panel and display-layer toggles (localStorage + html class flags).
 */
(function () {
  /**
   * @param {string} checkboxId
   * @param {string} storageKey
   * @param {string} className — toggled on <html>
   * @param {{ defaultVisible?: boolean, mode?: "hide" | "enable" }} [options]
   *   mode "hide" (default): add className when layer is hidden
   *   mode "enable": add className when layer is visible
   */
  function initDisplayToggle(checkboxId, storageKey, className, options = {}) {
    const { defaultVisible = true, mode = "hide" } = options;
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;

    function apply() {
      const visible = checkbox.checked;
      const on = mode === "enable" ? visible : !visible;
      document.documentElement.classList.toggle(className, on);
      try {
        localStorage.setItem(storageKey, visible ? "1" : "0");
      } catch {
        /* ignore */
      }
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "0") checkbox.checked = false;
      else if (stored === "1") checkbox.checked = true;
      else checkbox.checked = defaultVisible;
    } catch {
      /* ignore */
    }

    checkbox.addEventListener("change", apply);
    apply();
  }

  function initSettingsPanel() {
    const btn = document.getElementById("settings-btn");
    const panel = document.getElementById("settings-panel");
    if (!btn || !panel) return;

    function setOpen(open) {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.classList.toggle("is-open", open);
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(panel.hidden);
    });

    panel.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", () => {
      if (!panel.hidden) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) setOpen(false);
    });
  }

  function initDisplayToggles() {
    initDisplayToggle("show-ruler-bars", "timeline-ruler-bars-visible", "ruler-bars-hidden");
    initDisplayToggle("show-bar-labels", "timeline-bar-labels-visible", "bar-labels-hidden");
    initDisplayToggle(
      "show-regions",
      "timeline-regions-visible",
      "regions-enabled",
      { defaultVisible: true, mode: "enable" }
    );
    initDisplayToggle(
      "show-sovereignty-markers",
      "timeline-sovereignty-markers-visible",
      "sovereignty-markers-hidden"
    );
    initDisplayToggle(
      "show-independence-markers",
      "timeline-independence-markers-visible",
      "independence-markers-hidden"
    );
    initDisplayToggle(
      "show-dissolution-marker",
      "timeline-dissolution-marker-visible",
      "dissolution-marker-hidden"
    );
  }

  function init() {
    initSettingsPanel();
    initDisplayToggles();
  }

  window.TimelineControls = { init, initDisplayToggle };
})();

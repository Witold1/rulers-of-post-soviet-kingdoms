/**
 * Light / dark themes — Economist-inspired editorial tokens.
 * Respects saved preference, then system setting.
 */
(function () {
  const STORAGE_KEY = "timeline-theme";

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      /* ignore */
    }
    return null;
  }

  function getTheme() {
    return getStoredTheme() || systemTheme();
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    document.querySelectorAll("[data-theme-btn]").forEach((btn) => {
      const active = btn.dataset.themeBtn === theme;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.classList.toggle("is-active", active);
    });

    window.dispatchEvent(new CustomEvent("timeline-theme-change", { detail: { theme } }));
  }

  function setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    applyTheme(theme);
  }

  function bindControls() {
    document.querySelectorAll("[data-theme-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setTheme(btn.dataset.themeBtn);
      });
    });

    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
      if (!getStoredTheme()) applyTheme(systemTheme());
    });
  }

  function init() {
    applyTheme(getTheme());
    bindControls();
  }

  window.TimelineTheme = { init, getTheme, setTheme };
})();

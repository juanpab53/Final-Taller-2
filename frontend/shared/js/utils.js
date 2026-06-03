(function () {
  const html = document.documentElement;
  const saved = localStorage.getItem("bibliotheca-theme");

  if (saved === "dark") {
    html.setAttribute("data-theme", "dark");
  } else if (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    html.setAttribute("data-theme", "dark");
  }

  window.toggleTheme = function () {
    const isDark = html.getAttribute("data-theme") === "dark";
    if (isDark) {
      html.removeAttribute("data-theme");
      localStorage.setItem("bibliotheca-theme", "light");
    } else {
      html.setAttribute("data-theme", "dark");
      localStorage.setItem("bibliotheca-theme", "dark");
    }
  };
})();

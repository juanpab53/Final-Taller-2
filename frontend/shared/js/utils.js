(function () {
  const html = document.documentElement;
  const saved = localStorage.getItem("fervor-theme");

  if (saved === "dark") {
    html.setAttribute("data-theme", "dark");
  } else if (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    html.setAttribute("data-theme", "dark");
  }

  window.toggleTheme = function () {
    // Enable color transitions only during the toggle (not on page load)
    html.classList.add("theme-transitioning");

    const isDark = html.getAttribute("data-theme") === "dark";
    if (isDark) {
      html.removeAttribute("data-theme");
      localStorage.setItem("fervor-theme", "light");
    } else {
      html.setAttribute("data-theme", "dark");
      localStorage.setItem("fervor-theme", "dark");
    }

    // Remove the class after transitions finish (350ms + small buffer)
    window.clearTimeout(html._themeTimer);
    html._themeTimer = window.setTimeout(function () {
      html.classList.remove("theme-transitioning");
    }, 400);
  };
})();

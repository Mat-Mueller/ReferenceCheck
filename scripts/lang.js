// 1) Load dictionary from ROOT so it works under /en/
window.loadLanguage = function(lang = "en") {
  return fetch(`/lang/${lang}.json`)  // <-- changed: leading slash
    .then(res => res.json())
    .then(dict => {
      window.langDict = dict;
      window.actualLang = lang;
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) el.textContent = dict[key];
      });

      document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (dict[key]) el.setAttribute("placeholder", dict[key]);
      });
    })
    .catch(err => console.error("Error loading language:", err));
};

// 2) Decide language from URL; switcher NAVIGATES to the other URL
document.addEventListener("DOMContentLoaded", () => {
  const isEN = window.location.pathname.startsWith("/en/");
  const currentLang = isEN ? "en" : "de";
  window.loadLanguage(currentLang);

  const langMenuBtn = document.getElementById("lang-menu-btn");
  const langMenu = document.getElementById("lang-menu");
  const langMenuItems = langMenu ? langMenu.querySelectorAll("li") : [];

  // Toggle dropdown
  if (langMenuBtn && langMenu) {
    langMenuBtn.addEventListener("click", () => {
      langMenu.classList.toggle("show");
    });
  }

  // Mark active language and navigate on click
  langMenuItems.forEach(item => {
    const lang = item.getAttribute("data-lang");
    if (lang === currentLang) item.classList.add("active-lang");

    item.addEventListener("click", () => {
      const target = lang === "en" ? "/en/" : "/";
      window.location.href = target;  // full navigation to language URL
    });
  });

  // Close menu when clicking outside
  window.addEventListener("click", (e) => {
    if (langMenu && !e.target.closest(".lang-switcher-container")) {
      langMenu.classList.remove("show");
    }
  });
});

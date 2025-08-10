window.loadLanguage = function(lang = "en") {
    return fetch(`lang/${lang}.json`)
        .then(res => res.json())
        .then(dict => {
            // Store translations globally
            window.langDict = dict;

            // Replace text content
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                if (dict[key]) {
                    el.textContent = dict[key];
                }
            });

            // Replace placeholders (like input placeholder)
            document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
                const key = el.getAttribute("data-i18n-placeholder");
                if (dict[key]) {
                    el.setAttribute("placeholder", dict[key]);
                }
            });
        })
        .catch(err => console.error("Error loading language:", err));
};

// Language switcher setup
document.addEventListener("DOMContentLoaded", () => {
    const defaultLang = localStorage.getItem("lang") || navigator.language.slice(0, 2) || "en";
    window.loadLanguage(defaultLang);

    // --- New Menu Logic ---
    const langMenuBtn = document.getElementById("lang-menu-btn");
    const langMenu = document.getElementById("lang-menu");
    const langMenuItems = langMenu.querySelectorAll("li");

    // Toggle the dropdown menu visibility
    if (langMenuBtn) {
        langMenuBtn.addEventListener("click", () => {
            langMenu.classList.toggle("show");
        });
    }

    // Set the initial language and highlight the active one
    langMenuItems.forEach(item => {
        if (item.getAttribute("data-lang") === defaultLang) {
            item.classList.add("active-lang");
        }
    });

    // Handle language selection from the dropdown
    langMenuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            const selectedLang = e.target.getAttribute("data-lang");
            if (selectedLang) {
                localStorage.setItem("lang", selectedLang);
                location.reload();
            }
        });
    });

    // Close the menu if the user clicks outside of it
    window.addEventListener("click", (e) => {
        if (!e.target.closest(".lang-switcher-container") && langMenu.classList.contains("show")) {
            langMenu.classList.remove("show");
        }
    });
    // --- End of New Menu Logic ---

});

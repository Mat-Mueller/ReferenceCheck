import { createMenue, referenceSectionGUI, referenceSeparationGUI, MatchGuessing, DragDrop, secondFrame, thirdFrame, clearRightContainer, MoveToFirstSpan  } from './uiComponents.js';
import { readRenderPDF } from './pdfLoader.js';
import { findReferenceSection, userDecisionReferenceSection } from './findReferenceList.js';
import { subdivide, userDecisionSeparation } from './separateReferences.js';
import { inTextSearch, removeOldSpans } from './inTextCitations.js';
import { performCrossRefSearch } from './crossrefSearch.js';
import {CreateCrossLinksHighlight} from './magic.js'



// Load saved language from localStorage OR use browser language
const savedLang = localStorage.getItem("lang") || navigator.language.slice(0, 2) || "en";

// Call the function from lang.js (attached to window)
window.loadLanguage(savedLang);

// Set the select dropdown to the saved language
const langSelect = document.getElementById("lang-switch");
if (langSelect) {
    langSelect.value = savedLang;

    langSelect.addEventListener("change", (e) => {
        const selectedLang = e.target.value;
        localStorage.setItem("lang", selectedLang); // Save choice
        location.reload(); // Reload the page so both static and dynamic text match
    });
}

async function main() {
    // Display a description that helps the user understand the software
    //displaySoftwareDescription();
    //document.getElementById("scholar-container").scrollTo({ top: 0, behavior: 'smooth' });

    //document.getElementById("DescriptionID").scrollIntoView()
    createMenue();
    // Read and render user-input PDF

    passwordProtect();
    Coockie();
    privacey()
    await readRenderPDF();


    
}

function passwordProtect() {
    const correctPassword = "Schumpeter"; // Change this to your desired password

    document.getElementById("password-button").addEventListener("click", function () {
      const input = document.getElementById("password-input").value;
      const error = document.getElementById("password-error");

      if (input === correctPassword) {
        document.getElementById("password-overlay").style.display = "none";
      } else {
        error.textContent = "Incorrect password. Try again.";
      }
    });

    // Optional: Allow Enter key to submit
    document.getElementById("password-input").addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        document.getElementById("password-button").click();
      }
    });
}

function Coockie() {
    document.addEventListener("DOMContentLoaded", function () {
        const container = document.getElementById("cookie-container");
        const button = document.getElementById("cookie-btn");
      
        localStorage.removeItem("cookieBannerDismissed");    ////////// only for testing, delete when live
        if (!localStorage.getItem("cookieBannerDismissed")) {
          container.style.display = "block";
          // Trigger slide-in animation
          setTimeout(() => container.classList.add("show"), 50);
        }
      
        button.addEventListener("click", function () {
          container.classList.remove("show");
          localStorage.setItem("cookieBannerDismissed", "true");
          setTimeout(() => {
            container.style.display = "none";
          }, 500); // Wait for animation to finish
        });
      });
}

function privacey() {
    document.addEventListener("DOMContentLoaded", function () {
        const modal = document.getElementById("privacy-modal");
        const closeBtn = document.getElementById("close-modal");
        const body = document.body;
        const modalContent = modal.querySelector(".modal-content");

        // Inject the privacy text
        modalContent.innerHTML = '<span id="close-modal" class="close-btn">&times;</span>' + window.privacyPolicyText;

        // Open modal via mailto link with inner text "Privacy Policy"
        document.querySelector('a[href^="mailto:"][innerText="Privacy Policy"]')?.addEventListener("click", function (e) {
            e.preventDefault();
            modal.style.display = "flex";
            body.classList.add("modal-open");
        });

        // Also open via element with ID "open-privacy-modal"
        document.getElementById("open-privacy-modal")?.addEventListener("click", function (e) {
            e.preventDefault();
            modal.style.display = "flex";
            body.classList.add("modal-open");
        });

        // Close modal
        modal.addEventListener("click", function (e) {
            if (e.target === modal || e.target.id === "close-modal") {
                modal.style.display = "none";
                body.classList.remove("modal-open");
            }
        });
    });
}


// Initialize the main event listener
document.addEventListener("DOMContentLoaded", main());

export async function analysis() {
    // Try to detect reference section automatically
    console.log("Try to detect reference section automatically");
    let refSecAuto = findReferenceSection("byTitle");

    while (true) {
        // Let user decide on where reference section is
        document.getElementById("description").style.display = "none"; // Clear right container
        removeOldSpans()

        let referenceCount = await referenceSectionGUI(refSecAuto);

        // Search for in-text citations and set up GUI for results
        inTextSearch();
        MoveToFirstSpan();

        // Set up GUI for results and crossref search
        document.getElementById("settings").style.display = "none";
        secondFrame(referenceCount);
        MatchGuessing();
        thirdFrame();
        DragDrop();
        performCrossRefSearch();
        CreateCrossLinksHighlight();

        // Await button click before restarting loop
        await waitForButtonClick("Goback");
    }
}

// Helper function to wait for button click
function waitForButtonClick(buttonId) {
    return new Promise(resolve => {
        const button = document.getElementById(buttonId);
        button.style.display = "block"; // Show the button

        const onClick = () => {
            button.removeEventListener("click", onClick); // Remove listener after click
            button.style.display = "none"; // Hide the button after click
            console.log("Button clicked, continuing...");
            const secondframe = document.getElementById('secondframe');
            if (secondframe) {
                secondframe.innerHTML = "";
                secondframe.style = "display: none"
            }
            const thirdframe = document.getElementById('thirdframe');
            if (thirdframe) {
                thirdframe.innerHTML = "";
                thirdframe.style = "display: none"
            }
            resolve(); // Resolve the promise when clicked
        };

        button.addEventListener("click", onClick);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const goBack = document.getElementById("Goback");
    if (goBack) {
        goBack.addEventListener("click", () => {
            history.back(); // or use: window.location.href = 'index.html';
        });
    }


});


document.addEventListener("DOMContentLoaded", () => {
    const cookieContainer = document.getElementById("cookie-container");
    const cookieButton = document.getElementById("cookie-btn");

    // Hide banner if already accepted
    if (localStorage.getItem("cookieBannerAccepted") === "true") {
        if (cookieContainer) cookieContainer.style.display = "none";
    }

    // Handle button click
    if (cookieButton) {
        cookieButton.addEventListener("click", () => {
            localStorage.setItem("cookieBannerAccepted", "true");
            if (cookieContainer) cookieContainer.style.display = "none";
        });
    }
});

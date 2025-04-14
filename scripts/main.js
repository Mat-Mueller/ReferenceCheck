import { displaySoftwareDescription, createMenue, referenceSectionGUI, referenceSeparationGUI, MatchGuessing, DragDrop, secondFrame, thirdFrame, clearRightContainer, MoveToFirstSpan  } from './uiComponents.js';
import { readRenderPDF } from './pdfLoader.js';
import { findReferenceSection, userDecisionReferenceSection } from './findReferenceList.js';
import { subdivide, userDecisionSeparation } from './separateReferences.js';
import { inTextSearch, removeOldSpans } from './inTextCitations.js';
import { performCrossRefSearch } from './crossrefSearch.js';
import {CreateCrossLinksHighlight} from './magic.js'





async function main() {
    // Display a description that helps the user understand the software
    displaySoftwareDescription();
    //document.getElementById("scholar-container").scrollTo({ top: 0, behavior: 'smooth' });

    //document.getElementById("DescriptionID").scrollIntoView()
    createMenue();
    // Read and render user-input PDF

    passwordProtect();

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

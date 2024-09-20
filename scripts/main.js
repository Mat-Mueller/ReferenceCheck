import { displaySoftwareDescription, referenceSectionGUI } from './uiComponents.js';
import { readRenderPDF } from './pdfLoader.js';
import { continueAnalysis } from './referenceAnalysis.js';
import { findReferenceSection, userDecisionReferenceSection } from './findReferenceList.js';

async function main() {
    // Display a description that helps the user understand the software
    displaySoftwareDescription();

    // Read and render user-input PDF
    await readRenderPDF();

    // Try to detect reference section automatically
    let refSecAuto = findReferenceSection("byTitle");

    // Let user decide on where reference section is
    referenceSectionGUI(refSecAuto);
    try {
        // Wait for promise containing user choice for reference section
        const refSecUser = await userDecisionReferenceSection(refSecAuto);

        // If promise is resolved, continue with reference separation
        if (refSecUser) {
            console.log("Reference section found, proceeding with analysis...");
            continueAnalysis(refSecUser);
        }
    } catch (error) {
        console.error("Error finding reference section:", error);
    }
}

// Initialize the main event listener
document.addEventListener("DOMContentLoaded", main());

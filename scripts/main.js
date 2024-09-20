import { displaySoftwareDescription, referenceSectionGUI, referenceSeparationGUI } from './uiComponents.js';
import { readRenderPDF } from './pdfLoader.js';
import { findReferenceSection, userDecisionReferenceSection } from './findReferenceList.js';
import { subdivide, userDecisionSeparation } from './separateReferences.js';
import { inTextSearch } from './inTextCitations.js';

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
        var refSecUser = await userDecisionReferenceSection(refSecAuto);
        console.log("Reference section found, proceeding with analysis...");
    } catch (error) {
        console.error("Error finding reference section:", error);
    }

    // Compute number of references by method to inform user
    const paragraphCount = subdivide(refSecUser, "byParagraph");
    const indentCount = subdivide(refSecUser, "byIndent");

    referenceSeparationGUI(paragraphCount, indentCount);
    try {
        // Wait for promise containing number of separated references according to method chosen by user
        var referenceCount = await userDecisionSeparation(refSecUser);
    } catch (error) {
        console.error("Error separating references:", error);
    }
    
    // Search for in-text citations and set up GUI for results
    inTextSearch(referenceCount);
}

// Initialize the main event listener
document.addEventListener("DOMContentLoaded", main());

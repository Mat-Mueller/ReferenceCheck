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
    let referenceFound = findReferenceSection("byTitle");

    // Let user decide on where reference section is
    referenceSectionGUI(referenceFound);
    referenceFound = userDecisionReferenceSection(referenceFound);

    // Continue analysis after reference section is found
    continueAnalysis(referenceFound);
}

// Initialize the main event listener
document.addEventListener("DOMContentLoaded", main());

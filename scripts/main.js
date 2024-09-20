import { readRenderPDF } from './pdfLoader.js';
import { displaySoftwareDescription } from './uiComponents.js';
import { startAnalysis } from './referenceAnalysis.js';

async function main() {
    // Display a description that helps the user understand the software
    displaySoftwareDescription();

    // Read and render user-input PDF
    await readRenderPDF();

    // Start analysis after rendering all pages
    startAnalysis();
}

// Initialize the main event listener
document.addEventListener("DOMContentLoaded", main());

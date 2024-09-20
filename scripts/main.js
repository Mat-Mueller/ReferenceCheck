import { readRenderPDF } from './pdfLoader.js';
import { displaySoftwareDescription } from './uiComponents.js';

// Initialize the main event listener
document.addEventListener("DOMContentLoaded", () => {
    readRenderPDF();
    displaySoftwareDescription();
});

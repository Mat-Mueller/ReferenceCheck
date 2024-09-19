// Called from main.js, reads in and renders pdf, initializes reference section analysis

import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs';
import { startAnalysis } from './referenceAnalysis.js';
import { checkFooter, checkHeader } from './headerFooterDetect.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs';

export let pdfDocument = null;
const pdfContainer = document.getElementById('pdf-container');

// Initialize PDF loader by setting up drag-and-drop and file input handling
export function initializePDFLoader() {
    // Assign functions to window to make them globally accessible
    window.handleDragOver = function (event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy'; // Indicates a copy action
    };

    window.handleDrop = function (event) {
        event.preventDefault();
        event.stopPropagation();

        const file = event.dataTransfer.files[0];  // Get the dropped file
        handleFile(file);  // Use the same logic for handling file input or drag-and-drop
    };

    // Handle file input button
    const fileInput = document.getElementById('pdf-upload');
    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];  // Get the file from the input button
        handleFile(file);  // Handle the file in the same way as drag-and-drop
    });
}

// Handle file processing for both drag-and-drop and input button
function handleFile(file) {
    if (file && file.type === 'application/pdf') {
        const fileURL = URL.createObjectURL(file);  // Create a URL for the file
        loadPDF(fileURL);  // Call loadPDF function to render the PDF
    } else {
        alert('Please select a valid PDF file.');
    }
}

async function loadPDF(url) {
    try {
        // Load the PDF document
        const pdf = await pdfjsLib.getDocument(url).promise;
        pdfDocument = pdf;

        // Clear the previous content
        document.getElementById('pdf-container').innerHTML = '';

        // Wait for all pages to be rendered
        await renderAllPages();


        checkFooter()
        checkHeader()
        // Start analysis after rendering all pages
        startAnalysis();
    } catch (error) {
        console.error("Error loading or rendering PDF:", error);
    }
}

async function renderAllPages() {
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum); // Wait for the page to be loaded
        const viewport = page.getViewport({ scale: 1.5 });
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'textLayer';
        textLayerDiv.style.height = `${viewport.height}px`;
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.position = 'relative';
        textLayerDiv.style.marginBottom = '5px'; // Space between pages
        textLayerDiv.style.overflow = 'hidden'; // Hide overflow content

        pdfContainer.appendChild(textLayerDiv);
        console.log("hi there")
        const textContent = await page.getTextContent(); // Wait for text content to be retrieved

        let lines = []; // Array to store lines with their Y coordinate

        textContent.items.forEach(function (textItem) {
            const currentY = textItem.transform[5]; // Y coordinate
            const currentX = textItem.transform[4]; // X coordinate
            const lineText = textItem.str;
            const fontSize = textItem.transform[0]; // Extract font size
            const fontName = textItem.fontName; // Extract font name (for bold, italic, etc.)

            let line = lines.find(line => Math.abs(line.y - currentY) < 2); // Find line with a similar Y coordinate

            if (!line) {
                line = {
                    text: '',
                    x: currentX,
                    y: currentY,
                    fontSize: fontSize, // Store font size for the line
                    fontName: fontName // Store font name for the line
                };
                lines.push(line);
            }

            line.text += lineText;
        });

        // Sort lines by their Y coordinate (descending order)
        lines.sort((a, b) => b.y - a.y);

        const firstLine = lines[0]; // The first line (topmost)
        const lastLine = lines[lines.length - 1]; // The last line (bottom-most)

        // Render all lines
        lines.forEach(function (line) {
            const lineElement = document.createElement('div');
            lineElement.textContent = line.text.replace(/\s+/g, ' ').trim(); // Remove any trailing space
            lineElement.className = 'textLine';
            lineElement.style.position = 'absolute';
            lineElement.style.whiteSpace = 'pre'; // Preserve whitespace
            lineElement.style.left = `${line.x}px`; // Set X position based on the first text item
            lineElement.style.top = `${(viewport.height - line.y * 1.5)}px`; // Set Y position (inverted)
            lineElement.style.margin = '0'; // Ensure no margin is added
            lineElement.style.padding = '0'; // Ensure no padding is added

            // Apply font size and font weight (bold) if applicable
            lineElement.style.fontSize = `${line.fontSize}px`; // Set font size
            if (line.fontName && line.fontName.toLowerCase().includes('bold')) {
                lineElement.style.fontWeight = 'bold'; // Set bold style if the font name contains "bold"
            }
            if (line === firstLine) {
                lineElement.setAttribute('data-header', 'true');
            }
            if (line === lastLine) {
                lineElement.setAttribute('data-footer', 'true');
            }


            textLayerDiv.appendChild(lineElement);
        });
    }
}

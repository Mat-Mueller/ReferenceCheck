// Called from main.js, reads in and renders pdf

import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs';
import { checkFooter, checkHeader } from './headerFooterDetect.js';
import {createZoomButtonsandSearchField} from "./createZoomButtonsandSearchField.js"
import {analysis} from "./main.js"

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs';

// Exported function that calls all functions necessary for reading and rendering of user-input PDFs
export async function readRenderPDF() {
    const file = await initializePDFLoader();
    

}

// Initialize PDF loader by setting up drag-and-drop and file input handling
function initializePDFLoader() {
    return new Promise((resolve, reject) => {
        window.handleDragOver = function (event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy'; // Indicates a copy action
        };
    
        // Get file via drop
        window.handleDrop = async function (event) {
            if (event.dataTransfer.files[0]) {
            LoadingPage()
            event.preventDefault();
            event.stopPropagation();
            
            const file = event.dataTransfer.files[0];  // Get the dropped file
            console.log(file)
            let pdfDocument = null;
            if (file && file.type === 'application/pdf') {
                pdfDocument = await loadPDF(file);  // Call loadPDF function to render the PDF
            } else {
                //alert('Please select a valid PDF file.');
            }
        
            // Wait for all pages to be rendered
            await renderAllPages(pdfDocument);
            detectFootnotesForAllTextLayers();
            createZoomButtonsandSearchField();        
            // Detect footers and headers

            analysis()
            if (file) {
                resolve(file);  // Resolve promise and return file
            } else {
                reject(new Error("No file selected"));
            }
            UNLoadingPage()
        }
            
        };

        // Get file via file selection
        const fileInput = document.getElementById('pdf-upload');
        fileInput.addEventListener('change', async function (event) {
            const file = event.target.files[0];  // Get file
            LoadingPage()
            let pdfDocument = null;
            if (file && file.type === 'application/pdf') {
                pdfDocument = await loadPDF(file);  // Call loadPDF function to render the PDF
            } else {
                alert('Please select a valid PDF file.');
            }
        
            // Wait for all pages to be rendered
            await renderAllPages(pdfDocument);
            detectFootnotesForAllTextLayers();
            createZoomButtonsandSearchField();
            // Detect footers and headers
            checkFooter()
            checkHeader()
            analysis()
            if (file) {
                resolve(file);  // Resolve promise and return file
            } else {
                reject(new Error("No file selected"));
            }
            UNLoadingPage()
        });
    });
}

async function loadPDF(file) {
    const url = URL.createObjectURL(file);
    try {
        // Load the PDF document
        const pdf = await pdfjsLib.getDocument(url).promise;

        // Clear the previous content
        document.getElementById('pdf-container').innerHTML = '';

        return pdf
    } catch (error) {
        console.error("Error loading or rendering PDF:", error);
    }
}

async function renderAllPages(pdfDocument) {
    const pdfContainer = document.getElementById('pdf-container');
    const dummy = document.createElement('div');
    dummy.id = "dummy"
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum); // Wait for the page to be loaded
        const viewport = page.getViewport({ scale: 2 });
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'textLayer';
        textLayerDiv.style.height = `${viewport.height}px`;
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.position = 'relative';
        textLayerDiv.style.marginBottom = '5px'; // Space between pages
        textLayerDiv.style.overflow = 'hidden'; // Hide overflow content

        pdfContainer.appendChild(dummy);
        dummy.appendChild(textLayerDiv);
        console.log("hi there")
        const textContent = await page.getTextContent(); // Wait for text content to be retrieved

        let lines = []; // Array to store lines with their Y coordinate

        textContent.items.forEach(function (textItem) {
            const currentY = textItem.transform[5]; // Y coordinate
            const currentX = textItem.transform[4]; // X coordinate
            const lineText = textItem.str;
            const fontSize = textItem.transform[0]; // Extract font size
            const fontName = textItem.fontName; // Extract font name (for bold, italic, etc.)
        
            // Find the line with a similar Y coordinate
            let line = lines.find(line => Math.abs(line.y - currentY) < 0.75 * fontSize);
        
            // If no line exists for this Y coordinate, create a new line entry
            if (!line) {
                line = {
                    text: '',
                    x: currentX,
                    y: currentY,
                    fontSizeFrequency: {}, // Track frequency of font sizes in this line
                    fontSize: null,         // Final font size for the line, to be determined
                    fontName: fontName,     // Store font name for the line
                    snippets: []            // Track individual snippets for further processing
                };
                lines.push(line);
            }
        
            // Append text to the line
            line.text += lineText;
        
            // Store snippet font size for frequency tracking
            if (!line.fontSizeFrequency[fontSize]) {
                line.fontSizeFrequency[fontSize] = 1;
            } else {
                line.fontSizeFrequency[fontSize]++;
            }
        
            // Store each snippet along with its font size (for future reference, if needed)
            line.snippets.push({
                text: lineText,
                x: currentX,
                fontSize: fontSize,
                fontName: fontName
            });
        });
        
        // After all items are processed, determine the most frequent font size for each line
        lines.forEach(function (line) {
            let maxFrequency = 0;
            let mostFrequentFontSize = null;
        
            // Determine the most frequent font size for the line
            for (const size in line.fontSizeFrequency) {
                if (line.fontSizeFrequency[size] > maxFrequency) {
                    maxFrequency = line.fontSizeFrequency[size];
                    mostFrequentFontSize = parseFloat(size);
                }
            }
        
            // Assign the most frequent font size to the entire line
            line.fontSize = mostFrequentFontSize;
        
            // Apply the most frequent font size to the entire line (optional, if rendering the line)
            // lineElement.style.fontSize = `${line.fontSize}px`; // Apply to rendered element if needed
        });
        

        // Sort lines by their Y coordinate (descending order)
        lines.sort((a, b) => b.y - a.y);

        const firstLine = lines[0]; // The first line (topmost)
        const lastLine = lines[lines.length - 1]; // The last line (bottom-most)

        // Render all lines
        lines.forEach(function (line, index) {
            const lineElement = document.createElement('div');
            lineElement.textContent = line.text.replace(/\s+/g, ' ').trim(); // Remove any trailing space
            lineElement.className = 'textLine';
            lineElement.setAttribute('data-page-num', pageNum);
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

            lineElement.id = `textLine-${pageNum}-${index}`; 
            textLayerDiv.appendChild(lineElement);
        });
    }


    
}

function detectFootnotesForAllTextLayers() {


    console.log("detecting Footnote lines")
    const textLayers = document.querySelectorAll('.textLayer'); // Get all text layers (each corresponding to a page)

    textLayers.forEach((textLayer, pageIndex) => {
        //console.log(pageIndex)
        // Step 1: Collect all text lines and their font sizes in this text layer
        const textLines = textLayer.querySelectorAll('.textLine');
        const fontSizeFrequency = {}; // To track font size frequencies
        const fontSizes = []; // To store all font sizes

        textLines.forEach(line => {
            const fontSize = parseFloat(window.getComputedStyle(line).fontSize);
            fontSizes.push(fontSize);

            // Count the frequency of each font size
            if (!fontSizeFrequency[fontSize]) {
                fontSizeFrequency[fontSize] = 1;
            } else {
                fontSizeFrequency[fontSize]++;
            }
        });

        // Step 2: Determine the most frequent (common) font size
        let mostFrequentFontSize = null;
        let maxFrequency = 0;
        for (const size in fontSizeFrequency) {
            if (fontSizeFrequency[size] > maxFrequency) {
                maxFrequency = fontSizeFrequency[size];
                mostFrequentFontSize = parseFloat(size); // Get the most frequent font size
            }
        }

        //console.log(`Most frequent font size on page ${pageIndex + 1}: ${mostFrequentFontSize}px`);

        // Step 3: Check the last lines to see if they have a smaller font size than the most frequent one
        for (let i = textLines.length - 1; i >= 0; i--) {
            const line = textLines[i];
            const fontSize = parseFloat(window.getComputedStyle(line).fontSize);

            // If the current line has a smaller font size, mark it as a footnote
            if (fontSize < mostFrequentFontSize) {
                line.classList.add("footnote"); // Add a "footnote" class to the line

            } else  {
                // If we've already found footnotes and the font size is not smaller, stop the loop
                break;
            }
        }
    });
}



function LoadingPage() {
    console.log("Loading Screen")
    document.getElementById("loadingScreen").style.display = "flex"
}

function UNLoadingPage() {
    console.log("Loading Screen")
    document.getElementById("loadingScreen").style.display = "none"
}



// Called from main.js, reads in and renders pdf

//import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs';
//import * as pdfjsLib from './pdf.js/pdf.mjs'; // Correct relative path to the module
import { checkFooter, checkHeader } from './headerFooterDetect.js';
import {createZoomButtonsandSearchField} from "./createZoomButtonsandSearchField.js"
import {analysis} from "./main.js"

//pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs';

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
    

document.getElementById("demo").addEventListener("click", async function (event) {
    LoadingPage();
    event.preventDefault();
    event.stopPropagation();

    window.demomode = true;  // your flag

    // pick file path based on language
    const  fileName = (window.currentLang === "en") ? "en/DemoDocEn.pdf" : "DemoDocde.pdf";
    const filePath = `/${fileName}`; 
    let pdfDocument = null;
    try {
        // load PDF via fetch
        const response = await fetch(filePath);
        const data = await response.arrayBuffer();

        // emulate file object if your loadPDF expects a File/Blob
        const file = new File([data], filePath, { type: "application/pdf" });

        pdfDocument = await loadPDF(file);  // Call loadPDF to render PDF
        document.getElementById("pdfFile").innerText = ": " + file.name;

        await renderAllPages(pdfDocument);
    } catch (err) {
        console.error("Failed to load PDF:", err);
        // alert("Please select a valid PDF file.");
    }

            // Dynamically load script after rendering
            const script = document.createElement("script");
            script.src = "/scripts/Trigger.js?ts=" + Date.now();
            script.onload = () => console.log("Trigger.js loaded successfully");
                document.body.appendChild(script);
            detectFootnotesForAllTextLayers();
            createZoomButtonsandSearchField();        
            // Detect footers and headers

            analysis()

            UNLoadingPage()
});


        // Get file via drop
        window.handleDrop = async function (event) {
            if (event.dataTransfer.files[0]) {
            LoadingPage()
            event.preventDefault();
            event.stopPropagation();
            
            const file = event.dataTransfer.files[0];  // Get the dropped file
            //console.log(file)
            let pdfDocument = null;
            if (file && file.type === 'application/pdf') {
                pdfDocument = await loadPDF(file);  // Call loadPDF function to render the PDF
                document.getElementById("pdfFile").innerText = ": " + file.name;
            } else {
                //alert('Please select a valid PDF file.');
            }
        
            // Wait for all pages to be rendered
            await renderAllPages(pdfDocument);
            const script = document.createElement("script");
            script.src = "/scripts/Trigger.js?ts=" + Date.now();
            script.onload = () => console.log("Trigger.js loaded successfully");
script.onerror = () => console.error("Trigger.js failed to load");
            document.body.appendChild(script);
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
                        const script = document.createElement("script");
            script.src = "/scripts/Trigger.js?ts=" + Date.now();
            script.onload = () => console.log("Trigger.js loaded successfully");
script.onerror = () => console.error("Trigger.js failed to load");
            document.body.appendChild(script);
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
let __pdfReady;
async function ensurePdfjs() {
  if (!__pdfReady) {
    __pdfReady = import('/pdf.js/pdf.mjs').then((m) => {
      // adjust paths if needed (e.g., './pdf.js/...')
      m.GlobalWorkerOptions.workerSrc = '/pdf.js/pdf.worker.mjs';
      window.pdfjsLib = m; // keep global for existing code
      return m;
    });
  }
  return __pdfReady;
}
async function loadPDF(file) {
    await ensurePdfjs();                // ← NEW: loads pdf.js on demand

    const url = URL.createObjectURL(file);
    try {
        // Load the PDF document
        const pdf = await pdfjsLib.getDocument({ url }).promise; // or just url

        // Clear the previous content
        document.getElementById('FAQ_container').style.display = "none";
        document.getElementById('pdf_frame_head').style.display = "flex";
        document.getElementById('pdf_frame').style.display = "block";
        document.getElementById('pdf_title').innerText = file.name;

        return pdf;
    } catch (error) {
        console.error("Error loading or rendering PDF:", error);
    } finally {
        URL.revokeObjectURL(url);       // free memory
    }
}

async function renderAllPages(pdfDocument) {
  const pdfContainer = document.getElementById('pdf_frame');
  const dummy = document.createElement('div');
  dummy.id = "dummy";

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });     // keep your scale
    const scale = viewport.scale;

    const textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer';
    // use the actual viewport size (no /2 or /1)
    textLayerDiv.style.height = `${viewport.height}px`;
    textLayerDiv.style.width  = `${viewport.width}px`;
    textLayerDiv.style.position = 'relative';
    textLayerDiv.style.marginBottom = '0px';
    textLayerDiv.style.overflow = 'hidden';

    pdfContainer.appendChild(dummy);
    dummy.appendChild(textLayerDiv);

    const textContent = await page.getTextContent();

    let lines = [];

    textContent.items.forEach(function (textItem) {
      // convert PDF units → viewport pixels
      const currentY = textItem.transform[5] * scale;   // f * scale
      const currentX = textItem.transform[4] * scale;   // e * scale
      const lineText = textItem.str;
      const fontSize = textItem.transform[0] * scale;   // scale the size too
      const fontName = textItem.fontName;

      // group by Y (in pixels)
      let line = lines.find(line => Math.abs(line.y - currentY) < 0.75 * fontSize);
      if (!line) {
        line = {
          text: '',
          x: currentX,
          y: currentY,
          fontSizeFrequency: {},
          fontSize: null,
          fontName: fontName,
          snippets: []
        };
        lines.push(line);
      }

      line.text += lineText;
      line.fontSizeFrequency[fontSize] = (line.fontSizeFrequency[fontSize] || 0) + line.text.length;

      line.snippets.push({
        text: lineText,
        x: currentX,
        fontSize: fontSize,
        fontName: fontName
      });
    });

    // pick dominant font size per line
    lines.forEach(function (line) {
      let maxFrequency = 0;
      let mostFrequentFontSize = null;
      for (const size in line.fontSizeFrequency) {
        if (line.fontSizeFrequency[size] > maxFrequency) {
          maxFrequency = line.fontSizeFrequency[size];
          mostFrequentFontSize = parseFloat(size);
        }
      }
      line.fontSize = mostFrequentFontSize;
    });

    // KEEP your original ordering: largest y first (visually top first)
    lines.sort((a, b) => b.y - a.y);

    const firstLine = lines[0];
    const lastLine  = lines[lines.length - 1];

    // render
    lines.forEach(function (line, index) {
      const lineElement = document.createElement('div');
      lineElement.textContent = line.text.replace(/\s+/g, ' ').trim();
      lineElement.className = 'textLine';
      lineElement.setAttribute('data-page-num', pageNum);
      lineElement.style.position = 'absolute';
      lineElement.style.whiteSpace = 'pre';
      lineElement.style.left = `${line.x}px`;
      // correct flip: top-left CSS ← bottom-left PDF (no *2)
      lineElement.style.top  = `${(viewport.height - line.y)}px`;
      lineElement.style.margin = '0';
      lineElement.style.padding = '0';

      lineElement.style.fontSize = `${line.fontSize}px`;
      if (line.fontName && line.fontName.toLowerCase().includes('bold')) {
        lineElement.style.fontWeight = 'bold';
      }
      if (line === firstLine) lineElement.setAttribute('data-header', 'true');
      if (line === lastLine)  lineElement.setAttribute('data-footer', 'true');

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
            
                // Check if the line starts with a number
                const lineText = line.textContent.trim();
                const match = lineText.match(/^(\d+)(\s*)(\w+)/); // Match starting number followed by a word
            
                if (match) {
                    // Insert a space between the number and the first word
                    line.textContent = `${match[1]} ${match[3]}` + lineText.slice(match[0].length);
                }
            }else  {
                // If we've already found footnotes and the font size is not smaller, stop the loop
                if (!/^\d+$/.test(line.textContent.trim())) {
                break;
                }
            }
        }
    });
}



function LoadingPage() {
    console.log("Loading Screen")
    document.getElementById("loadingScreen").style.display = "flex"
    document.getElementById("UserSelectLoading").style.display = "none"
}

function UNLoadingPage() {
    console.log("UnLoading Screen")
    document.getElementById("MainLoading").style.display = "none"
    document.getElementById("UserSelectLoading").style.display = "grid"
    // Add click event listener to the continue button
    document.getElementById("UserSelectExit").addEventListener("click", function() {
        document.getElementById("UserSelectContinue").style.display = "none"
        document.getElementById("loadingScreen").style.display = "none"
    }); 
    document.getElementById("UserSelectContinue").addEventListener("click", function() {
        document.getElementById("continue-button").click(); // Simulate a button click
        document.getElementById("UserSelectContinue").style.display = "none"
        document.getElementById("loadingScreen").style.display = "none"
    });
}



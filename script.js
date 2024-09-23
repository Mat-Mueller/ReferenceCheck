import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs';

const pdfContainer = document.getElementById('pdf-container');
let pdfDocument = null;
let searchMode = 'automatic'; // Initial search mode






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// PDF LOADING ETC //////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


document.addEventListener("DOMContentLoaded", () => {
    let Refselection = null;
    let selectionMode = "";

    let GlobalRange


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

    // Handle file processing for both drag-and-drop and input button
    function handleFile(file) {
        if (file && file.type === 'application/pdf') {
            const fileURL = URL.createObjectURL(file);  // Create a URL for the file
            loadPDF(fileURL);  // Call loadPDF function to render the PDF
        } else {
            alert('Please select a valid PDF file.');
        }
    }

    displaySoftwareDescription()

    function displaySoftwareDescription() {
        const scholarContainer = document.getElementById('scholar-container');

        // First div: Software overview
        const overviewFrame = document.createElement('div');
        overviewFrame.className = 'search-string-frame'; // Use similar class names for styling
        overviewFrame.style.padding = '15px'; // Add padding for better visual separation
        overviewFrame.style.lineHeight = '1.6'; // Improve readability with better line height

        // First part of the content (before "How It Works")
        const overviewHTML = `
        <h2>PDF Citation Analyzer</h2>
        <p>This software allows users to upload and interact with PDFs for citation analysis and validation using the CrossRef API. It helps identify and analyze references in PDF documents.</p>
    `;

        // Set the innerHTML for the first div (Overview)
        overviewFrame.innerHTML = overviewHTML;

        // Result frame for Features
        const featuresFrame = document.createElement('div');
        featuresFrame.className = 'result-frame';
        featuresFrame.style.backgroundColor = "#FFFFFF";
        featuresFrame.style.marginBottom = '15px'; // Add margin between steps
        featuresFrame.style.padding = '10px'; // Add padding inside each step frame
        featuresFrame.style.border = '1px solid #ddd'; // Optional: Add a light border

        const featuresTitle = document.createElement('h3');
        featuresTitle.textContent = 'Features';

        const featuresList = `
        <ul>
            <li>Upload PDF files for analysis</li>
            <li>Automatic and manual reference section detection</li>
            <li>CrossRef API integration for reference validation</li>
            <li>In-text citation highlighting and matching</li>
            <li>Google Scholar search for additional reference lookup</li>
        </ul>
    `;

        // Append features content to the frame
        featuresFrame.appendChild(featuresTitle);
        featuresFrame.innerHTML += featuresList;

        // Second div: How it works section with custom result frame
        const howItWorksFrame = document.createElement('div');
        howItWorksFrame.className = 'search-string-frame'; // Use similar class names for styling
        howItWorksFrame.style.padding = '15px'; // Add padding for better visual separation
        howItWorksFrame.style.lineHeight = '1.6'; // Improve readability with better line height

        // Steps are wrapped in custom-styled resultFrame divs
        const steps = [
            {
                title: 'Step 1: Uploading a PDF',
                description: 'You can upload a PDF either by dragging and dropping it into the designated area or using the file upload button. Once uploaded, the system processes and renders the PDF using the PDF.js library.'
            },
            {
                title: 'Step 2 & 3: Reference Section Detection and Analyzing References',
                description: 'The software can automatically or manually identify the reference section. After that, the reference section is analyzed, and references are separated by paragraph or indentation, depending on the structure of the document.'
            },
            {
                title: 'Step 4: CrossRef Search',
                description: 'Once references are separated, the tool performs CrossRef lookups to validate citations. The results are displayed within the document for easy review.'
            },
            {
                title: 'Step 5: Citation Highlighting',
                description: 'In-text citations are detected and matched with the references. The tool highlights both the in-text citation and its corresponding reference in the reference section.'
            },
            {
                title: 'Step 6: Google Scholar Search',
                description: 'For references where CrossRef doesn’t provide sufficient information, the tool offers a Google Scholar search option for extended citation lookup.'
            }
        ];

        // Add steps to the second div using resultFrame
        steps.forEach(step => {
            const resultFrame = document.createElement('div');
            resultFrame.className = 'result-frame';
            resultFrame.style.backgroundColor = "#FFFFFF";
            resultFrame.style.marginBottom = '15px'; // Add margin between steps
            resultFrame.style.padding = '10px'; // Add padding inside each step frame
            resultFrame.style.border = '1px solid #ddd'; // Optional: Add a light border

            const stepTitle = document.createElement('h4');
            stepTitle.textContent = step.title;

            const stepDescription = document.createElement('p');
            stepDescription.textContent = step.description;

            // Append title and description to the resultFrame
            resultFrame.appendChild(stepTitle);
            resultFrame.appendChild(stepDescription);

            // Append each resultFrame to the howItWorksFrame
            howItWorksFrame.appendChild(resultFrame);
        });

        // Append the overview, features, and how it works frames to the scholar container
        overviewFrame.appendChild(featuresFrame)
        scholarContainer.appendChild(overviewFrame);
        //scholarContainer.appendChild(featuresFrame);
        scholarContainer.appendChild(howItWorksFrame);
    }




    function clearPDFAndReload() {
        const pdfContainer = document.getElementById('pdf-container');
        pdfContainer.innerHTML = ''; // Clear the PDF container

        window.location.reload(true); // Reload the page from the server
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



    function checkFooter() {
        // Get all div elements that have the data-footer="true" attribute
        const footerDivs = document.querySelectorAll('div[data-footer="true"]');
        let numberOnlyCount = 0;

        // Helper function to check if a string contains only a number
        function isNumberOnly(text) {
            // Remove spaces and check if the remaining text is a number
            return /^\d+$/.test(text.trim());
        }

        // Loop through all footer divs to count how many contain only a number
        footerDivs.forEach(function (div) {
            const textContent = div.textContent.trim();
            if (isNumberOnly(textContent)) {
                numberOnlyCount++;
            }
        });

        // Check if at least half of the footer divs contain only a number
        const halfThreshold = Math.floor(footerDivs.length / 2);
        if (numberOnlyCount >= halfThreshold) {
            console.log("deleting footer")
            // If the condition is met, remove the 'textLine' class from those divs that only contain a number
            footerDivs.forEach(function (div) {

                    div.classList.remove('textLine');

            });
        }
    }

    function checkHeader() {

        let HeaderArray = []

        const headerDivs = document.querySelectorAll('div[data-header="true"]');

        headerDivs.forEach(function (div) {
            const textContent = div.textContent.trim();
            HeaderArray.push(textContent)
        });
        let uniqueHeaderArray = [...new Set(HeaderArray)];

        console.log(HeaderArray)
        console.log(uniqueHeaderArray)

        if (uniqueHeaderArray.length < (HeaderArray.length / 2)) {

            headerDivs.forEach(function (div) {

                div.classList.remove('textLine');

            });
        }

    }



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Functions to select potential References//////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////







    async function startAnalysis() {
        // Clear previous analysis results or messages
        const scholarContainer = document.getElementById("scholar-container");
        scholarContainer.innerHTML = '';

        // Call the function to find the reference section
        let referenceFound = findReferenceSection("byTitle");

        if (referenceFound) {
            // Create a frame for the success message
            const TextFrame = document.createElement('div');
            TextFrame.className = 'search-string-frame';
            TextFrame.style.marginBottom = '20px'; // Add bigger space between the message and the following content

            // Create paragraph for the reference section found message
            const TextFrameParagraph = document.createElement('p');
            TextFrameParagraph.innerHTML = 'Reference section found and highlighted!';

            // Add the paragraph to the text frame
            TextFrame.appendChild(TextFrameParagraph);



            // Create Continue/Set Manually buttons
            const buttonContainer = document.createElement('div');
            buttonContainer.style.marginTop = '10px'; // Add space above the buttons

            const buttonStyle = 'background-color: white; color: black; width: 100px;border-radius: 5px; padding: 10px; cursor: pointer;'; // Shared style for both buttons

            const continueButton = document.createElement('button');
            continueButton.innerText = 'Continue';
            continueButton.style.cssText = buttonStyle + 'margin-right: 10px;'; // Add some spacing between buttons
            buttonContainer.appendChild(continueButton);

            const setManuallyButton = document.createElement('button');
            setManuallyButton.innerText = 'Set manually';
            setManuallyButton.style.cssText = buttonStyle; // Apply the same style
            buttonContainer.appendChild(setManuallyButton);
            // Append buttons to the features frame
            TextFrame.appendChild(buttonContainer);
            scholarContainer.appendChild(TextFrame);

            // Add event listeners for Continue and Set Manually buttons
            continueButton.addEventListener('click', function () {
                continueAnalysis(referenceFound);
            });

            setManuallyButton.addEventListener('click', async function () {
                // If "Set manually" is clicked, manually select the reference section
                console.log("now manual");
                scholarContainer.innerHTML = '';
                // Create and display manual selection message
                const manualTextFrame = document.createElement('div');
                manualTextFrame.className = 'search-string-frame';
                manualTextFrame.style.marginTop = '20px'; // Add space above

                const manualTextParagraph = document.createElement('p');
                manualTextParagraph.innerHTML = 'Please select the start and end of the reference section manually.';
                manualTextFrame.appendChild(manualTextParagraph);

                scholarContainer.appendChild(manualTextFrame);

                // Call StartStop() to manually find the reference section
                referenceFound = await StartStop();

                if (referenceFound) {
                    continueAnalysis(referenceFound);
                }
            });
        } else {
            // If reference section was not found, show the "not found" message and allow manual selection
            console.log("now manual");

            scholarContainer.innerHTML = '';
            const TextFrame = document.createElement('div');
            TextFrame.className = 'search-string-frame';
            TextFrame.style.marginBottom = '20px'; // Add bigger space between the message and the following content

            // Create paragraph for the reference section found message
            const TextFrameParagraph = document.createElement('p');
            TextFrameParagraph.innerHTML = 'Reference section not found!<br>Please select the start and end of the reference section manually.';
            TextFrame.appendChild(TextFrameParagraph);



            scholarContainer.appendChild(TextFrame);

            // Call StartStop() to manually find the reference section
            referenceFound = await StartStop();

            // If reference section is found after manual selection, continue analysis
            if (referenceFound) {
                continueAnalysis(referenceFound);
            }
        }
    }




    // Function to continue analysis after reference section is found
    function continueAnalysis(referenceFound) {
        const scholarContainer = document.getElementById("scholar-container");
        scholarContainer.innerHTML = '';
        const TextFrame = document.createElement('div');
        TextFrame.className = 'search-string-frame';
        TextFrame.style.marginBottom = '20px'; // Add bigger space between the message and the following content

        // Create paragraph for the reference section found message
        const TextFrameParagraph = document.createElement('p');
        TextFrameParagraph.innerHTML = 'Which separation mode should I use?';
        TextFrame.appendChild(TextFrameParagraph);





        // Call the Sudivide function for both "byParagraph" and "byIndent"
        const paragraphCount = Sudivide(referenceFound, "byParagraph");
        const indentCount = Sudivide(referenceFound, "byIndent");

        // Create a container for the buttons to ensure they appear below the message
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '10px'; // Add space above the buttons

        // Shared button style
        const buttonStyle = 'background-color: white; color: black; border: 1px solid black; width: 200px; padding: 10px; cursor: pointer ;border-radius: 5px;';

        // Create and append the "By paragraph" button
        const paragraphButton = document.createElement('button');
        paragraphButton.innerText = `By paragraph (${paragraphCount} references found)`;
        paragraphButton.style.cssText = buttonStyle + 'margin-right: 10px;'; // Add spacing between buttons
        buttonContainer.appendChild(paragraphButton);

        // Create and append the "By indent" button
        const indentButton = document.createElement('button');
        indentButton.innerText = `By indent (${indentCount} references found)`;
        indentButton.style.cssText = buttonStyle; // Apply same style as paragraphButton
        buttonContainer.appendChild(indentButton);

        // Append buttonContainer to the desired DOM element


        // Append the button container below the success message
        TextFrame.appendChild(buttonContainer);
        scholarContainer.appendChild(TextFrame);
        // Add event listeners to the buttons
        paragraphButton.addEventListener('click', function () {
            Sudivide(referenceFound, "byParagraph");
            InTextSearch();
        });

        indentButton.addEventListener('click', function () {
            Sudivide(referenceFound, "byIndent");
            InTextSearch();
        });
    }


    let highlightCounter = 0; // Counter for unique IDs
    let isSelecting = false;
    let startContainer, startOffset;


    /*
    document.addEventListener("mouseup", function (e) {
        const selectionMode = document.getElementById('selectionMode').value;


        if (selectionMode === 'manual' || selectionMode === 'automatic') {
            Sudivide(window.getSelection());
        }

    });
    */


    function StartStop() {
        return new Promise((resolve) => {
            document.addEventListener("click", function (e) {
                //const selectionMode = document.getElementById('selectionMode').value;
                const frame = document.getElementById('pdf-container'); // Get the frame element

                // Check if the click is within the frame
                console.log(selectionMode)
                if (frame.contains(e.target)) {
                    if (!isSelecting) {
                        // First click: Set the start of the selection (find nearest div below)
                        isSelecting = true;
                        const nearestDiv = findNearestTextDivBelow(e.clientX, e.clientY);
                        if (nearestDiv) {
                            startContainer = nearestDiv;
                            startOffset = 0; // Start from the beginning of the div
                            console.log("Selection started at div:", startContainer);
                        }
                    } else {
                        // Second click: Set the end of the selection (find nearest div above)
                        isSelecting = false;
                        const nearestDiv = findNearestTextDivAbove(e.clientX, e.clientY);

                        const selection = window.getSelection();
                        const range = document.createRange();
                        if (startContainer && nearestDiv) {
                            range.setStart(startContainer.firstChild || startContainer, startOffset);
                            range.setEnd(nearestDiv.firstChild || nearestDiv, nearestDiv.textContent.length);

                            selection.removeAllRanges();
                            selection.addRange(range);
                            GlobalRange = range
                            resolve(selection)
                            console.log("found end")
                        } else {
                            console.log("Invalid selection; could not find valid start or end container.");
                        }

                    }
                }

            });
        });
    }



    function findNearestTextDivBelow(x, y) {
        const divs = pdfContainer.querySelectorAll('div.textLine'); // Only target divs with the 'textLine' class
        let nearestDiv = null;
        let nearestDistance = Infinity;

        divs.forEach(div => {
            const rect = div.getBoundingClientRect();
            const divY = rect.top;  // Use the top of the div

            if (divY >= y) {  // Only consider divs below the click point
                const distance = Math.abs(divY - y);

                if (distance < nearestDistance && div.textContent.trim().length > 0) {
                    nearestDistance = distance;
                    nearestDiv = div;
                }
            }
        });

        return nearestDiv;
    }

    function findNearestTextDivAbove(x, y) {
        const divs = pdfContainer.querySelectorAll('div.textLine'); // Only target divs with the 'textLine' class
        let nearestDiv = null;
        let nearestDistance = Infinity;

        divs.forEach(div => {
            const rect = div.getBoundingClientRect();
            const divY = rect.bottom;  // Use the bottom of the div

            if (divY <= y) {  // Only consider divs above the click point
                const distance = Math.abs(divY - y);

                if (distance < nearestDistance && div.textContent.trim().length > 0) {
                    nearestDistance = distance;
                    nearestDiv = div;
                }
            }
        });
        console.log(nearestDiv)
        return nearestDiv;
    }



    function findReferenceSection(selectedValue) {

        const titles = [
            'references',
            'références',
            'rÉférences',
            'r´ef´erences',
            'bibliography',
            'bibliographie',
            'literaturverzeichnis',
            'citations',
            'refs',
            'publications',
            'réfs',
            'rÉfs',
            'reference',
            'référence',
            'rÉférence'
        ];


        const divs = document.querySelectorAll('div.textLine'); // Get all div elements with class "textLine"
        let startPoint = null;
        let startFontSize
        let normalFontSize
        // Iterate through all divs to find the start of the reference section
        for (let i = 0; i < divs.length; i++) {
            const divText = divs[i].textContent.replace(/^[0-9.,: ]+/g, '').trim().toLowerCase(); // Get the text and convert to lowercase
            // Check if any of the keywords matches the div text
            if (titles.some(title => divText === title.toLowerCase())) {
                console.log('Reference section found at div index:', i);
                console.log('Text:', divs[i].textContent.trim());

                // Set the start point of the reference section
                startPoint = divs[i + 1];
                startFontSize = window.getComputedStyle(divs[i]).fontSize;
                normalFontSize = window.getComputedStyle(startPoint).fontSize;
                console.log(startFontSize)
                console.log(normalFontSize)
                // Optionally, highlight the start of the reference section
                startPoint.style.backgroundColor = 'yellow'; // Highlight the start of the reference section

                break; // Stop after finding the first match
            }
        }

        if (startPoint) {
            startPoint.scrollIntoView({ behavior: 'smooth', block: 'start' });
            let endPoint = null
            if (startFontSize > normalFontSize) {


                for (let i = Array.from(divs).indexOf(startPoint) + 1; i < divs.length; i++) {
                    const currentFontSize = window.getComputedStyle(divs[i]).fontSize;

                    // If we find a div with the same font size as startFontSize, set it as the endPoint
                    if (currentFontSize === startFontSize) {
                        endPoint = divs[i - 1];
                        console.log('Found matching font size div at index:', i);
                        break;
                    }
                }


            }
            if (!endPoint) {
                for (let i = Array.from(divs).indexOf(startPoint) + 1; i < divs.length; i++) {
                    const divText = divs[i].textContent.trim().toLowerCase(); // Get the text and convert to lowercase
                    const Endtitles = [
                        'appendix',

                    ];

                    if (Endtitles.some(Endtitles => divText.includes(Endtitles))) {

                        // If we find a div with the same font size as startFontSize, set it as the endPoint
                        endPoint = divs[i - 1];
                        console.log('Found matching font size div at index:', i);
                        break;
                    }
                }

            }


            if (!endPoint) {   /////////////////////////////////////////////////////////////////////////////////////////////// Check Appendix!!!!
                endPoint = divs[divs.length - 1]; // Last div element
                console.log('No matching font size found, reference section ends at the last div.');
            }
            // Assume the last div in the document is the end of the reference section
            console.log('Reference section ends at the last div.');

            // Create a Range and Selection for the reference section
            const range = document.createRange();
            const selection = window.getSelection();

            // Set the start of the range at the first child of the start div
            range.setStart(startPoint.firstChild || startPoint, 0);

            // Set the end of the range at the last child of the last div
            range.setEnd(endPoint.lastChild || endPoint, endPoint.textContent.length);

            // Clear existing selections
            selection.removeAllRanges();

            // Add the newly created range to the selection
            selection.addRange(range);

            GlobalRange = range

            // Call the Sudivide function with the selection
            return selection;


        } else {
            console.log('Reference section not found.');
            return null
        }



    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////Seperate Reference Section ////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////



    function Sudivide(selection, selectedCriterion) {



        console.log("subdivide")


        selection = window.getSelection();
        selection.removeAllRanges(); // Clear any current selection
        selection.addRange(GlobalRange); // Restore the saved range

        if (!selection.isCollapsed) {
            highlightCounter = 0
            // Get the selected criterion for separation
            //const selectedCriterion = document.getElementById('separationCriteria').value;
            // Get the selected mode for reference section
            //const selectedMode = document.getElementById('selectionMode').value;





            for (let i = 0; i < selection.rangeCount; i++) {
                const range = selection.getRangeAt(i);

                const container = range.commonAncestorContainer;
                const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
                    acceptNode: function (node) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                });

                let node;
                let pElements = [];

                while (node = walker.nextNode()) {
                    if (node.nodeName === 'DIV' && range.intersectsNode(node)) {
                        if (node.classList.contains('textLine')) { // Filter to only include textLine elements
                            pElements.push(node);
                        }
                    }
                }

                // If the selection mode is "manual", we don't subdivide at all
                if (selectedCriterion === 'None') {
                    let mergedContent = "";
                    for (let j = 0; j < pElements.length; j++) {
                        mergedContent += " " + pElements[j].textContent.trim();
                        pElements[j].setAttribute("myID", highlightCounter);
                        pElements[j].style.backgroundColor = '#add8e6';
                        pElements[j].classList.add('highlight');
                    }
                    triggerSearch(highlightCounter);
                    highlightCounter++;
                    continue; // Skip to the next range if in manual mode
                }

                // Calculate distances between consecutive DIVs if "byParagraph" is selected
                let distances = [];
                if (selectedCriterion === 'byParagraph') {
                    for (let j = 0; j < pElements.length - 1; j++) {
                        const currentRect = pElements[j].getBoundingClientRect();
                        const nextRect = pElements[j + 1].getBoundingClientRect();
                        const distance = nextRect.top - currentRect.bottom;
                        const roundedDistance = Math.round(distance * 10) / 10; // Round to one decimal place
                        distances.push(roundedDistance);
                    }
                }

                let indents = [];
                let noIndent
                let yesIndent
                if (selectedCriterion === 'byIndent') {
                    for (let j = 0; j < pElements.length - 1; j++) {
                        let currentRect = pElements[j].getBoundingClientRect().left;
                        currentRect = Math.round(currentRect * 10) / 10; // Round to one decimal place
                        indents.push(currentRect);
                    }

                    if (indents.length > 0) {
                        // Create a frequency map of indents
                        let freqMap = indents.reduce((acc, indent) => {
                            acc[indent] = (acc[indent] || 0) + 1;
                            return acc;
                        }, {});

                        // Convert frequency map to an array and sort by frequency
                        let sortedIndents = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);

                        if (sortedIndents.length >= 2) {
                            // Take the two most frequent indents
                            const mostFrequent = parseFloat(sortedIndents[0][0]);
                            const secondMostFrequent = parseFloat(sortedIndents[1][0]);

                            // Determine NoIndent and YesIndent
                            noIndent = Math.min(mostFrequent, secondMostFrequent);
                            yesIndent = Math.max(mostFrequent, secondMostFrequent);

                            console.log('NoIndent:', noIndent, 'YesIndent:', yesIndent);
                        } else {
                            console.log('Not enough distinct indent values');
                        }
                    }
                }




                // Find the most common distance
                const mostCommonDistance = findMostCommonDistance(distances);

                let mergedContent = "";
                const yearRegex = /(?<=^|\s|\()(19[4-9]\d|20[0-2]\d|2030)(?=$|\s|\)|\.|,)/;
                let counter = [];
                let currentColor = ["#7b92ed", "#83ed7b"]
                let colorCounter = 0
                const firstRect = pElements[0].getBoundingClientRect();
                for (let j = 0; j < pElements.length; j++) {


                    mergedContent += " " + pElements[j].textContent.trim();
                    pElements[j].setAttribute("myID", highlightCounter);
                    pElements[j].style.backgroundColor = currentColor[colorCounter]
                    pElements[j].classList.add('highlight');
                    counter.push(j);

                    // Separation logic based on the selected criterion
                    let shouldSeparate = false;

                    if (selectedCriterion === 'byYear') {
                        if (yearRegex.test(pElements[j + 1]?.textContent) || j == pElements.length - 1) {
                            shouldSeparate = true;
                        }
                    } else if (selectedCriterion === 'byParagraph') {

                        mergedContent += " " + pElements[j].textContent.trim();
                        pElements[j].setAttribute("myID", highlightCounter);
                        pElements[j].style.backgroundColor = currentColor[colorCounter]
                        pElements[j].classList.add('highlight');
                        counter.push(j);

                        const currentRect = pElements[j].getBoundingClientRect();
                        const nextRect = pElements[j + 1]?.getBoundingClientRect();

                        if (nextRect && (nextRect.top - currentRect.bottom > mostCommonDistance + 1) || j == pElements.length - 1) {
                            shouldSeparate = true;
                        }
                    } else if (selectedCriterion === 'byIndent') {


                        mergedContent += " " + pElements[j].textContent.trim();
                        pElements[j].setAttribute("myID", highlightCounter);
                        pElements[j].style.backgroundColor = currentColor[colorCounter]
                        pElements[j].classList.add('highlight');
                        counter.push(j);

                        const currentRect = pElements[j].getBoundingClientRect();
                        // Get the left position of the first div as the reference for non-indented divs
                        const nextRect = pElements[j + 1]?.getBoundingClientRect();

                        
                        //console.log(Math.round(pElements[j].getBoundingClientRect().left * 10) / 10)
                    


                        if (nextRect && (Math.round(nextRect.left * 10) / 10 === noIndent ) || j == pElements.length - 1) {
                            shouldSeparate = true;
                        }


                    }

                    if (shouldSeparate) {
                        //Make_Reference(highlightCounter, pElements);

                        counter = [];
                        highlightCounter++;

                        //await delay(2000); // Optional delay for any async tasks like highlighting
                    }
                }
                const notificationElement = document.getElementById('notification');
                notificationElement.textContent = `Found ${highlightCounter} References`;
            }
            return highlightCounter
        }

    }

    // Function to find the most common distance
    function findMostCommonDistance(distances) {
        if (distances.length === 0) return 0;

        // Count occurrences of each distance
        const distanceCount = distances.reduce((acc, dist) => {
            acc[dist] = (acc[dist] || 0) + 1;
            return acc;
        }, {});

        // Get the unique distances sorted by frequency and value
        const sortedDistances = Object.entries(distanceCount)
            .sort((a, b) => b[1] - a[1] || a[0] - b[0]) // Sort by frequency, then by distance value
            .map(([dist, count]) => ({ dist: parseFloat(dist), count })); // Convert the distances back to numbers

        // If there are more than two unique distances, reduce to the two most frequent
        if (sortedDistances.length > 2) {
            sortedDistances.length = 2; // Keep only the top two most frequent distances
        }

        // From the remaining distances, return the smallest
        return Math.min(sortedDistances[0].dist, sortedDistances[1].dist);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////INteraction, Analysis and Visualization////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////




    ///////////////////////////////////Crossref search ////////////////////////////////////////







    function getMergedTextByMyId(MyId) {
        const divs = document.querySelectorAll(`[MyId="${MyId}"]`);
        let mergedText = '';
        divs.forEach(div => {
            mergedText += div.textContent.trim() + ' ';
        });
        return mergedText.trim();
    }



    async function triggerSearch2(MyId) {
        const mergedText = getMergedTextByMyId(MyId);
        console.log(mergedText);

        // Select all div elements with the specified MyId attribute
        const divs = document.querySelectorAll(`[MyId="${MyId}"]`);

        if (mergedText.length > 0) {
            try {
                document.body.style.cursor = 'wait'; // Change cursor to wait
                const query = encodeURIComponent(mergedText);
                const apiUrl = `https://api.crossref.org/works?query.bibliographic=${query}&rows=3`;

                // Await the result of the fetch call
                const response = await fetch(apiUrl);
                const data = await response.json();
                const rateLimit = response.headers.get('X-Rate-Limit-Limit');
                const rateLimitRemaining = response.headers.get('X-Rate-Limit-Remaining');
                const rateLimitInterval = response.headers.get('X-Rate-Limit-Interval');

                console.log(`Rate Limit: ${rateLimit}`);
                console.log(`Rate Limit Remaining: ${rateLimitRemaining}`);
                console.log(`Rate Limit Interval: ${rateLimitInterval}`);

                console.log(data); // Log the response from the API
                document.body.style.cursor = 'default'; // Revert cursor to default

                return data; // Return the API data after it is fetched
            } catch (error) {
                console.error('Error fetching CrossRef data:', error);
                document.body.style.cursor = 'default'; // Revert cursor to default even if there's an error
                return null; // Return null in case of an error
            }
        } else {
            alert('No text found in the selected divs.');
            return null; // Return null if no text is found
        }
    }

    

    function calculateMatchPercentage(item, query) {
        // Decode the query string first
        query = decodeURIComponent(query);

        // Weights for different components
        let title_weight = 45;
        let author_weight = 30;
        let journal_weight = 10;
        let year_weight = 10;
        let doi_weight = 5;

        // Format the authors and other components
        const formattedAuthors = formatAuthors(item.author);
        const title = `$${formattedAuthors}
                    (${getYear(item.issued)}).
                    <strong><a href="${item.URL}" target="_blank">${item.title[0]}</a></strong>.
                    ${item['container-title'] ? item['container-title'][0] : 'Unknown Journal'}
                    DOI: ${item.DOI}`;

        // Clean and split title words
        const titleWords = item.title[0].replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);

        // Split decoded query into lowercase words
        var queryWords = query.replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);
        queryWords = queryWords.filter((element) => {
            return element.length > 1;
        });
        const queryWordSet = new Set(queryWords);

        // Clean and split author surnames
        let authorSurnames = formatAuthors_Surname(item.author).replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);

        // Clean and split journal name
        let journalWords = item['container-title'] ? item['container-title'][0].replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/) : [];

        // Year as a string
        let yearString = getYear(item.issued).toString();

        // Extract DOI from the query using regex
        const doiRegex = /\b10\.\d{4,}(?:\.\d+)*\/\S+\b/;
        const queryDOI = query.match(doiRegex) ? query.match(doiRegex)[0] : '';

        // DOI from the item
        let doiString = item.DOI ? item.DOI.toLowerCase() : '';
        // Count matches for title words
        let titleMatchCount = 0;
        titleWords.forEach(word => {
            if (queryWordSet.has(word)) {
                titleMatchCount++;
            }
        });
        // Count matches for author surnames
        let authorMatchCount = 0;
        authorSurnames.forEach(word => {
            if (queryWordSet.has(word)) {
                authorMatchCount++;
            }
        });
        // Count matches for journal words
        let journalMatchCount = 0;
        journalWords.forEach(word => {
            if (queryWordSet.has(word)) {
                journalMatchCount++;
            }
        });
        // Check if year matches
        let yearMatchCount = queryWordSet.has(yearString) ? 1 : 0;
        // Check if DOI matches
        let doiMatchCount = (queryDOI && queryDOI === doiString) ? 1 : 0;
        // Logging counts

        // Calculate match percentages for each component
        let titleMatchPercentage = (titleMatchCount / titleWords.length) * title_weight;
        let authorMatchPercentage = (authorMatchCount / authorSurnames.length) * author_weight;
        let journalMatchPercentage = (journalMatchCount / journalWords.length) * journal_weight;
        let yearMatchPercentage = yearMatchCount * year_weight;
        let doiMatchPercentage = doiMatchCount * doi_weight;
        // Combine match percentages
        var matchPercentage = Math.round(titleMatchPercentage + authorMatchPercentage + journalMatchPercentage + yearMatchPercentage + doiMatchPercentage);

        return matchPercentage;
    }

    function formatAuthors_Surname(authors) {
        if (!authors || authors.length === 0) {
            return '';
        }
        return authors.map(author => `$${author.family}`).join(', ');
    }

    function formatAuthors(authors) {
        if (!authors || authors.length === 0) {
            return '';
        }
        return authors.map(author => {
            const givenNameInitial = author.given ? `${author.given[0]}.` : '';
            return `${givenNameInitial} ${author.family}`;
        }).join(', ');
    }

    function getYear(issued) {
        if (!issued || !issued['date-parts'] || !Array.isArray(issued['date-parts']) || !issued['date-parts'][0] || !Array.isArray(issued['date-parts'][0])) {
            return 'Unknown Year';
        }
        return issued['date-parts'][0][0] || 'Unknown Year';
    }







    function firstFrame() {
        // First Frame for "Bla bla"
        const scholarContainer = document.getElementById('scholar-container');
        const TextFrame = document.createElement('div');
        TextFrame.className = 'search-string-frame';
        const TextFrameParagraph = document.createElement('p');
        TextFrameParagraph.innerHTML = `Found ${highlightCounter} References and ${document.querySelectorAll('span.citation').length} in-text citations.`;
        TextFrame.appendChild(TextFrameParagraph);
        scholarContainer.appendChild(TextFrame);
    }

    function secondFrame() {
        const scholarContainer = document.getElementById('scholar-container');
        // Second frame for references (collapsible frame)
        const ReferenceFrame = document.createElement('div');
        ReferenceFrame.className = 'search-string-frame collapsible-frame'; // Assign collapsible class
        ReferenceFrame.style.maxHeight = '400px';

        // Create and add headline for references
        const referenceTitle = document.createElement('p');
        referenceTitle.innerHTML = '<strong>References:</strong>';
        referenceTitle.style.marginBottom = '15px'

        // Create a container div to hold the buttons side by side
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'inline-block'; // Ensure buttons are on the same line

        // Create the toggle button for expanding/collapsing
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Show/Hide References';
        toggleButton.className = 'toggle-in-text-button';
        toggleButton.style.marginRight = '10px'; // Add some space between the buttons

        toggleButton.addEventListener('click', () => {
            // Toggle the max-height between 100px and the full height of the content (to show/hide the reference frame)
            if (ReferenceFrame.style.maxHeight === '400px') {
                ReferenceFrame.style.maxHeight = ReferenceFrame.scrollHeight + 'px'; // Expand to content height
            } else {
                ReferenceFrame.style.maxHeight = '400px'; // Collapse back to minimum height
            }
        });

        // Append the toggle button to the button container
        buttonContainer.appendChild(toggleButton);

        // Create the second button for CrossRef search
        const crossRefAllButton = document.createElement('button');
        crossRefAllButton.textContent = 'Search All CrossRef';
        crossRefAllButton.className = 'crossref-all-button';

        // Add event listener to trigger the search for all references when clicked
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Add event listener to the CrossRef search button
        crossRefAllButton.addEventListener('click', async () => {
            // Find all buttons with class 'crossref-search-button'
            const crossRefButtons = document.querySelectorAll('.crossref-search-button');

            // Iterate through each button and trigger its click event with a delay
            for (let i = 0; i < crossRefButtons.length; i++) {
                crossRefButtons[i].click(); // Trigger the individual click event

                // Introduce a delay of 1 second (1000 ms) between each request
                await sleep(1000);
            }
        });
        buttonContainer.appendChild(crossRefAllButton);
        referenceTitle.appendChild(buttonContainer);
        referenceTitle.appendChild(toggleButton);

        ReferenceFrame.appendChild(referenceTitle);


        let citationSpans = document.querySelectorAll('span.citation');

        for (let j = 0; j < highlightCounter; j++) {
            const divs = document.querySelectorAll(`[MyId="${j}"]`);
            let matchCount = 0;
            let matchedSpans = [];
            const mergedText = getMergedTextByMyId(j);
            const firstWord = mergedText.split(' ')[0].replace(/,$/, '').replace(".","");
            console.log(mergedText)
            var MyYear = mergedText.match(/\b\d{4}[a-zA-Z]?\b/)
            if (MyYear) {
                MyYear = MyYear[0]
            }
            const ReferenceFrameParagraph = document.createElement('p');
            ReferenceFrameParagraph.className = 'Reference-frame';

            // Loop through each span element
            citationSpans.forEach((span) => {
                let cleanedText = span.getAttribute('cleanedCit');
                let SpanYear = span.getAttribute('year');   ///// Spanier ;-)
                let firstWordCit = cleanedText.split(' ')[0].replace(",", "");
                //console.log(firstWord.toLowerCase())
                //console.log(firstWordCit.toLowerCase())
                if (firstWord.toLowerCase() === firstWordCit.toLowerCase() && MyYear === SpanYear) {

                    matchCount++
                    matchedSpans.push(span)
                    if (!span.hasAttribute('found')) { span.setAttribute('found', 'true') }
                    span.addEventListener('click', () => {

                        ReferenceFrameParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    });
                }


            });




            // Create first paragraph with inline style
            var SingleRef = document.createElement('p');
            SingleRef.innerHTML = mergedText;
            SingleRef.style.marginBottom = '15px'; // Add some space below

            ReferenceFrameParagraph.appendChild(SingleRef);

            // Create second paragraph with inline style
            SingleRef = document.createElement('p');
            SingleRef.innerHTML = `has been found ${matchCount} times in the document.`;
            SingleRef.style.marginBottom = '15px'; // Add space as needed
            matchedSpans.forEach((span, index) => {
                //console.log(span);

                // Create a link for each match
                const link = document.createElement('a');
                link.textContent = `${index + 1}`; // Display 1, 2, 3, etc.
                link.href = "#"; // Dummy href to make it clickable

                // Add an event listener to scroll to the span element when clicked
                link.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent the default anchor behavior
                    span.scrollIntoView({ behavior: 'smooth' }); // Scroll to the matched span
                });

                // Append the link to the paragraph without using innerHTML
                SingleRef.appendChild(link);

                // Add a comma and space after the link, except for the last one
                if (index < matchedSpans.length - 1) {
                    SingleRef.appendChild(document.createTextNode(', ')); // Add a comma and space
                }
            });


            // Add the CrossRef search button
            const crossRefButton = document.createElement('button');
            crossRefButton.textContent = 'Search CrossRef';
            crossRefButton.className = 'crossref-search-button';
            crossRefButton.style.marginBottom = '15px'; // Add space below the button
            crossRefButton.style.marginLeft = '15px';
            crossRefButton.id = `crossref-button-${j}`

            crossRefButton.addEventListener('click', async () => {
                const searchData = await triggerSearch2(j); // Wait for the search data
                const query = getMergedTextByMyId(j); // Get the merged text for comparison

                // Remove the button after it's clicked
                crossRefButton.remove();

                // If search data is available, process it and show results
                if (searchData && searchData.message && searchData.message.items && searchData.message.items.length > 0) {
                    const results = searchData.message.items.slice(0, 3); // Get the first 3 results

                    const resultsDiv = document.createElement('div'); // Create a div to contain results
                    resultsDiv.className = 'crossref-results';
                    resultsDiv.style.marginTop = '10px'; // Add margin above results

                    let highestMatch = 0;

                    // Loop through the first 3 results and add them to the resultsDiv
                    results.forEach(item => {
                        if (item.title && item.URL) { // Check if title and URL are present
                            const resultFrame = document.createElement('div');
                            resultFrame.className = 'result-frame';
                            resultFrame.style.backgroundColor = "#FFFFFF";

                            // Format authors
                            const formattedAuthors = formatAuthors(item.author);

                            // Create a single paragraph element
                            const resultParagraph = document.createElement('p');
                            resultParagraph.style.fontSize = '16px'; // Set font size
                            resultParagraph.style.backgroundColor = "#FFFFFF";

                            // Calculate the match percentage (based on your logic)
                            const matchPercentage = calculateMatchPercentage(item, query);

                            // Construct the inner HTML content without new lines
                            resultParagraph.innerHTML = `
                    <strong>${matchPercentage}% Match</strong>.
                    ${formattedAuthors}.
                    (${getYear(item.issued)}).
                    <strong>${item.title[0]}</strong>.
                    ${item['container-title'] ? item['container-title'][0] : 'Unknown Journal'}.
                    DOI: <a href="${item.URL}" target="_blank">${item.DOI}</a>`;

                            resultFrame.appendChild(resultParagraph); // Append the combined paragraph to resultFrame

                            // Add empty line between results
                            resultFrame.style.marginBottom = '20px';

                            // Append the resultFrame to the resultsDiv
                            resultsDiv.appendChild(resultFrame);

                            // Track the highest match percentage
                            if (highestMatch < matchPercentage) {
                                highestMatch = matchPercentage;
                            }
                        }
                    });

                    ReferenceFrameParagraph.appendChild(resultsDiv); // Append the resultsDiv to the ReferenceFrameParagraph

                    // Apply color to ReferenceFrameParagraph based on highest match percentage
                    const hue = (highestMatch / 100) * 120; // Calculate hue based on highest match percentage (0 to 120)
                    ReferenceFrameParagraph.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;

                } else {
                    const noResultsMsg = document.createElement('p');
                    noResultsMsg.textContent = 'No CrossRef results found.';
                    ReferenceFrameParagraph.appendChild(noResultsMsg);
                }
            });



            // Append the CrossRef button to the paragraph
            SingleRef.appendChild(crossRefButton);
            ReferenceFrameParagraph.appendChild(SingleRef);
            // If no matches were found, highlight the text in red
            if (matchCount === 0) {
                ReferenceFrameParagraph.style.color = 'red';
                divs.forEach(div => {
                    div.style.color = 'red';
                });
            }

            // Append the ReferenceFrameParagraph to the main ReferenceFrame
            ReferenceFrame.appendChild(ReferenceFrameParagraph);

        }

        // Append the ReferenceFrame to the scholar container
        scholarContainer.appendChild(ReferenceFrame);




    }


    function thirdFrame() {
        const scholarContainer = document.getElementById('scholar-container');

        // Create the third frame for in-text citations (collapsible frame)
        const InTextCitFrame = document.createElement('div');
        InTextCitFrame.className = 'search-string-frame collapsible-frame'; // Assign collapsible class
        InTextCitFrame.style.maxHeight = '400px'; // Set initial max height

        // Create the toggle button for expanding/collapsing the in-text citation frame
        const toggleInTextButton = document.createElement('button');
        toggleInTextButton.className = 'toggle-in-text-button';
        toggleInTextButton.textContent = 'Show/Hide In-Text Citations';

        // Toggle the frame height when the button is clicked
        toggleInTextButton.addEventListener('click', () => {
            if (InTextCitFrame.style.maxHeight === '400px') {
                InTextCitFrame.style.maxHeight = InTextCitFrame.scrollHeight + 'px'; // Expand to content height
            } else {
                InTextCitFrame.style.maxHeight = '400px'; // Collapse back to initial height
            }
        });

        // Create the "Show All/Show Problematic" button
        const showToggleButton = document.createElement('button');
        showToggleButton.textContent = 'Show Problematic'; // Default to show only problematics
        let showAll = false; // Flag to track toggle state

        // Function to render the spans based on the current filter (all or problematic)
        const renderSpans = () => {
            // Clear existing paragraphs in InTextCitFrame (if any)
            const existingParagraphs = InTextCitFrame.querySelectorAll('.Reference-frame');
            existingParagraphs.forEach(paragraph => paragraph.remove());

            // Determine which spans to show
            let spansToShow;
            if (showAll) {
                spansToShow = document.querySelectorAll('span.citation'); // Show all spans
            } else {
                spansToShow = document.querySelectorAll('span:not([found])'); // Show only problematic spans
            }


            // Highlight unfound citations in red
            document.querySelectorAll('span:not([found])').forEach((span, index) => {
                span.style.backgroundColor = 'red'

            })


            // Loop through each span to create a clickable list item in the frame
            spansToShow.forEach((span, index) => {
                const cleanedCit = span.getAttribute('cleanedCit'); // Get the cleaned citation text

                if (cleanedCit) { // Only add if cleanedCit is available
                    const InTextCitFrameParagraph = document.createElement('p');
                    InTextCitFrameParagraph.className = 'Reference-frame';
                    InTextCitFrameParagraph.innerHTML = cleanedCit; // Display the cleaned citation text
                    InTextCitFrameParagraph.style.cursor = 'pointer'; // Make it look clickable

                    // When the paragraph is clicked, scroll to the respective span in the document
                    InTextCitFrameParagraph.addEventListener('click', () => {
                        span.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to the span
                    });

                    // Append the paragraph to the InTextCitFrame
                    InTextCitFrame.appendChild(InTextCitFrameParagraph);
                }
            });
        };

        // Add event listener to toggle between showing all and problematic
        showToggleButton.addEventListener('click', () => {
            showAll = !showAll; // Toggle the state
            showToggleButton.textContent = showAll ? 'Show Problematic' : 'Show All'; // Update button text
            renderSpans(); // Re-render spans based on the new state
        });

        // Append the toggle buttons to the InTextCitFrame
        InTextCitFrame.appendChild(toggleInTextButton);
        InTextCitFrame.appendChild(showToggleButton);

        // Append the InTextCitFrame to the scholar container
        scholarContainer.appendChild(InTextCitFrame);

        // Initial render showing only problematic spans
        renderSpans();
    }




    //////////// If clicked on Do intext analysis
    //document.getElementById('InText-button').addEventListener('click', InTextSearch);
    function InTextSearch() {
        //const scholarContainer = document.getElementById("scholar-container")

        console.log("doing intext search etc.")
        ///////// create first frame
        const scholarContainer = document.getElementById('scholar-container');
        scholarContainer.innerHTML = ''; // Clear previous content


        identifyAndWrapCitations();
        cleanCitations()

        firstFrame()

        secondFrame()

        thirdFrame()

    }







    function cleanCitations() {
        // Get all span elements with the class 'citation'
        let citationSpans = document.querySelectorAll('span.citation');

        // Helper function to get the preceding text, possibly from a previous div
        function getPreviousText(span) {
            let node = span.previousSibling;
            let textContent = '';

            // If it's a text node, extract text content
            if (node && node.nodeType === Node.TEXT_NODE) {
                textContent = node.textContent.replace("(", "").trim();
            }
            console.log(textContent)
            // If no text content is found or node is not valid, move to the previous div with class 'textLine'
            if (textContent === "") {
                let previousDiv = span.parentElement.previousElementSibling;

                // Loop to find the previous sibling div with class 'textLine'
                while (previousDiv && !previousDiv.classList.contains('textLine')) {
                    previousDiv = previousDiv.previousElementSibling;
                }

                // If a previous div with class 'textLine' was found, extract its text content
                if (previousDiv) {
                    textContent = previousDiv.textContent.trim();
                } else {
                    console.log("No previous div with class 'textLine' found.");
                }
            }

            return textContent.replace("(", "").trim();
        }

        // Loop through each span element
        citationSpans.forEach((span) => {

            let cleanedText = span.innerText.replace(/\(|\)/g, ''); // Remove parentheses
            console.log(cleanedText)
            let precedingText;
            // Check if the cleanedText is just a number (e.g., a year like 1966) --- narrative cit
            if (/^\d+$/.test(cleanedText)) {
                precedingText = getPreviousText(span);
                console.log(precedingText.split(' '))
                if (precedingText) {
                    let words = precedingText.split(' ');
                    let lastWord = words[words.length - 1]; // Get the word before the span

                    // Check if the word before the last word is "and", "&", or "al."
                    if (
                        words.length > 1 &&
                        (
                            words[words.length - 2].toLowerCase() === 'and' ||
                            words[words.length - 2].toLowerCase() === '&' ||
                            words[words.length - 1].toLowerCase().replace(",", "") === 'al.'
                        )
                    ) {
                        // Include both the second-to-last word and the last word
                        let secondLastWord = words[words.length - 2];
                        let thirdLastWord = words.length > 2 ? words[words.length - 3] : '';
                        cleanedText = `${thirdLastWord ? thirdLastWord + ' ' : ''}${secondLastWord} ${lastWord} ${cleanedText}`;
                    } else {
                        // If no "and" is present, just include the last word
                        cleanedText = `${lastWord} ${cleanedText}`;
                    }
                }
            } else {
                let words = cleanedText.replace(/(\d{4}[a-zA-Z]?).*/, '$1').split(" ");
                let lastWord = words[words.length - 2];
                if (words.length < 5) {
                    let precedingText = getPreviousText(span);
                    console.log(precedingText.split(' '))
                    if (precedingText) {
                        let precedingWords = precedingText.split(' ');

                        // Prepend words from precedingText until the words array has at least 5 words
                        while (words.length < 5 && precedingWords.length > 0) {
                            words.unshift(precedingWords.pop());
                        }
                    }
                }
                lastWord = words[words.length - 2]
                if (lastWord === "al." || lastWord === "al.,") {
                    // Get the last three words if the last word is "al.,"
                    words = words.slice(words.length - 4, words.length);
                } else if (words[words.length - 3] === "&" || words[words.length - 3] === "and" || words[words.length - 3] === "und") {
                    // Get the last three words if the second-to-last word is "&" or "and"
                    words = words.slice(words.length - 4, words.length);
                } else {
                    // Get only the last word in other cases
                    words = words.slice(words.length - 2, words.length);
                }

                // If words array has less than 5 words, prepend with text from getPreviousText()
                console.log(words)
                cleanedText = words.join(" ")
            }

            // Set a new attribute 'cleanedCit' with the cleaned text
            span.setAttribute('cleanedCit', cleanedText.replace("(", ""));
            span.setAttribute('title', cleanedText);
            // Find the first 4-digit year in the cleanedText
            let yearMatch = cleanedText.match(/\b\d{4}[a-zA-Z]?\b/);
            if (yearMatch) {
                span.setAttribute('year', yearMatch[0]);
            }
        });
    }




    function identifyAndWrapCitations() {
        const citationPattern = /\d{4}/;  // Regex to match a four-digit year (representing the year in a citation)
        let awaitingCitation = false;  // Flag to treat the next div as if it starts with an implicit "("

        // Get all divs with class 'textLine', excluding those with the attribute 'myid', and convert NodeList to an array
        const allDivs = Array.from(document.querySelectorAll('div.textLine:not([myid])'));

        let hasChanged = false

        // Loop through the array of divs
        for (let i = 0; i < allDivs.length; i++) {
            let div = allDivs[i];
            let divText = div.innerHTML.replace(/&amp;/g, '__AMP__');  // Temporarily replace & with __AMP__
            let modifiedText = divText;   // Initialize modified text for updating div content

            // If the previous div ended with an incomplete citation, prepend an implicit "("
            if (awaitingCitation) {
                modifiedText = '(' + modifiedText;
                awaitingCitation = false;  // Reset the flag since we're handling the continuation
                hasChanged = true
            }

            let openParenthesisIndex = modifiedText.indexOf('(');  // Find the first "("

            // Process citations if there is an opening parenthesis in the div
            while (openParenthesisIndex !== -1) {
                let closeParenthesisIndex = modifiedText.indexOf(')', openParenthesisIndex);  // Find the next closing parenthesis

                // If no closing parenthesis is found, assume it continues into the next div
                if (closeParenthesisIndex === -1) {
                    awaitingCitation = true;  // Set the flag to treat the next div as continuing a citation
                    //break;  // Move to the next div
                    closeParenthesisIndex = modifiedText.length
                }

                // Split the modifiedText into three parts:
                // 1. Text before the "("
                let beforeText = modifiedText.substring(0, openParenthesisIndex + 1);

                // 2. Text between "(" and ")"
                let citationText = modifiedText.substring(openParenthesisIndex + 1, closeParenthesisIndex).trim();

                // 3. Text after ")"
                let afterText = modifiedText.substring(closeParenthesisIndex);

                // Split the citation text by ";"
                let citationParts = citationText.split(';');
                let wrappedCitations = citationParts.map((part) => {
                    let trimmedPart = part.trim();
                    // Check if this part contains a year
                    if (citationPattern.test(trimmedPart)) {
                        return `<span class="citation">${trimmedPart}</span>`;
                    }
                    return trimmedPart;  // If no year, return it unchanged
                });

                // Join the wrapped citations back with "; "
                let wrappedCitationText = wrappedCitations.join('; ');

                // Rebuild the modifiedText with the before, wrapped citations, and after part
                modifiedText = beforeText + wrappedCitationText + afterText;

                // Look for the next "(" after this one
                openParenthesisIndex = modifiedText.indexOf('(', closeParenthesisIndex + 1);
            }

            // Before updating the div's content, replace __AMP__ back with "&"
            modifiedText = modifiedText.replace(/__AMP__/g, '&');

            if (hasChanged === true) {
                hasChanged = false
                modifiedText = modifiedText.substring(1);
            }

            // Update the div's content with the modified text
            div.innerHTML = modifiedText;
        }
    }

















});
// called from main.js to manually or automatically detect reference list

export function userDecisionReferenceSection(referenceFound) {
    return new Promise(async (resolve, reject) => {
        if (referenceFound) {
            // Identify buttons for decisions
            const continueButton = document.getElementById('continue-button');
            const setManuallyButton = document.getElementById('manual-button');

            // Add event listeners for Continue and Set Manually buttons
            continueButton.addEventListener('click', function () {
                resolve(referenceFound); // Resolve the promise with referenceFound
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
                referenceFound = await startStop();

                if (referenceFound) {
                    resolve(referenceFound); // Resolve the promise when referenceFound is available
                }
            });
        } else {
            // Call StartStop() to manually find the reference section
            referenceFound = await startStop();

            // If reference section is found after manual selection, resolve the promise
            if (referenceFound) {
                resolve(referenceFound); // Resolve the promise with the referenceFound
            }
        }
    });
}


export function startStop() {
    let isSelecting = false;
    return new Promise((resolve) => {
        document.addEventListener("click", function (e) {
            //const selectionMode = document.getElementById('selectionMode').value;
            const frame = document.getElementById('pdf-container'); // Get the frame element

            // Check if the click is within the frame
            if (frame.contains(e.target)) {
                let startContainer, startOffset;
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
                        // GlobalRange = range
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


export function findNearestTextDivBelow(x, y) {
    const pdfContainer = document.getElementById('pdf-container');
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


export function findNearestTextDivAbove(x, y) {
    const pdfContainer = document.getElementById('pdf-container');
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


export function findReferenceSection(selectedValue) {

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
                    'declaration',
                    'erklärung'
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
        console.log(endPoint.lastChild )
        range.setEnd(endPoint.lastChild || endPoint, endPoint.textContent.length - 1);

        // Clear existing selections
        selection.removeAllRanges();

        // Add the newly created range to the selection
        selection.addRange(range);


        return [startPoint, endPoint];


    } else {
        console.log('Reference section not found.');
        return null
    }
};

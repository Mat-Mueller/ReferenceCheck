// called from referenceAnalysis.js to manually or automatically detect reference list

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


function findNearestTextDivBelow(x, y) {
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


function findNearestTextDivAbove(x, y) {
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

        // GlobalRange = range

        // Call the Sudivide function with the selection
        return selection;


    } else {
        console.log('Reference section not found.');
        return null
    }
};
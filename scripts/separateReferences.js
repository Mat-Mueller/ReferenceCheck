export function userDecisionSeparation(referenceSection) {
    return new Promise(async (resolve, reject) => {
        // Identify buttons for decisions
        const paragraphButton = document.getElementById('paragraph-button');
        const indentButton = document.getElementById('indent-button');

        // Add event listeners to the buttons
        paragraphButton.addEventListener('click', function () {
        resolve(subdivide(referenceSection, "byParagraph"));
        });

        indentButton.addEventListener('click', function () {
        resolve(subdivide(referenceSection, "byIndent"));
        });
    });
}


export function subdivide(selection, selectedCriterion) {
    console.log("subdivide")

    selection = window.getSelection();
    // selection.removeAllRanges(); // Clear any current selection
    // selection.addRange(GlobalRange); // Restore the saved range

    if (!selection.isCollapsed) {
        let highlightCounter = 0
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
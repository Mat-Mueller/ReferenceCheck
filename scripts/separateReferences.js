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


export function subdivide(startPoint, endPoint, selectedCriterion) {
    const range = document.createRange();
    range.setStart(startPoint, 0);  // Start at the startPoint (assuming it's a DOM node)
    range.setEnd(endPoint, endPoint.length);  // End at the endPoint (assuming it's a DOM node)

    // Make the selection in the document using the range
    const selection = window.getSelection();
    selection.removeAllRanges(); // Clear any existing selection
    selection.addRange(range);   // Apply the new selection
    if (!selection.isCollapsed) {
        let highlightCounter = 0;

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
                
                if (node.nodeName === 'DIV' && node.classList.contains('textLine') && range.intersectsNode(node)) {
                    pElements.push(node);
                }
            }

            console.log("Gefundene TextLine-Elemente:", pElements.length);

            if (selectedCriterion === 'None') {
                pElements.forEach((element) => {
                    highlightElement(element, highlightCounter);
                    highlightCounter++;
                });
                continue;
            }

            let distances = calculateDistances(pElements, selectedCriterion);
            console.log(distances)
            let indents = calculateIndents(pElements, selectedCriterion);

            const mostCommonDistance = findMostCommonDistance(distances);
            console.log(mostCommonDistance)                ///////////////////// abrunden
            const [noIndent, yesIndent] = findIndentThresholds(indents);

            let mergedContent = "";
            const yearRegex = /(?<=^|\s|\()(19[4-9]\d|20[0-2]\d|2030)(?=$|\s|\)|\.|,)/;
            let currentColor = ["#7b92ed", "#83ed7b"];
            let colorCounter = 0;

            pElements.forEach((element, j) => {
                mergedContent += " " + element.textContent.trim();
                highlightElement(element, highlightCounter, currentColor[colorCounter]);

                let shouldSeparate = false;
                if (selectedCriterion === 'byYear' && (yearRegex.test(pElements[j + 1]?.textContent) || j === pElements.length - 1)) {
                    shouldSeparate = true;
                } else if (selectedCriterion === 'byParagraph' && isDistanceLarge(pElements, j, mostCommonDistance)) {
                    shouldSeparate = true;
                } else if (selectedCriterion === 'byIndent' && isIndentNoIndent(pElements, j, noIndent)) {
                    shouldSeparate = true;
                }

                if (shouldSeparate) {
                    highlightCounter++;
                    colorCounter = (colorCounter + 1) % currentColor.length;
                }
            });

            // Hier sicherstellen, dass der letzte Abschnitt immer berücksichtigt wird
            if (pElements.length > 0) {
                highlightCounter++;  // Dies sorgt dafür, dass der letzte Abschnitt ebenfalls gezählt wird
            }
        }

        return highlightCounter;
    }
}

function highlightElement(element, id, color = '#add8e6') {
    //console.log(`Highlighting element with ID: ${id}`);
    element.setAttribute("myID", id);
    element.style.backgroundColor = color;
    element.classList.add('highlight');
}

function calculateDistances(pElements, selectedCriterion) {
    if (selectedCriterion !== 'byParagraph') return [];
    return pElements.slice(0, -1).map((el, i) => {
        const currentRect = el.getBoundingClientRect();
        const nextRect = pElements[i + 1].getBoundingClientRect();
        return Math.round((nextRect.top - currentRect.bottom) ) ;
    });
}

function calculateIndents(pElements, selectedCriterion) {
    if (selectedCriterion !== 'byIndent') return [];
    return pElements.map(el => Math.round(el.getBoundingClientRect().left * 10) / 10);
}

function findIndentThresholds(indents) {
    if (indents.length === 0) return [null, null];
    const freqMap = indents.reduce((acc, indent) => (acc[indent] = (acc[indent] || 0) + 1, acc), {});
    const sortedIndents = Object.entries(freqMap).sort((a, b) => b[1] - a[1]).map(([indent]) => parseFloat(indent));
    return sortedIndents.length >= 2 ? [Math.min(...sortedIndents), Math.max(...sortedIndents)] : [null, null];
}

function isDistanceLarge(pElements, index, mostCommonDistance) {
    const currentRect = pElements[index].getBoundingClientRect();
    const nextRect = pElements[index + 1]?.getBoundingClientRect();
    return nextRect && nextRect.top - currentRect.bottom > mostCommonDistance + 1;
}

function isIndentNoIndent(pElements, index, noIndent) {
    const nextRect = pElements[index + 1]?.getBoundingClientRect();
    return nextRect && Math.round(nextRect.left * 10) / 10 === noIndent;
}

/**
 * This function finds the most common distances, groups them into dynamic buckets
 * based on proximity to each other, and returns the maximum value from the bucket
 * with the smaller mean among the two most frequent buckets.
 */
function findMostCommonDistance(distances) {
    if (distances.length === 0) return 0;

    function calculateMean(arr) {
        const sum = arr.reduce((acc, value) => acc + value, 0);
        return sum / arr.length;
    }

    const tolerance = 2;
    const buckets = [];

    distances.forEach(distance => {
        let addedToBucket = false;

        for (let bucket of buckets) {
            const mean = calculateMean(bucket.values);
            if (Math.abs(mean - distance) <= tolerance) {
                bucket.values.push(distance);
                bucket.count++;
                addedToBucket = true;
                break;
            }
        }

        if (!addedToBucket) {
            buckets.push({ values: [distance], count: 1 });
        }
    });

    buckets.sort((a, b) => b.count - a.count);

    if (buckets.length >= 2) {
        const [bucket1, bucket2] = buckets.slice(0, 2);
        const meanBucket1 = calculateMean(bucket1.values);
        const meanBucket2 = calculateMean(bucket2.values);
        const smallerMeanBucket = meanBucket1 < meanBucket2 ? bucket1 : bucket2;
        return Math.max(...smallerMeanBucket.values);
    }

    return Math.max(...buckets[0].values);
}






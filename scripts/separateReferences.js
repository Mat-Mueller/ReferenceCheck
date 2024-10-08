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
            let indents = calculateIndents(pElements, selectedCriterion);

            const mostCommonDistance = findMostCommonDistance(distances);
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
        return Math.round((nextRect.top - currentRect.bottom) * 10) / 10;
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

function findMostCommonDistance(distances) {
    if (distances.length === 0) return 0;
    const distanceCount = distances.reduce((acc, dist) => (acc[dist] = (acc[dist] || 0) + 1, acc), {});
    const sortedDistances = Object.entries(distanceCount).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    return sortedDistances.length >= 2 ? Math.min(...sortedDistances.map(([dist]) => parseFloat(dist))) : parseFloat(sortedDistances[0][0]);
}


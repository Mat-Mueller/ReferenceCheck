import { firstFrame, secondFrame, thirdFrame } from './uiComponents.js';

export function inTextSearch(referenceCount) {
    //const scholarContainer = document.getElementById("scholar-container")

    console.log("doing intext search etc.")
    ///////// create first frame
    const scholarContainer = document.getElementById('scholar-container');
    scholarContainer.innerHTML = ''; // Clear previous content


    identifyAndWrapCitations();
    cleanCitations()

    firstFrame(referenceCount)

    secondFrame(referenceCount)

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
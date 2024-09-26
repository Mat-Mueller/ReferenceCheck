// Called by main.js, finds and highlights in-text citations

import { getMergedTextByMyId } from './crossrefSearch.js';


export function inTextSearch() {
    console.log("doing intext search etc.")


    identifyAndWrapCitations();
    cleanCitations()
    assignnames()
}


function combineHyphenatedWords(words) {  // helper function to merge text between divs if there is a "-"
    let result = []; // To store the final result
    let i = 0; // Index to iterate through the array
    
    while (i < words.length) {
      let word = words[i];
      
      // Check if the word ends with a hyphen
      if (word.endsWith("-") && i < words.length - 1) {
        // Combine with the next word, removing the hyphen
        word = word.slice(0, -1) + words[i + 1];
        i++; // Skip the next word since it's already combined
      }
      
      result.push(word); // Add the processed word to the result array
      i++; // Move to the next word
    }
    
    return result;
  }

    // Helper function to get the preceding text, possibly from a previous div

function getPreviousText(span) {
    let previousDiv = span.previousSibling;
    let textContent = '';

    // If it's a text node, extract text content
    if (previousDiv && previousDiv.nodeType === Node.TEXT_NODE) {
        textContent = previousDiv.textContent.replace("(", "").trim();
    }
    //console.log(textContent)
    // If no text content is found or node is not valid, move to the previous div with class 'textLine'
    let counter = 0
    while ( textContent.split(" ").length < 5 && counter < 10) {
        counter++

        if (!previousDiv) {
            //console.log(span.parentElement)
            previousDiv = span.parentElement
        }
        previousDiv = previousDiv.previousSibling;
        if (counter === 9) {

            console.log(span, previousDiv)
            const pageNumber = span.parentElement.id.split('-')[1]
            const allDivs = document.querySelectorAll(`div[id^="textLine-${pageNumber}-"]`);

            let highestDiv = null;
            let highestNumber = -1;
            allDivs.forEach(div => {
                // Extract the sequence number from the ID
                const idParts = div.id.split('-');
                const sequenceNumber = parseInt(idParts[2], 10); // The third part is the sequence number
            
                // Check if this sequence number is the highest we've seen
                if (sequenceNumber > highestNumber && div.className === "textLine") {
                    highestNumber = sequenceNumber;
                    highestDiv = div;
                }
            });
            previousDiv = highestDiv
            console.log(previousDiv)

        
        }

        if (previousDiv && previousDiv.tagName !== 'SPAN') {
            // If a previous div with class 'textLine' was found, extract its text content
            if (previousDiv) {
                let previousText = previousDiv.textContent.trim();
                if (previousText.endsWith("-")) {
                // Remove the trailing hyphen and concatenate without the space
                //previousText = previousText.slice(0, -1); // Removes the last character (the hyphen)
                textContent = previousText + textContent;
                } else {
                    // Concatenate with a space in between
                textContent = previousText + " " + textContent;
                }
            } else {
            console.log("No previous div with class 'textLine' found.");
            } 
        } else if (previousDiv && previousDiv.tagName === 'SPAN') {
            textContent = previousDiv.textContent.trim().replace(/[^\p{L}]/gu, '') + textContent;
        }
    }
    
    //console.log(textContent)
    return textContent.replace("(", "").replace(",", "").trim();
}


function GetallPossibleNames() {
    let referenceCount = Math.max(...Array.from(document.querySelectorAll('div.textLine.highlight[myid]')).map(div => parseInt(div.getAttribute('myid'), 10)));   //böse böse
    let AlllastNames = []
    for (let j = 0; j < referenceCount; j++) {
        //const divs = document.querySelectorAll(`[MyId="${j}"]`);
        const mergedText = getMergedTextByMyId(j);
        //assign author names to ReferenceFrameParagraph
        const cleanedText = mergedText.replace(/,\s?[A-Z]\.| [A-Z]\./g, '');
        // Step 2: Extract the part before the (year)
        let lastNames
        if (cleanedText) {
            const authorsPart = cleanedText.match(/^(.*?)(?=\d{4}[a-z]?)/)[0];
        // Step 3: Split the remaining string by commas or ampersands and extract the last names
             lastNames = authorsPart.replace(" (", "").replace(", ,", ",").replace(" (Eds.).", "").split(/,|&/).map(author => author.trim());
             lastNames = lastNames.filter(name => name !== "");
        } else {
             lastNames = [];

        }
        lastNames.forEach((name) => {AlllastNames.push(name)})
    }
    //console.log(AlllastNames)
    return AlllastNames
}


function precleaned() {
    let citationSpans = document.querySelectorAll('span.citation')
    citationSpans.forEach((span) => {
        let trimmedPart = span.textContent;  // Get the text content of the current <span>
    
        // Split the text content based on consecutive years but keep the commas/spaces intact
        let parts = trimmedPart.split(/(?<=\d{4})(\s*,?\s*)(?=\d{4})/);
    
        // Create a document fragment to hold the new spans
        let fragment = document.createDocumentFragment();
    
        // Loop through each part and create a new <span> for it
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            // Create a new <span> only for the actual year, skip comma/space parts
            if (/\d{4}/.test(part.trim())) {
                let newSpan = document.createElement('span');  // Create a new <span> element
                newSpan.classList.add('citation');             // Add the citation class
                newSpan.textContent = part.trim();             // Set the text content (trim spaces)
                fragment.appendChild(newSpan);                 // Append the new span to the fragment
            } else {
                // If part is a comma or space, add it as a text node
                fragment.appendChild(document.createTextNode(part));
            }
        }
    
        // Replace the old <span> with the new span(s)
        span.replaceWith(fragment);
    });
    

    return document.querySelectorAll('span.citation')
}

function mergeNameFragments(knownNames, guessedNames) {
    const knownNamesSet = new Set(
        knownNames
            .map(name => name.toLowerCase())
            .filter(name => name !== 'et al.') // Exclude "et al." from the set
    );    
    const mergedNames = [];
  
    for (let i = 0; i < guessedNames.length; i++) {
      let combinedName = guessedNames[i].toLowerCase();
      
      // Check if the next word forms a known name when combined with the current one
      while (i + 1 < guessedNames.length && knownNamesSet.has(combinedName + ' ' + guessedNames[i + 1].toLowerCase())) {
        combinedName += ' ' + guessedNames[++i].toLowerCase();
      }
  
      // Push the merged name (or single name) to the result
      mergedNames.push(combinedName);
    }
  
    return mergedNames;
  }

function cleanCitations() {
    // Get all span elements with the class 'citation', precleaned which means that they are split again sometimes
    let citationSpans = precleaned();

    let Allnames = GetallPossibleNames()

    // Loop through each span element
    citationSpans.forEach((span) => {

        let cleanedText = span.innerText.replace(/\(|\)/g, ''); // Remove parentheses
        let precedingText;
        // Check if the cleanedText is just a number (e.g., a year like 1966) --- narrative cit
        if (/^\d+$/.test(cleanedText)) {
            precedingText = getPreviousText(span);
            //console.log(precedingText.split(' '))
            if (precedingText) {
                let words = precedingText.replace("-", "").split(' ');
                words = mergeNameFragments(Allnames, words)
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
                    cleanedText = `${thirdLastWord ? thirdLastWord + ';' : ''}${secondLastWord};${lastWord};${cleanedText}`;
                } else {
                    // If no "and" is present, just include the last word
                    cleanedText = `${lastWord};${cleanedText}`;

                }
            }
        } else {   ///////////   if its a Parenthetical citation
            let words = cleanedText.replace(/(\d{4}[a-zA-Z]?).*/, '$1').replace(",", "").split(" ");
            words = mergeNameFragments(Allnames, words)
            let lastWord = words[words.length - 2];
            if (words.length < 5) {
                let precedingText = getPreviousText(span);
                //console.log(precedingText.split(' '))
                if (precedingText) {
                    let precedingWords = precedingText.replace("(", "").split(' ');
                    precedingWords = mergeNameFragments(Allnames, precedingWords)

                    // Prepend words from precedingText until the words array has at least 5 words
                    while (words.length < 5 && precedingWords.length > 0) {
                        words.unshift(precedingWords.pop());
                    }
                    
                    
                }
            }
            words = mergeNameFragments(Allnames, words)
            words = combineHyphenatedWords(words)
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
            //console.log(words)
            cleanedText = words.join(";")
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
    const pagePattern = /p\.\s*\d+/i;
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
            let citationParts = citationText.split(";");
            let wrappedCitations = citationParts.map((part) => {
                let trimmedPart = part.trim();
                //console.log(trimmedPart)
                // Check if this part contains a year
                //if (pagePattern.test(trimmedPart)) {
                //    return trimmedPart; // Leave page references unchanged
                //}
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

function assignnames() {
    let citationSpans = document.querySelectorAll('span.citation');
    citationSpans.forEach((span) => {
            let cleanedText = span.getAttribute('cleanedCit');
            //console.log(cleanedText)
            let authorsCit = cleanedText.replace(",", "").replace("&", "").replace(";and", "").split(';').filter(name => name !== "")//.replace(",", "");
            authorsCit.pop()
            span.setAttribute('authors', authorsCit.join(";"))
    })
}

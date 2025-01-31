// Called by main.js, finds and highlights in-text citations

import { getMergedTextByMyId } from './crossrefSearch.js';
import {MakeRefName} from './magic.js';

export function inTextSearch() {
    console.log("doing intext search etc.")
    identifyAndWrapCitations();
    cleanCitations()
    assignnames()
}

//CCE34B

export function removeOldSpans() {
document.querySelectorAll('.textLine').forEach(div => {
    // For each div with class 'textLine', iterate through each span child and replace it with its text content
    div.querySelectorAll('span').forEach(span => {
        span.replaceWith(span.textContent);
    });
});
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
        if (counter === 9) {   //// bisher haben wir keine Ids gehabt um den Previsou text zu identifizieren. Jetzt schon, dh wir sollten den Rest der Prozedur überdenken. Bis dahin gilt: never change a working code

            const pageNumber = span.parentElement.id.split('-')[1] - 1
            const allDivs = document.querySelectorAll(`div[id^="textLine-${pageNumber}-"]:not(.footnote)`);

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
    return textContent.replace("(", "").trim();     /////////////////////////////////////////////////
}


function GetallPossibleNames() {
    let referenceCount = Math.max(...Array.from(document.querySelectorAll('div.textLine.highlight[myid]')).map(div => parseInt(div.getAttribute('myid'), 10)));   //böse böse
    let AlllastNames = []
    for (let j = 0; j < referenceCount + 1; j++) {

        //const divs = document.querySelectorAll(`[MyId="${j}"]`);
        const mergedText = getMergedTextByMyId(j);
        //assign author names to ReferenceFrameParagraph
        const cleanedText = mergedText.replace(/,\s?[A-Z]\.| [A-Z]\./g, '');
        // Step 2: Extract the part before the (year)
        let lastNames = MakeRefName(cleanedText);

        let authorsPart
        const matchResult = cleanedText.match(/^(.*?)(?=\d{4}[a-z]?)/);
        console.log(cleanedText)
        if (matchResult) {
          authorsPart = matchResult[0]
          authorsPart = authorsPart.replace(/\([^)]*$-./, "");
          // Check if the match was successful
          authorsPart = authorsPart.replace(" (", "").toLowerCase().trim()
        }
        console.log(authorsPart)
        if (authorsPart) {AlllastNames.push(authorsPart.replace("-", "").replace(".", "").replace(",", "").toLowerCase())}
        lastNames.forEach((name) => {AlllastNames.push(name.toLowerCase())})
    }
    console.log(AlllastNames)
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

    guessedNames = guessedNames.map(element => element.replace(/,/g, ""));

    
    const knownNamesSet = new Set(
        knownNames
            .map(name => name.toLowerCase())
            .filter(name => name !== 'et al.') // Exclude "et al." from the set
    );    
    const mergedNames = [];
    //console.log(guessedNames)
    for (let i = 0; i < guessedNames.length; i++) {
        let combinedName = guessedNames[i].toLowerCase();     
        let y = i
        let found = false
        while (y  < guessedNames.length && !found) {

            if (!knownNamesSet.has(combinedName) && !found) {
                if (y + 1 < guessedNames.length) {combinedName += ' ' + guessedNames[y + 1].toLowerCase()}
            } else{
                found = true
                i = y           
            }
            y += 1

        }
        if (found) {
            mergedNames.push(combinedName)
        } else {
            mergedNames.push(guessedNames[i].toLowerCase())
        }


      
    }
    return mergedNames;
  }

function cleanCitations() {
    // Get all span elements with the class 'citation', precleaned which means that they are split again sometimes
    let citationSpans = precleaned();

    let Allnames = GetallPossibleNames()
    console.log(Allnames)
    // Loop through each span element
    citationSpans.forEach((span) => {

        let cleanedText = span.innerText.replace(/\(|\)/g, ''); // Remove parentheses
        
        //console.log(cleanedText)
        let precedingText;
        // Check if the cleanedText is just a number (e.g., a year like 1966) --- narrative cit
        if (/^\d+$/.test(cleanedText)) {
            precedingText = getPreviousText(span);
            
            if (precedingText) {
                let words = precedingText.replace("-", "").split(' ').filter(word => word !== '');
                while (words.length > 0 && /^[^a-zA-Z]+$/.test(words[words.length - 1])) {
                    words.pop(); // Remove the last element if it contains non-letter characters
                }
                
                words = mergeNameFragments(Allnames, words)
                let lastWord = words[words.length - 1]; // Get the word before the span
                // Check if the word before the last word is "and", "&", or "al."
                const nonWordRegex = /[.;:!"?)]$/;
                if (
                    words.length > 1 &&
                    (
                        (words[words.length - 2].toLowerCase() === 'and' && !nonWordRegex.test(words[words.length - 3]) && Allnames.includes(words[words.length - 3].replace(",", "")) ) ||
                        (words[words.length - 2].toLowerCase() === 'und' && !nonWordRegex.test(words[words.length - 3]) &&  Allnames.includes(words[words.length - 3].replace(",", "")))||
                        words[words.length - 2].toLowerCase() === '&' ||
                        words[words.length - 1].toLowerCase().replace(",", "") === 'al.'
                    )
                ) {
                    // Include both the second-to-last word and the last word

                    let secondLastWord = words[words.length - 2];
                    let thirdLastWord = words.length > 2 ? words[words.length - 3] : '';
                    let fourthLastWord = words.length > 3 ?  words[words.length - 4].replace(",", "") : '';
                    cleanedText = `${thirdLastWord ? thirdLastWord + ';' : ''}${secondLastWord};${lastWord};${cleanedText}`;
                    if (Allnames.includes(fourthLastWord)) {
                        cleanedText = `${fourthLastWord ? fourthLastWord + ';' : ''}${cleanedText}`;
                    }
                } else {
                    // If no "and" is present, just include the last word
                    cleanedText = `${lastWord};${cleanedText}`;

                }
            }
        } else {   ///////////   if its a Parenthetical citation
            let words = cleanedText.replace(/(\d{4}[a-zA-Z]?).*/, '$1').replace(",", "").split(" ");
            words = mergeNameFragments(Allnames, words)
            let lastWord = words[words.length - 2];
            if (words.length < 7) {
                let precedingText = getPreviousText(span);
                
                if (precedingText) {
                    let precedingWords = precedingText.replace("(", "").split(' ');
                    precedingWords = mergeNameFragments(Allnames, precedingWords)

                    // Prepend words from precedingText until the words array has at least 5 words
                    while (words.length < 7 && precedingWords.length > 0) {
                        words.unshift(precedingWords.pop());
                    }
                    
                    
                }
            }
            //console.log(words)
            words = mergeNameFragments(Allnames, words)
            words = combineHyphenatedWords(words)
            lastWord = words[words.length - 2]
            const nonWordRegex = /[.;:!"?)]$/;
            if (lastWord === "al." || lastWord === "al.,") {
                // Get the last three words if the last word is "al.,"
                words = words.slice(words.length - 4, words.length);
            } else if (words[words.length - 3] === "&" || (words[words.length - 3] === "and" && !nonWordRegex.test(words[words.length - 4]) ) || (words[words.length - 3] === "und" && !nonWordRegex.test(words[words.length - 4]))) {
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
        //span.setAttribute('title', cleanedText.replace(/;/g, " "));
        // Find the first 4-digit year in the cleanedText
        let yearMatch = cleanedText.match(/\b\d{4}[a-zA-Z]?\b/);
        if (yearMatch) {
            span.setAttribute('year', yearMatch[0]);
        }
    });
}


function identifyAndWrapCitations() {
    const citationPattern = /(?:18[0-9]{2}|19[0-9]{2}|20[0-9]{2}|2100)/;
  // Regex to match a four-digit year (representing the year in a citation)
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
            let authorsCit = cleanedText
                .replace(",", "")
                .replace(/[’'´`ʼ′‛‘’]s;/g, ';')
                .replace("&", "").replace(";and", "")
                .replace(";und", "")
                .split(';').filter(name => name !== "")//.replace(",", "");
            authorsCit.pop()
            span.setAttribute('authors', authorsCit.join(";"))
    })
}

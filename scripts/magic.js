import {full_name_to_abbreviation} from './Abbreviations.js'

export function BestMatch(span, referenceFrames) {
    let Myauthors = span.getAttribute("authors")
    let MyYear = span.getAttribute("year")

    referenceFrames.forEach((Ref) => {
      let Refsauth = Ref.getAttribute("authors")
      let Refsyear = Ref.getAttribute("year")

    })

    return Myauthors

}

export function MakeRefName(cleanedText, ReferenceFrameParagraph) {
    let lastNames 
    console.log(cleanedText)
    if (cleanedText) {
        // Attempt to match the authors part using a regular expression
        const matchResult = cleanedText.match(/^(.*?)(?=\d{4}[a-z]?)/);
        
        // Check if the match was successful
        if (matchResult) {
            const authorsPart = matchResult[0]; // Safely access the matched part
            console.log(authorsPart.replace(" (", ""))
            if (authorsPart.replace(" (", "") in full_name_to_abbreviation) {
              ReferenceFrameParagraph.setAttribute('Abbr', full_name_to_abbreviation[authorsPart.replace(" (", "")])
            }
            // Step 3: Split the remaining string by commas or ampersands and extract the last names
            lastNames = authorsPart
                .replace(" (hrsg.)", "")
                .replace(" (eds.).", "")
                .replace(" (", "")
                .replace(", ,", ",")
                .replace(".", "")
                //.replace("-", "")
                .split(/,|&| and /) //
                .map(author => author.trim());
    
            // Filter out any empty names
            lastNames = lastNames.filter(name => name !== "");
        } else {
            // If no match is found, set lastNames to an empty array
            lastNames = [];
        }
    } else {
        // If cleanedText is falsy, set lastNames to an empty array
        lastNames = [];
    }
    return lastNames

}


export function matching(ReferenceFrameParagraph) {
    // Loop through each span element for matching
    let citationSpans = document.querySelectorAll('span.citation');
    let authorsRef = ReferenceFrameParagraph
.getAttribute('authors')
.split(/,| and /)                     // Split by comma or 'and'
.map(author => author.trim().toLowerCase())  // Trim and convert to lowercase
.filter(author => author !== "");    // Filter out empty strings

    let RefYear = ReferenceFrameParagraph.getAttribute('year');
    let matchedSpans = [];
    //console.log(authorsRef)
    
    citationSpans.forEach((span) => {
      let authorsCit = span.getAttribute('authors').split(";").map(author => author.trim().toLowerCase());
    //   console.log(authorsRef, authorsCit)
      let SpanYear = span.getAttribute('year');
  
      function arraysAreIdentical(arr1, arr2) {
        
        // If "et" and "al." are in arr1, we only compare the first author
        const hasEtAl = arr1.includes("et") && arr1.includes("al.");
        
        if (arr2.length === 0 ) {return false}

        if (hasEtAl) {
          // Normalize both strings to avoid encoding issues
          //console.log(arr2)
          return arr1[0].normalize() === arr2[0].normalize();
        }       
        // Standard comparison when "et" and "al." are not present
        if (arr1.length !== arr2.length) {
          return false;
        }            
        // Check if all elements are the same (case-insensitive)
        return arr1.every((element, index) => element.normalize() === arr2[index].normalize());
      }
      
  
      if (arraysAreIdentical(authorsCit, authorsRef) && RefYear === SpanYear) {
        matchedSpans.push(span);
        if (!span.hasAttribute('found')) {
          span.setAttribute('found', 'true');
        } else {
          span.setAttribute('found', 'ambig')

        }
        const element = ReferenceFrameParagraph
        span.MatchedWith = element        
        span.addEventListener('click', () => {
          const parentElement = document.getElementById('ReferenceFrame'); // Select the parent element by ID
          const offsetTop = element.offsetTop - parentElement.offsetTop;
          parentElement.scrollTo({
              top: offsetTop,
              behavior: 'smooth' // Smooth scrolling
          });
        });
      }

      if ( ReferenceFrameParagraph.getAttribute('abbr') && ReferenceFrameParagraph.getAttribute('abbr').toLowerCase() === authorsCit[0].toLowerCase() && RefYear === SpanYear) {
        //console.log(ReferenceFrameParagraph.getAttribute('abbr').toLowerCase,  authorsCit[0].toLowerCase)
        matchedSpans.push(span);
        if (!span.hasAttribute('found')) {
          span.setAttribute('found', 'byAbbr');
        }
        const element = ReferenceFrameParagraph
        span.MatchedWith = element 
        span.addEventListener('click', () => {
          const parentElement = document.getElementById('ReferenceFrame'); // Select the parent element by ID
          const offsetTop = element.offsetTop - parentElement.offsetTop;
          parentElement.scrollTo({
              top: offsetTop,
              behavior: 'smooth' // Smooth scrolling
          });
        });
      }


    });

  
    return matchedSpans;
  }
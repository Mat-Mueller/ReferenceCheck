import {full_name_to_abbreviation} from './Abbreviations.js'
import {DoHighlight} from './uiComponents.js'

export function BestMatch(span, referenceFrames) {
  let Myauthors = span.getAttribute('authors').split(";").map(author => author.trim().toLowerCase());
  let MyYear = span.getAttribute("year");
  let Typobestvalue = 10000;
  let Elementbestvalue = 1;
  let bestRef;
  let elementbestRef = [];

  for (const Ref of referenceFrames) {
      let Refsauth = Ref.getAttribute('authors')
          .split(/,| and /)  // Split by comma or 'and'
          .map(author => author.trim().toLowerCase()) // Trim and convert to lowercase
          .filter(author => author !== "");  // Filter out empty strings
      let Refsyear = Ref.getAttribute("year");

      // Check for an exact match in authors
      if (arraysAreIdentical(Myauthors, Refsauth)) {
          span.setAttribute('found', 'year');
          span.MatchedWith = [Ref];

          return; // Exit the entire function if an exact match is found
      }

      // Check for typo-level match based on string difference
      let difference = compareStringArrays(Myauthors, Refsauth);
      if (difference < Typobestvalue) {
          Typobestvalue = difference;
          bestRef = Ref;
      }

      // Find the partial match with most common elements
      if (Elementbestvalue < countElementsInArray(Myauthors, Refsauth)) {
          Elementbestvalue = countElementsInArray(Myauthors, Refsauth);
          elementbestRef = [Ref];
      } else if (Elementbestvalue === countElementsInArray(Myauthors, Refsauth)) {
        elementbestRef.push(Ref);
      }
  }

  // After the loop, decide based on Typobestvalue
  if (Typobestvalue < 2) {
      span.setAttribute('found', 'typo');
      span.MatchedWith = [bestRef];
  } else {
      span.MatchedWith = elementbestRef;

  }
}



function countElementsInArray(array1, array2) {
  let count = 0;

  for (let element of array1) {
      if (array2.includes(element)) {
          count++;
      }
  }

  return count;
}

function damerauLevenshtein(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Create a matrix
    const matrix = [];

    // Initialize the matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Compute the distance
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            let cost = (str1[i - 1] === str2[j - 1]) ? 0 : 1;

            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,    // Deletion
                matrix[i][j - 1] + 1,    // Insertion
                matrix[i - 1][j - 1] + cost  // Substitution
            );

            // Transposition
            if (i > 1 && j > 1 && str1[i - 1] === str2[j - 2] && str1[i - 2] === str2[j - 1]) {
                matrix[i][j] = Math.min(
                    matrix[i][j],
                    matrix[i - 2][j - 2] + cost // Transposition
                );
            }
        }
    }

    return matrix[len1][len2];
}

function compareStringArrays(arr1, arr2) {
  //console.log(arr1)
  // Special case: if arr1 contains "et" and "al.", only compare the first elements
  if (arr1.includes("et") && arr1.includes("al.") && arr2.length > 2) {
    // Only compare the first element
    return damerauLevenshtein(arr1[0], arr2[0]);
  }

  // Regular case: Compare all elements up to the length of the shorter array
  const minLength = Math.min(arr1.length, arr2.length);
  let totalDistance = 0;

  for (let i = 0; i < minLength; i++) {
      const distance = damerauLevenshtein(arr1[i], arr2[i]);
      totalDistance += distance;
  }
  
  
  // If arr2 is longer, add the lengths of the remaining elements in arr2
  for (let i = minLength; i < arr2.length; i++) {
      totalDistance += arr2[i].length; // Treat remaining elements as entirely different
  }

  // If arr1 is longer, add the lengths of the remaining elements in arr1
  for (let i = minLength; i < arr1.length; i++) {
      totalDistance += arr1[i].length; // Treat remaining elements as entirely different
  }

  return totalDistance;
}


export function MakeRefName(cleanedText, ReferenceFrameParagraph) {
    let lastNames 
    if (cleanedText) {
        // Attempt to match the authors part using a regular expression
        const matchResult = cleanedText.match(/^(.*?)(?=\d{4}[a-z]?)/);
        if (matchResult) {
          let authorsPart = matchResult[0]
          authorsPart = authorsPart.replace(/\([^)]*$/, "");
          // Check if the match was successful
          authorsPart = authorsPart.replace(" (", "").toLowerCase().trim()
             // Safely access the matched part
            if (ReferenceFrameParagraph && authorsPart in full_name_to_abbreviation) {
              ReferenceFrameParagraph.setAttribute('Abbr', full_name_to_abbreviation[authorsPart.replace(" (", "").toLowerCase().trim()])
            }
            // Step 3: Split the remaining string by commas or ampersands and extract the last names
            lastNames = authorsPart
                .replace(" (hrsg.)", "")
                .replace(" (eds.)", "")
                .replace(" (ed.)", "")
                .replace(" (eds.).", "")
                .replace(" (", "")
                .replace(", ,", ",")
                .replace(".", "")
                //.replace("-", "")
                .split(/,|&| and | und /) //
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


function arraysAreIdentical(arr1, arr2) {
        
  // If "et" and "al." are in arr1, we only compare the first author
  const hasEtAl = arr1.includes("et") && arr1.includes("al.") && arr2.length > 2;
  
  arr1 = arr1.map(element => element.replace(/[^a-zA-Z]/g, "").normalize());
  arr2 = arr2.map(element => element.replace(/[^a-zA-Z]/g, "").normalize());
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
      if (arraysAreIdentical(authorsCit, authorsRef) && RefYear === SpanYear) {

        if (!span.hasAttribute('found')) {
          span.setAttribute('found', 'true');
          span.MatchedWith = [ReferenceFrameParagraph]
        } else {
          span.setAttribute('found', 'ambig')
          span.MatchedWith.push(ReferenceFrameParagraph)
        }
        if (!ReferenceFrameParagraph.MatchedWith) {
          ReferenceFrameParagraph.MatchedWith = [span]
        } else {
          ReferenceFrameParagraph.MatchedWith.push(span)
         }
      }

      if ( ReferenceFrameParagraph.getAttribute('abbr') && ReferenceFrameParagraph.getAttribute('abbr').toLowerCase() === authorsCit[0].toLowerCase() && RefYear === SpanYear) {
        //console.log(ReferenceFrameParagraph.getAttribute('abbr').toLowerCase,  authorsCit[0].toLowerCase)
        if (!span.hasAttribute('found')) {
          span.setAttribute('found', 'byAbbr');
          span.MatchedWith = [ReferenceFrameParagraph]
        } else {
          span.setAttribute('found', 'ambig')
          span.MatchedWith.push(ReferenceFrameParagraph)
        }
        if (!ReferenceFrameParagraph.MatchedWith) {
          ReferenceFrameParagraph.MatchedWith = [span]
        } else {
          ReferenceFrameParagraph.MatchedWith.push(span)
         }

      }


    });

  
    //return matchedSpans;
  }

  export function CreateCrossLinksHighlight() {
   

    const AllReferences = document.querySelectorAll("span.citation, div.InTexts");

    AllReferences.forEach(element => {
      if (element.MatchedWith) {
        MakeListeners(element);
      }
    });
 /*
    select all element of class 


    All spans

    All Intexts
*/

  }


  function MakeListeners(element) {

    if (!element.MatchedWith || element.MatchedWith.length === 0) {
      element.addEventListener('click', () => {
      if (element.ParentSpan) {
        element.ParentSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
        DoHighlight(element.ParentSpan);
  
      } else if (element.ChildIntext) {
        element.ChildIntext.scrollIntoView({ behavior: 'smooth', block: 'center' });
        DoHighlight(element.ChildIntext);
      }
      });

    } else {

    let currentIndex = 0; // Initialize the index to keep track of the current hit

    element.addEventListener('click', () => {
        // Scroll to the current matched element and highlight it
        const matchedItem = element.MatchedWith[currentIndex];
        matchedItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        DoHighlight(matchedItem);

        // Update the index to the next item, looping back to 0 if at the end
        currentIndex = (currentIndex + 1) % element.MatchedWith.length;
        if (element.ParentSpan) {
          element.ParentSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
          DoHighlight(element.ParentSpan);
    
        } else if (element.ChildIntext) {
          element.ChildIntext.scrollIntoView({ behavior: 'smooth', block: 'center' });
          DoHighlight(element.ChildIntext);
        }
    });

  }
}



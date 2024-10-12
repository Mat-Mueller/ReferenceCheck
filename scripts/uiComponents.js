import { getMergedTextByMyId, checkExists } from './crossrefSearch.js';



export function clearRightContainer() {
    const scholarContainer = document.getElementById('scholar-container');
    scholarContainer.innerHTML = ''; // Clear previous content
}

export function displaySoftwareDescription() {
    const scholarContainer = document.getElementById('scholar-container');

    // Function for loading external html file
    function loadHTML(url, container) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(htmlContent => {
                container.innerHTML = htmlContent;
            })
            .catch(error => {
                console.error('Error loading HTML:', error);
            });
    }

    // Load software description from external html
    loadHTML('software_description.html', scholarContainer);
}

export function createMenue () {
    document.getElementById('menu-icon').addEventListener('click', function() {
        const menu = document.getElementById('menu');
        menu.classList.toggle('active'); // Toggle the 'active' class to show/hide the menu
    });
}


export function referenceSectionGUI(referenceFound) {
    // Clear previous analysis results or messages
    const scholarContainer = document.getElementById("scholar-container");

    if (referenceFound) {
        // Create a frame for the success message
        const TextFrame = document.createElement('div');
        TextFrame.className = 'search-string-frame';
        TextFrame.style.marginBottom = '20px'; // Add bigger space between the message and the following content

        // Create paragraph for the reference section found message
        const TextFrameParagraph = document.createElement('p');
        TextFrameParagraph.innerHTML = 'Reference section found and highlighted!';

        // Add the paragraph to the text frame
        TextFrame.appendChild(TextFrameParagraph);

        // Create Continue/Set Manually buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '10px'; // Add space above the buttons

        const buttonStyle = 'background-color: white; color: black; width: 100px;border-radius: 5px; padding: 10px; cursor: pointer;'; // Shared style for both buttons

        const continueButton = document.createElement('button');
        continueButton.id = 'continue-button';
        continueButton.innerText = 'Continue';
        continueButton.style.cssText = buttonStyle + 'margin-right: 10px;'; // Add some spacing between buttons
        buttonContainer.appendChild(continueButton);

        const setManuallyButton = document.createElement('button');
        setManuallyButton.id = 'manual-button';
        setManuallyButton.innerText = 'Set manually';
        setManuallyButton.style.cssText = buttonStyle; // Apply the same style
        buttonContainer.appendChild(setManuallyButton);
        // Append buttons to the features frame
        TextFrame.appendChild(buttonContainer);
        scholarContainer.appendChild(TextFrame);
    } else {
        // If reference section was not found, show the "not found" message and allow manual selection
        console.log("now manual");

        scholarContainer.innerHTML = '';
        const TextFrame = document.createElement('div');
        TextFrame.className = 'search-string-frame';
        TextFrame.style.marginBottom = '20px'; // Add bigger space between the message and the following content

        // Create paragraph for the reference section found message
        const TextFrameParagraph = document.createElement('p');
        TextFrameParagraph.innerHTML = 'Reference section not found!<br>Please select the start and end of the reference section manually.';
        TextFrame.appendChild(TextFrameParagraph);

        scholarContainer.appendChild(TextFrame);
    }
}


export function referenceSeparationGUI(paragraphCount, indentCount) {
    const scholarContainer = document.getElementById("scholar-container");
    const TextFrame = document.createElement('div');
    TextFrame.className = 'search-string-frame';
    TextFrame.style.marginBottom = '20px'; // Add bigger space between the message and the following content

    // Create paragraph for the reference section found message
    const TextFrameParagraph = document.createElement('p');
    TextFrameParagraph.innerHTML = 'Which separation mode should I use?';
    TextFrame.appendChild(TextFrameParagraph);

    // Create a container for the buttons to ensure they appear below the message
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px'; // Add space above the buttons

    // Shared button style
    const buttonStyle = 'background-color: white; color: black; border: 1px solid black; width: 200px; padding: 10px; cursor: pointer ;border-radius: 5px;';

    // Create and append the "By paragraph" button
    const paragraphButton = document.createElement('button');
    paragraphButton.id = 'paragraph-button';
    paragraphButton.innerText = `By paragraph (${paragraphCount} references found)`;
    paragraphButton.style.cssText = buttonStyle + 'margin-right: 10px;'; // Add spacing between buttons
    buttonContainer.appendChild(paragraphButton);

    // Create and append the "By indent" button
    const indentButton = document.createElement('button');
    indentButton.id = 'indent-button';
    indentButton.innerText = `By indent (${indentCount} references found)`;
    indentButton.style.cssText = buttonStyle; // Apply same style as paragraphButton
    buttonContainer.appendChild(indentButton);

    // Append buttonContainer to the desired DOM element
    TextFrame.appendChild(buttonContainer);
    scholarContainer.appendChild(TextFrame);
}


export function firstFrame(referenceCount) {
    // First Frame for "Bla bla"
    const scholarContainer = document.getElementById('scholar-container');
    const TextFrame = document.createElement('div');
    TextFrame.className = 'search-string-frame';
    const TextFrameParagraph = document.createElement('p');
    TextFrameParagraph.innerHTML = `Found ${referenceCount} References and ${document.querySelectorAll('span.citation').length} in-text citations.`;
    TextFrame.appendChild(TextFrameParagraph);
    scholarContainer.appendChild(TextFrame);
}


function makeLinksClickable(text) {
    // Regular expression to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
}


function createSeparator(referenceCount) {
    for (let j = 0; j < referenceCount; j++) {
        const divs = document.querySelectorAll(`[MyId="${j}"]`);

        // Alternate the background color based on the value of j
        const backgroundColor = (j % 2 === 0) ? getComputedStyle(document.documentElement).getPropertyValue('--Referencelist1-color').trim() : getComputedStyle(document.documentElement).getPropertyValue('--Referencelist2-color').trim();  // Light grey for even j, darker grey for odd j

        divs.forEach((div) => {
            // Set the same background color for all divs with the same j
            div.style.backgroundColor = backgroundColor;
        });
    }
    const selection = window.getSelection();
selection.removeAllRanges();  // Clears the selection

}


export async function searchResultGUI(searchResults, ReferenceFrameParagraph) {
    // If search data is available, process it and show results
    ReferenceFrameParagraph.removeChild(ReferenceFrameParagraph.lastChild)
    console.log(ReferenceFrameParagraph)

    if (searchResults.length > 0 ) {
        const resultsDiv = document.createElement('div'); // Create a div to contain results
        resultsDiv.className = 'crossref-results';
        resultsDiv.style.marginTop = '5px'; // Add margin above results


        // Show the first (best) result
        const firstResult = searchResults[0];
        appendResultToDiv(firstResult, resultsDiv);

        // Append the resultsDiv to the ReferenceFrameParagraph
        ReferenceFrameParagraph.appendChild(resultsDiv);

        // If there are more results, create a "Load more results" button
        /*
        if (searchResults.length > 1) {
            const loadMoreButton = document.createElement('button');
            loadMoreButton.textContent = 'Load more results';
            loadMoreButton.style.display = 'block';
            loadMoreButton.style.marginTop = '10px';
            loadMoreButton.style.cursor = 'pointer';

            // Append the button after the first result
            ReferenceFrameParagraph.appendChild(loadMoreButton);

            let resultsLoaded = 1; // Track how many results have been loaded

            // Event listener for the "Load more results" button
            loadMoreButton.addEventListener('click', () => {
                // Load the next result
                if (resultsLoaded < searchResults.length) {
                    const nextResult = searchResults[resultsLoaded];
                    appendResultToDiv(nextResult, resultsDiv);
                    resultsLoaded++; // Increment the number of loaded results

                    // Hide the button if all results have been loaded
                    if (resultsLoaded === searchResults.length) {
                        loadMoreButton.style.display = 'none'; // Hide the button
                    }
                }
            });
        }*/

    } else {
        const noResultsMsg = document.createElement('p');
        noResultsMsg.textContent = 'No CrossRef results found.';
        ReferenceFrameParagraph.appendChild(noResultsMsg);
    }
}

// Helper function to append a single result to the resultsDiv
function appendResultToDiv(item, resultsDiv) {
    if (item.title && item.URL) {
        const resultFrame = document.createElement('div');
        resultFrame.className = 'result-frame';

        // Create a single paragraph element for the result
        const resultParagraph = document.createElement('p');
        resultParagraph.style.fontSize = '16px';
        resultParagraph.style.margin = '0px';
        resultParagraph.style.backgroundColor = "#FFFFFF";

        resultParagraph.innerHTML = `
        ${item.formattedAuthors}.
        (${item.yearString}).
        <strong>${item.title[0]}</strong>.
        ${item['container-title'] ? item['container-title'][0] : 'Unknown Journal'}.
        DOI: <a href="${item.URL}" target="_blank">${item.DOI}</a>`;

        resultFrame.appendChild(resultParagraph);
        resultFrame.style.marginBottom = '10px';
        resultFrame.style.backgroundColor = `hsl(${(item.matchPercentage / 100) * 120}, 100%, 50%)`;

        // Append the result frame to the resultsDiv
        resultsDiv.appendChild(resultFrame);
    }
}




    function matching(ReferenceFrameParagraph) {
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
              console.log(arr2)
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
            }
            span.addEventListener('click', () => {
              const element = ReferenceFrameParagraph
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
              span.setAttribute('found', 'true');
            }
            span.addEventListener('click', () => {
                            const element = ReferenceFrameParagraph
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
      



      function ShowLinks(SingleRef, ReferenceFrameParagraph) {
       
        const matchedSpans = [...new Set(SingleRef.myLinks)];
        const matchCount = matchedSpans.length;
        SingleRef.innerHTML = `<b>${matchCount}</b> ${matchCount === 1 ? 'instance' : 'instances'} in the document:`;
        SingleRef.style.marginBottom = '5px'; // Add space as needed
        matchedSpans.forEach((span, index) => {
            //console.log(span);

            // Create a link for each match
            const link = document.createElement('a');
            link.textContent = `${index + 1}`; // Display 1, 2, 3, etc.
            link.href = "#"; // Dummy href to make it clickable

            // Add an event listener to scroll to the span element when clicked
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent the default anchor behavior
                span.scrollIntoView({ behavior: 'smooth' }); // Scroll to the matched span
            });

            // Append the link to the paragraph without using innerHTML
            SingleRef.appendChild(link);

            // Add a comma and space after the link, except for the last one
            if (index < matchedSpans.length - 1) {
                SingleRef.appendChild(document.createTextNode(', ')); // Add a comma and space
            }
        });

        if (matchCount === 0) {
            if (ReferenceFrameParagraph){
                
                ReferenceFrameParagraph.style.border = `2px solid ${getComputedStyle(document.documentElement).getPropertyValue('--accent-color')}`;

            } else {
                SingleRef.parentElement.style.border = `2px solid ${getComputedStyle(document.documentElement).getPropertyValue('--accent-color')}`;

            }
                //divs.forEach(div => {
                //div.style.color = 'red';
            //});
        } else {
            if (ReferenceFrameParagraph){
                
                ReferenceFrameParagraph.style.border = ""//getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
            } else {
                SingleRef.parentElement.style.border = ""//getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

            }

        }

      }

export function secondFrame(referenceCount) {


    createSeparator(referenceCount)   // @LF: that should probably moved somewhere else 
    
    const scholarContainer = document.getElementById('scholar-container');
    // Second frame for references (collapsible frame)
    const OuterFrame = document.createElement('div');
    OuterFrame.className = "OuterFrame"
    const ReferenceFrame = document.createElement('div');
    ReferenceFrame.id = "ReferenceFrame"
    ReferenceFrame.className = 'search-string-frame collapsible-frame'; // Assign collapsible class
    ReferenceFrame.setAttribute('style', 'border: 0px solid #ccc !important; box-shadow: none !important;');

    
    // Create and add headline for references
    const referenceHeadline = document.createElement('div');
    referenceHeadline.id = "referenceHeadline"
    const Refspinner = document.createElement('div')
    Refspinner.id = "loading-spinner" 
    Refspinner.className  = "spinner"
    referenceHeadline.appendChild(Refspinner)
    const referenceTitle = document.createElement('p');
    referenceTitle.id = "References"
    referenceTitle.style.margin = "0px"

    referenceHeadline.appendChild(referenceTitle)
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'searchField';
    searchInput.placeholder = 'Search...';
    //searchInput.style.marginLeft = '50px';
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {  // Check if the Enter key was pressed
            searchRef(event);      // Call the search function and pass the event
        }
        })
        referenceHeadline.appendChild(searchInput)
    // Create a container div to hold the buttons side by side
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'inline-block'; // Ensure buttons are on the same line

    // Create the toggle button for expanding/collapsing
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '▲'; // ▼
    toggleButton.className = 'toggle-in-text-button';
    toggleButton.style.display = "none";


    toggleButton.addEventListener('click', () => {
        // Toggle the max-height between 100px and the full height of the content (to show/hide the reference frame)
        if (toggleButton.textContent === '▲') {
            toggleButton.textContent = '▼';
        } else {
            toggleButton.textContent = '▲'
        }
        if (ReferenceFrame.style.maxHeight === '600px') {
            ReferenceFrame.style.maxHeight = ReferenceFrame.scrollHeight + 'px'; // Expand to content height
        } else {
            ReferenceFrame.style.maxHeight = '600px'; // Collapse back to minimum height
        }
    });

    // Append the toggle button to the button container
    buttonContainer.appendChild(toggleButton);

 
    referenceHeadline.appendChild(buttonContainer);
    referenceHeadline.appendChild(toggleButton);

    OuterFrame.appendChild(referenceHeadline);



    for (let j = 0; j < referenceCount; j++) {
        const divs = document.querySelectorAll(`[MyId="${j}"]`);
        const mergedText = getMergedTextByMyId(j);

        var MyYear = mergedText.match(/\b\d{4}[a-zA-Z]?\b/)
        if (MyYear) {
            MyYear = MyYear[0]
        }


        const ReferenceFrameParagraph = document.createElement('div');

        //assign author names to ReferenceFrameParagraph
        const cleanedText = mergedText.replace(/,\s?[A-Z]\.| [A-Z]\./g, '').toLowerCase();
        // Step 2: Extract the part before the (year)
        let lastNames;
        if (cleanedText) {
            // Attempt to match the authors part using a regular expression
            const matchResult = cleanedText.match(/^(.*?)(?=\d{4}[a-z]?)/);
        
            // Check if the match was successful
            if (matchResult) {
                const authorsPart = matchResult[0]; // Safely access the matched part
                
                // Step 3: Split the remaining string by commas or ampersands and extract the last names
                lastNames = authorsPart
                    .replace(" (hrsg.)", "")
                    .replace(" (eds.).", "")
                    .replace(" (", "")
                    .replace(", ,", ",")
                    .replace(".", "")
                    .split(/,|&/)
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
        
        ReferenceFrameParagraph.className = "ReferenceFrameParagraph"
        ReferenceFrameParagraph.setAttribute('authors', lastNames)
        ReferenceFrameParagraph.setAttribute('year', MyYear)
        ReferenceFrameParagraph.id = j;
                // check if there is an abbreviation
                const matchResult = mergedText.match(/^(.*?)(?=\d{4}[a-z]?)/);

let result;
if (matchResult) {
    result = matchResult[0]; // Safely access the matched part
} else {
    result = ""; // Or handle it accordingly if no match is found
}


                const match = result.match(/\(([^)]+)\)/);

                if (match) {
                    ReferenceFrameParagraph.setAttribute('Abbr', match[1]); // Outputs: "example text"
                    console.log(match[1])
                } else {ReferenceFrameParagraph.setAttribute('Abbr', "");}
        ReferenceFrameParagraph.className = 'Reference-frame';

        divs.forEach ((div) => {
            div.style.cursor = 'pointer'
            div.addEventListener('click', () => {   
                    ReferenceFrameParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });    
            });
        })

        const matchedSpans = matching(ReferenceFrameParagraph)
    
        // Create first paragraph with inline style
        var SingleRef = document.createElement('p');
        const clickableText = makeLinksClickable(mergedText);
        SingleRef.style.margin = "0px"

        SingleRef.innerHTML = clickableText;
        //SingleRef.innerHTML = mergedText;
        SingleRef.style.marginBottom = '15px'; // Add some space below
        SingleRef.style.marginRight = "60px";
        ReferenceFrameParagraph.appendChild(SingleRef);

        // Create second paragraph with inline style
        SingleRef = document.createElement('p');
        SingleRef.classList.add('SingleRef');
        SingleRef.myLinks = matchedSpans
        ShowLinks(SingleRef, ReferenceFrameParagraph)
        //SingleRef.innerHTML += ''
        const textNode = document.createTextNode(". Best Crossref match:");
SingleRef.appendChild(textNode);
        ReferenceFrameParagraph.appendChild(SingleRef)
        // Add the CrossRef search button
        const buttoncontainer = document.createElement('div');
        buttoncontainer.className = "buttoncontainer"
        ReferenceFrameParagraph.appendChild(buttoncontainer)



        //create empty results
        // Add a heading for the best match
        const bestMatchHeading = document.createElement('p');
        bestMatchHeading.innerHTML = '<strong>Best Crossref match:</strong>';
        //bestMatchHeading.style.fontSize = '18px';
        bestMatchHeading.style.marginBottom = '10px';
        //ReferenceFrameParagraph.appendChild(bestMatchHeading);
        
        
        const resultFrame = document.createElement('div');
        resultFrame.className = 'result-frame';

        // Create a single paragraph element for the result
        const resultParagraph = document.createElement('p');
        resultParagraph.style.fontSize = '16px';
        resultParagraph.style.margin = '0px';
        resultParagraph.style.backgroundColor = "#FFFFFF";
        //resultParagraph.style.height = "20px"


        
        const Refspinner = document.createElement('div')
        Refspinner.className  = "spinner"
        Refspinner.style.display = "block"
        resultParagraph.appendChild(Refspinner)

        resultFrame.appendChild(resultParagraph);
        resultFrame.style.marginBottom = '10px';

        // Append the result frame to the resultsDiv
        ReferenceFrameParagraph.appendChild(resultFrame);

        /*
        const crossRefButton = document.createElement('button');
        crossRefButton.textContent = 'CR';
        crossRefButton.className = 'crossref-search-button';
        crossRefButton.id = `crossref-button-${j}`
        crossRefButton.RP = ReferenceFrameParagraph
        crossRefButton.addEventListener('click', async () => {
            const textReference = getMergedTextByMyId(j);
            const searchResults = await checkExists(textReference);
            searchResultGUI(searchResults, crossRefButton, ReferenceFrameParagraph);
        });
        buttoncontainer.appendChild(crossRefButton);
        */
        // make a scholar button
        const ScholarRefButton = document.createElement('button');
        ScholarRefButton.textContent = 'GS';
        ScholarRefButton.className = 'Scholar-search-button';
        ScholarRefButton.id = `Scholar-button-${j}`
        ScholarRefButton.addEventListener('click', async () => {           
                let baseUrl = "https://scholar.google.com/scholar?q=";
                let formattedQuery = encodeURIComponent(mergedText);  // Encodes the search string for URL
                let fullUrl = baseUrl + formattedQuery;
                window.open(fullUrl, '_blank');  // Opens the URL in a new tab or window
        })
        buttoncontainer.appendChild(ScholarRefButton);
        ;
        // If no matches were found, highlight in red

        // Append the ReferenceFrameParagraph to the main ReferenceFrame
        ReferenceFrame.appendChild(ReferenceFrameParagraph);
    }
    // Append the ReferenceFrame to the scholar container
    OuterFrame.appendChild(ReferenceFrame);
    scholarContainer.appendChild(OuterFrame);


     // sollten wir eventuell verschieben
    //document.querySelector('.ReferenceFrameParagraph[id="0"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });


}

let currentMatchIndex = -1; // To keep track of the current match

function searchRef() {
    // Get the search term from the input field
    const searchTerm = event.target.value.toLowerCase();
    
    // Find the element by its content or ID
    const referenceFrames = Array.from(document.querySelectorAll('.Reference-frame'));
    
    // Filter the elements that match the search term
    const matchingElements = referenceFrames.filter((element) =>
        element.textContent.toLowerCase().includes(searchTerm) || element.id.toLowerCase() === searchTerm
    );
    
    if (matchingElements.length === 0) {
        console.log('No matches found.');
        return; // No matches, exit function
    }
    
    // Increment index and loop around if necessary
    currentMatchIndex = (currentMatchIndex + 1) % matchingElements.length;
    
    // Scroll to the next match
    const element = matchingElements[currentMatchIndex];    
    const parentElement = document.getElementById('ReferenceFrame'); // Select the parent element by ID
    // Calculate the position of the target element relative to the parent
    const offsetTop = element.offsetTop - parentElement.offsetTop;

    // Scroll the parent element to the calculated top position
    parentElement.scrollTo({
        top: offsetTop,
        behavior: 'smooth' // Smooth scrolling
    });
    //element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /*
    document.getElementById('scholar-container').scrollTo({
        //top: 0,
        behavior: 'smooth'
    });
    */
    const ElementColor = element.style.backgroundColor;

    // Optional: highlight the element to visually indicate the match
    element.style.backgroundColor = 'yellow';
    
    // Remove highlight after some time (optional)
    setTimeout(() => {
        element.style.backgroundColor = ElementColor;
    }, 200);
}

export function searchSpanRef() {

    const searchTerm = event.target.value.toLowerCase();
    const texts = Array.from(document.querySelectorAll('.textLine, .highlight'));    
    // Filter the elements that match the search term
    const matchingElements = texts.filter((element) =>
        element.textContent.toLowerCase().includes(searchTerm) || element.id.toLowerCase() === searchTerm
    );
    
    if (matchingElements.length === 0) {
        console.log('No matches found.');
        return; // No matches, exit function
    }
    
    // Increment index and loop around if necessary
    currentMatchIndex = (currentMatchIndex + 1) % matchingElements.length;
    
    // Scroll to the next match
    const element = matchingElements[currentMatchIndex];    
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
   

    const ElementColor = element.style.backgroundColor;

    // Optional: highlight the element to visually indicate the match
    element.style.backgroundColor = 'yellow';
    
    // Remove highlight after some time (optional)
    setTimeout(() => {
        element.style.backgroundColor = ElementColor;
    }, 200);

}


function UpdateFrames() {


    // Get the accent color from the CSS variable
    const accentColor = "rgb(227, 87, 75)" // or use getComputedStyle...

    // Select all elements with class '.Reference-frame'
    const referenceFrames = document.querySelectorAll('.Reference-frame');
    
    // Count how many reference frames match the accent color
    let countWithoutMatch = 0;
    const unmatchedReferences = [];

    referenceFrames.forEach(reference => {
        // Get the computed border color of the reference frame
        const referenceBorderColor = getComputedStyle(reference).getPropertyValue('border-color').trim();
        // If the border color matches the accent color, increment the counter
        if (referenceBorderColor === accentColor) {
            countWithoutMatch++;
            unmatchedReferences.push(reference); // Store unmatched references
        }
    });

    // Find the TextFrameParagraph where the new text needs to be added
    const TextFrameParagraph = document.getElementById('References');
    
// Append the text to the existing paragraph
if (TextFrameParagraph) {
    // Clear previous content
    TextFrameParagraph.innerHTML = '';

    // Create a wrapper for all the bold text
    const boldWrapper = document.createElement('b');

    // Create the total references part (non-clickable)
    const totalReferencesElement = document.createElement('span');
    totalReferencesElement.textContent = `${referenceFrames.length} References `;
    boldWrapper.appendChild(totalReferencesElement);

    // Create the clickable 'countWithoutMatch' element
    const countWithoutMatchElement = document.createElement('span');
    countWithoutMatchElement.innerHTML = `${countWithoutMatch}`;
    countWithoutMatchElement.style.cursor = 'pointer'; // Make it clickable
    countWithoutMatchElement.style.textDecoration = 'underline'; // Underline the clickable number

    // Create the text around the clickable number
    const withoutMatchText = document.createTextNode(` without match`);

    // Append the elements inside the bold wrapper
    boldWrapper.appendChild(document.createTextNode("("));
    boldWrapper.appendChild(countWithoutMatchElement);
    boldWrapper.appendChild(withoutMatchText);
    boldWrapper.appendChild(document.createTextNode(")"));

    // Append the bold wrapper to the TextFrameParagraph
    TextFrameParagraph.appendChild(boldWrapper);

    // Initialize a counter to track clicks
    let unmatchedClickCount = 0;

    // Add click event listener to the 'countWithoutMatchElement'
    countWithoutMatchElement.addEventListener('click', () => {
        // Scroll through unmatched references
        if (unmatchedReferences.length > 0) {
            /*
            unmatchedReferences[unmatchedClickCount % unmatchedReferences.length].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            */
            const element = unmatchedReferences[unmatchedClickCount % unmatchedReferences.length]  
            const parentElement = document.getElementById('ReferenceFrame'); // Select the parent element by ID
            const offsetTop = element.offsetTop - parentElement.offsetTop;
            parentElement.scrollTo({
                top: offsetTop,
                behavior: 'smooth' // Smooth scrolling
            });

            unmatchedClickCount++; // Cycle to the next unmatched reference on each click
        }
    });
}


    const ThirdFrameHead = document.getElementById('ThirdFrameHead');
    // Append the text to the existing paragraph
    if (ThirdFrameHead) {
        const totalCitations = document.querySelectorAll('span.citation').length;
        const matchedCitations = document.querySelectorAll('span.citation[found="true"]').length;
        
        ThirdFrameHead.innerHTML = `<b>Found ${totalCitations} in-text citations with ` + 
        `${totalCitations - matchedCitations} in-text citation${totalCitations - matchedCitations === 1 ? '' : 's'} without match</b>`;
    }
    
}




export function DragDrop() {
    let dragStartTime = 0;
    let draggedElement = null; // Keep track of the dragged element

    // Select all draggable span elements with class "citation"
    const draggables = document.querySelectorAll('span.citation, .InTexts');
    
    // Select all drop zones with class "Reference-frame"
    const dropZones = document.querySelectorAll('.Reference-frame');

    // Get CSS variable values for secondary and accent colors
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

    // Make elements draggable and add event listeners
    draggables.forEach(draggable => {
        draggable.setAttribute('draggable', 'true');
        draggable.style.cursor = 'pointer'
        // Drag start event
        draggable.addEventListener('dragstart', (e) => {
            dragStartTime = new Date().getTime(); // Track drag start time
            draggedElement = draggable; // Keep reference to the dragged element
            e.dataTransfer.setData('text/plain', ''); // Some browsers require data to be set
        });

        // Click event listener (for valid drops)
        draggable.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            if (currentTime - dragStartTime > 200) {
                console.log(`Clicked on ${draggable.innerText}`);
            }
        });
    });

    // Set up drag events for each drop zone
    dropZones.forEach((dropZone) => { 
        // Drag over event (necessary to allow dropping)
        dropZone.style.cursor = 'pointer'
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('hover');
        });

        // Drag leave event (removes hover state when dragging leaves the zone)
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('hover');
        });

        // Drop event (handles the actual drop)
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('hover');

            // If the drop zone is a valid "Reference-frame" element
            if (dropZone.classList.contains('Reference-frame')) {
                let draggedElementToUse = draggedElement; // Initialize to use the original draggedElement
                const draggableSpans = document.querySelectorAll('span.citation');
                // Check if draggedElement is of class 'InTexts'
                if (draggedElement.classList.contains('InTexts')) {
                    // Loop through all 'span.citation' elements to find the corresponding one
                    
                    
                    draggableSpans.forEach((dragged) => {
                        console.log(dragged.title.trim(),draggedElement.innerHTML.trim())
                        // Check if the 'title' of the 'span' matches the 'innerHTML' of the InTexts element
                        if (decodeHTMLEntities(dragged.title.trim()) === decodeHTMLEntities(draggedElement.innerHTML.trim())) {
                            draggedElementToUse = dragged; // Use the matching span as the new draggedElement
                            console.log(draggedElementToUse)
                            return; // Exit the loop after finding the first match
                        }
                    });
                }
            
                // Now that we have the correct draggedElement (either the original or the matching span)
                let ListSimilar = [];
                
                // Find similar draggable elements
                draggableSpans.forEach((dragged) => {
                    if (dragged.title.trim() === draggedElementToUse.title.trim()) {
                        ListSimilar.push(dragged);
                    }
                });
                
                // Perform actions for each similar dragged element
                ListSimilar.forEach((dragged) => {
                    MatchDragged(dragged, dropZone);
                });
            }
            
            
            else {  /////////////////////////////////////////////////////////////////// not working as the other dom elements cant be dropzones
            }           
            UpdateFrames()
        });
    });


    function decodeHTMLEntities(text) {
        const parser = new DOMParser();
        const decodedString = parser.parseFromString(text, 'text/html').body.textContent;
        return decodedString;
    }
    
    function MatchDragged(draggedElement, dropZone) {
                // 1. Set the background color to secondary color
                draggedElement.style.backgroundColor = secondaryColor;
                
                // Mark the draggedElement as found
                if (!draggedElement.hasAttribute('found')) {
                    draggedElement.setAttribute('found', 'true');
                }
            
                // 2. Add event listener to scroll to the drop zone (Reference-frame)

                const element = dropZone
                const parentElement = document.getElementById('ReferenceFrame'); // Select the parent element by ID
                const offsetTop = element.offsetTop - parentElement.offsetTop;
                parentElement.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth' // Smooth scrolling
                });
            
                // 3. Append a link to the drop zone
                let currentLinks = dropZone.querySelector('.SingleRef').myLinks;
                removeLinksRelatedToSpan(draggedElement);
                currentLinks.push(draggedElement);
            
                console.log(currentLinks);
                ShowLinks(dropZone.querySelector('.SingleRef'));
            
                // 4. Go through all .InTexts elements and delete the one that matches the dragged element
                const inTextElements = document.querySelectorAll('.InTexts'); // Select all elements with the class '.InTexts'
            
                inTextElements.forEach(inText => {
                    // Check if the innerHTML of the .InTexts element matches the title of the draggedElement
                    if (decodeHTMLEntities(inText.innerHTML.trim()) === decodeHTMLEntities(draggedElement.getAttribute('title').trim())) {
                        // Remove the matching element
                        inText.remove();
                    }
                });        

    }

    // Helper function to remove links related to a specific span in all drop zones
    function removeLinksRelatedToSpan(span) {
        dropZones.forEach((dropZone) => {
            // Get the SingleRef element within the dropZone
            const singleRef = dropZone.querySelector('.SingleRef');
    
            // Check if SingleRef exists and has the myLinks array
            if (singleRef && singleRef.myLinks) {
                // Find the index of the span in the myLinks array
                const index = singleRef.myLinks.indexOf(span);
                
                // If span is in myLinks (index >= 0), remove it
                if (index > -1) {
                    // Remove the span from myLinks array
                    singleRef.myLinks.splice(index, 1);
    
                    // Update the links in the UI by calling ShowLinks
                    ShowLinks(singleRef);
                }
            }
        });
    }
    
}




export function thirdFrame() {
    const scholarContainer = document.getElementById('scholar-container');

    // Create the third frame for in-text citations (collapsible frame)
    const InTextCitFrame = document.createElement('div');
    InTextCitFrame.id = "InTextCitFrame";
    InTextCitFrame.className = 'search-string-frame'; // Assign collapsible class
    InTextCitFrame.style.flexShrink = '0'; // Set initial max height
    InTextCitFrame.style.maxHeight = '40%';

    // Create the toggle button for expanding/collapsing the in-text citation frame


    // Function to render only problematic spans
    const renderSpans = () => {
        // Clear existing paragraphs in InTextCitFrame (if any)
        const existingParagraphs = InTextCitFrame.querySelectorAll('.Reference-frame');
        existingParagraphs.forEach(paragraph => paragraph.remove());

        // Select only problematic spans (i.e., spans without the 'found' attribute)
        const problematicSpans = document.querySelectorAll('span:not([found])'); // Show only problematic spans

        // Highlight problematic citations in red
        problematicSpans.forEach((span) => {
            span.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        });

        // Loop through each problematic span and create a clickable list item
        problematicSpans.forEach((span) => {
            const cleanedCit = span.getAttribute('title'); // Get the cleaned citation text

            if (cleanedCit) { // Only add if cleanedCit is available
                const InTextCitFrameParagraph = document.createElement('div');
                InTextCitFrameParagraph.className = 'InTexts';
                InTextCitFrameParagraph.innerHTML = cleanedCit; // Display the cleaned citation text
                InTextCitFrameParagraph.ParentSpan = span;   
                // Ensure the width of the div fits its content


                // When the paragraph is clicked, scroll to the respective span in the document
                InTextCitFrameParagraph.addEventListener('click', () => {
                    span.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to the span
                });

                // Append the paragraph to the InTextCitFrame
                InTextCitFrame.appendChild(InTextCitFrameParagraph);
            }
        });
    };

    const ThirdFrameHead = document.createElement('div');
    ThirdFrameHead.id = 'ThirdFrameHead';
    //ThirdFrameHead.style.margin = ""
    InTextCitFrame.appendChild(ThirdFrameHead);

    // Append the toggle button (if necessary) to the InTextCitFrame


    // Append the InTextCitFrame to the scholar container
    scholarContainer.appendChild(InTextCitFrame);

    // Initial render showing only problematic spans
    renderSpans();
    UpdateFrames(); // Assuming UpdateFrames() is needed elsewhere
}


export function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
  }
  
  // Function to hide the loading spinner
 export function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
  }


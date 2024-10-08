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


export async function searchResultGUI(searchResults, crossRefButton, ReferenceFrameParagraph) {
    // Remove the button after it's clicked
    crossRefButton.remove();

    // If search data is available, process it and show results
    if (searchResults.length > 0) {
        const resultsDiv = document.createElement('div'); // Create a div to contain results
        resultsDiv.className = 'crossref-results';
        resultsDiv.style.marginTop = '5px'; // Add margin above results

        // Loop through results and add them to the resultsDiv
        searchResults.forEach(item => {
            if (item.title && item.URL) { // Check if title and URL are present
                const resultFrame = document.createElement('div');
                resultFrame.className = 'result-frame';

                // Create a single paragraph element
                const resultParagraph = document.createElement('p');
                resultParagraph.style.fontSize = '16px'; // Set font size
                resultParagraph.style.margin = '0px'; // Set font size
                resultParagraph.style.backgroundColor = "#FFFFFF";

                // Construct the inner HTML content without new lines   <strong>${matchPercentage}% Match</strong>.
                resultParagraph.innerHTML = `
        
        ${item.formattedAuthors}.
        (${item.yearString}).
        <strong>${item.title[0]}</strong>.
        ${item['container-title'] ? item['container-title'][0] : 'Unknown Journal'}.
        DOI: <a href="${item.URL}" target="_blank">${item.DOI}</a>`;

                resultFrame.appendChild(resultParagraph); // Append the combined paragraph to resultFrame

                // Add empty line between results
                resultFrame.style.marginBottom = '2px';

                // Append the resultFrame to the resultsDiv
                resultsDiv.appendChild(resultFrame);

                resultFrame.style.backgroundColor = `hsl(${(item.matchPercentage / 100) * 120}, 100%, 50%)`;
            }
        });

        ReferenceFrameParagraph.appendChild(resultsDiv); // Append the resultsDiv to the ReferenceFrameParagraph
    } else {
        const noResultsMsg = document.createElement('p');
        noResultsMsg.textContent = 'No CrossRef results found.';
        ReferenceFrameParagraph.appendChild(noResultsMsg);
    }}



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
            
            if (hasEtAl) {
              // Normalize both strings to avoid encoding issues
            //   console.log(arr1[0].normalize().length, arr2[0].normalize().length)
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
              ReferenceFrameParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
          }

          if ( ReferenceFrameParagraph.getAttribute('abbr') && ReferenceFrameParagraph.getAttribute('abbr').toLowerCase() === authorsCit[0].toLowerCase() && RefYear === SpanYear) {
            //console.log(ReferenceFrameParagraph.getAttribute('abbr').toLowerCase,  authorsCit[0].toLowerCase)
            matchedSpans.push(span);
            if (!span.hasAttribute('found')) {
              span.setAttribute('found', 'true');
            }
            span.addEventListener('click', () => {
              ReferenceFrameParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
          }


        });

      
        return matchedSpans;
      }
      



      function ShowLinks(SingleRef, ReferenceFrameParagraph) {
       
        const matchedSpans = [...new Set(SingleRef.myLinks)];
        const matchCount = matchedSpans.length;
        SingleRef.innerHTML = `has been found ${matchCount} times in the document.`;
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
                
                ReferenceFrameParagraph.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
            } else {
                SingleRef.parentElement.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

            }
                //divs.forEach(div => {
                //div.style.color = 'red';
            //});
        } else {
            if (ReferenceFrameParagraph){
                
                ReferenceFrameParagraph.style.backgroundColor = "#FFFFFF"//getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
            } else {
                SingleRef.parentElement.style.backgroundColor = "#FFFFFF"//getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

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
    ReferenceFrame.className = 'search-string-frame collapsible-frame'; // Assign collapsible class
    ReferenceFrame.setAttribute('style', 'max-height: 400px; border: 0px solid #ccc !important; box-shadow: none !important;');

    
    // Create and add headline for references
    const referenceHeadline = document.createElement('div');
    const referenceTitle = document.createElement('p');
    referenceTitle.id = "References"
    referenceTitle.innerHTML = '<strong>References:</strong>';
    referenceTitle.style.marginBottom = '5px'
    referenceTitle.style.marginTop = '10px'
    referenceTitle.style.paddingBottom = '0px'

    referenceTitle.style.marginLeft = '10px'

    referenceHeadline.appendChild(referenceTitle)
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'searchField';
    searchInput.placeholder = 'Search...';
    searchInput.style.marginLeft = '50px';
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
    toggleButton.style.float = "right"; // Add some space between the buttons

    toggleButton.addEventListener('click', () => {
        // Toggle the max-height between 100px and the full height of the content (to show/hide the reference frame)
        if (ReferenceFrame.style.maxHeight === '400px') {
            ReferenceFrame.style.maxHeight = ReferenceFrame.scrollHeight + 'px'; // Expand to content height
        } else {
            ReferenceFrame.style.maxHeight = '400px'; // Collapse back to minimum height
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
        let lastNames
        if (cleanedText && cleanedText.match(/^(.*?)(?=\d{4}[a-z]?)/)[0]) {
            const authorsPart = cleanedText.match(/^(.*?)(?=\d{4}[a-z]?)/)[0];
            //console.log(authorsPart)
        // Step 3: Split the remaining string by commas or ampersands and extract the last names
             lastNames = authorsPart.replace(" (hrsg.)", "").replace(" (eds.).", "").replace(" (", "").replace(", ,", ",").replace(".", "").split(/,|&/).map(author => author.trim());
             lastNames = lastNames.filter(name => name !== "");
        } else {
             lastNames = [];

        }
        ReferenceFrameParagraph.className = "ReferenceFrameParagraph"
        ReferenceFrameParagraph.setAttribute('authors', lastNames)
        ReferenceFrameParagraph.setAttribute('year', MyYear)
                // check if there is an abbreviation
                const result = mergedText.match(/^(.*?)(?=\d{4}[a-z]?)/)[0];

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

        ReferenceFrameParagraph.appendChild(SingleRef)
        // Add the CrossRef search button
        const buttoncontainer = document.createElement('div');
        buttoncontainer.className = "buttoncontainer"
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
        ReferenceFrameParagraph.appendChild(buttoncontainer)
        buttoncontainer.appendChild(crossRefButton);

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


    DragDrop() // sollten wir eventuell verschieben
    
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
    
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('scholar-container').scrollTo({
        top: 0,
        behavior: 'smooth'
    });

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
        const accentColor =  "rgb(227, 87, 75)" //getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

        // Select all elements with class '.Reference-frame'
        const referenceFrames = document.querySelectorAll('.Reference-frame');
    
        // Count how many reference frames do not match the accent color
        let countWithoutMatch = 0;
        
        referenceFrames.forEach(reference => {
            // Get the computed color of the reference frame
            const referenceColor = getComputedStyle(reference).getPropertyValue('background-color').trim();
            // If the reference color doesn't match the accent color, increment the counter
            if (referenceColor === accentColor) {
                countWithoutMatch++;
            }
        });
        

        const citationSpans = document.querySelectorAll('span.citation')
        const MatchedcitationSpans = document.querySelectorAll('span.citation[found="true"]')

        
        // Find the TextFrameParagraph where the new text needs to be added
        const TextFrameParagraph = document.getElementById('References');       
        // Append the text to the existing paragraph
        if (TextFrameParagraph) {
            TextFrameParagraph.innerHTML = `Found <b>${referenceFrames.length}</b> References with ` + `<b>${countWithoutMatch}</b> Reference${countWithoutMatch === 1 ? '' : 's'} without match:`;
        }
        const ThirdFrameHead = document.getElementById('ThirdFrameHead');       
        // Append the text to the existing paragraph
        if (ThirdFrameHead) {
            ThirdFrameHead.innerHTML = `<br>Found <b>${citationSpans.length}</b> in-text citations with ` + `<b>${citationSpans.length - MatchedcitationSpans.length}</b> in-text citation${citationSpans.length - MatchedcitationSpans.length === 1 ? '' : 's'} without match:  `
        }
}

function DragDrop() {
    let dragStartTime = 0;
    let draggedElement = null; // Keep track of the dragged element

    // Select all draggable span elements with class "citation"
    const draggables = document.querySelectorAll('span.citation');
    
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
                // 1. Set the background color to secondary color
                draggedElement.style.backgroundColor = secondaryColor;
                if (!draggedElement.hasAttribute('found')) {
                    draggedElement.setAttribute('found', 'true');
                  }
                // 2. Add event listener to scroll to the drop zone (Reference-frame)
                draggedElement.addEventListener('click', () => {
                    dropZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });

                // 3. Append a link to the drop zone
                
                let currentLinks = dropZone.querySelector('.SingleRef').myLinks
                removeLinksRelatedToSpan(draggedElement)
                currentLinks.push(draggedElement)

                console.log(currentLinks)
                ShowLinks(dropZone.querySelector('.SingleRef'))
                
            } else {  /////////////////////////////////////////////////////////////////// not working as the other dom elements cant be dropzones

            }
            UpdateFrames()
        });
    });

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
    InTextCitFrame.className = 'search-string-frame collapsible-frame'; // Assign collapsible class
    InTextCitFrame.style.maxHeight = '400px'; // Set initial max height



    // Create the toggle button for expanding/collapsing the in-text citation frame
    const toggleInTextButton = document.createElement('button');
    toggleInTextButton.className = 'toggle-in-text-button';
    toggleInTextButton.style.display = 'none';
    toggleInTextButton.textContent = 'Show/Hide In-Text Citations';

    // Toggle the frame height when the button is clicked
    toggleInTextButton.addEventListener('click', () => {
        if (InTextCitFrame.style.maxHeight === '400px') {
            InTextCitFrame.style.maxHeight = InTextCitFrame.scrollHeight + 'px'; // Expand to content height
        } else {
            InTextCitFrame.style.maxHeight = '400px'; // Collapse back to initial height
        }
    });

    // Create the "Show All/Show Problematic" button
    const showToggleButton = document.createElement('button');
    showToggleButton.style.display = 'none';
    showToggleButton.textContent = 'Show Problematic'; // Default to show only problematics
    let showAll = false; // Flag to track toggle state

    // Function to render the spans based on the current filter (all or problematic)
    const renderSpans = () => {
        // Clear existing paragraphs in InTextCitFrame (if any)
        const existingParagraphs = InTextCitFrame.querySelectorAll('.Reference-frame');
        existingParagraphs.forEach(paragraph => paragraph.remove());

        // Determine which spans to show
        let spansToShow;
        if (showAll) {
            spansToShow = document.querySelectorAll('span.citation'); // Show all spans
        } else {
            spansToShow = document.querySelectorAll('span:not([found])'); // Show only problematic spans
        }


        // Highlight unfound citations in red
        document.querySelectorAll('span:not([found])').forEach((span, index) => {
            span.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

        })


        // Loop through each span to create a clickable list item in the frame
        spansToShow.forEach((span, index) => {
            const cleanedCit = span.getAttribute('cleanedCit'); // Get the cleaned citation text

            if (cleanedCit) { // Only add if cleanedCit is available
                const InTextCitFrameParagraph = document.createElement('p');
                InTextCitFrameParagraph.className = 'Reference-frame';
                InTextCitFrameParagraph.innerHTML = cleanedCit; // Display the cleaned citation text
                InTextCitFrameParagraph.style.cursor = 'pointer'; // Make it look clickable

                // When the paragraph is clicked, scroll to the respective span in the document
                InTextCitFrameParagraph.addEventListener('click', () => {
                    span.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to the span
                });

                // Append the paragraph to the InTextCitFrame
                InTextCitFrame.appendChild(InTextCitFrameParagraph);
            }
        });
    };

    // Add event listener to toggle between showing all and problematic
    showToggleButton.addEventListener('click', () => {
        showAll = !showAll; // Toggle the state
        showToggleButton.textContent = showAll ? 'Show Problematic' : 'Show All'; // Update button text
        renderSpans(); // Re-render spans based on the new state
    });

    const ThirdFrameHead = document.createElement('div');
    const problematicCitationsCount = document.querySelectorAll('span:not([found])').length;
    //ThirdFrameHead.innerHTML = `<strong>Found ${problematicCitationsCount} problematic in-text citations:</strong>`;
    ThirdFrameHead.style.marginBottom = '15px'
    ThirdFrameHead.style.paddingtop = '0px'
    ThirdFrameHead.id = 'ThirdFrameHead'
    InTextCitFrame.appendChild(ThirdFrameHead)


    // Append the toggle buttons to the InTextCitFrame
    InTextCitFrame.appendChild(toggleInTextButton);
    InTextCitFrame.appendChild(showToggleButton);

    // Append the InTextCitFrame to the scholar container
    scholarContainer.appendChild(InTextCitFrame);

    // Initial render showing only problematic spans
    renderSpans();
    UpdateFrames()
}


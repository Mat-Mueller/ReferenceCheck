import { triggerSearch2, calculateMatchPercentage, getYear, getMergedTextByMyId, formatAuthors } from './crossrefSearch.js';

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




export function secondFrame(referenceCount) {


    createSeparator(referenceCount)
    
    const scholarContainer = document.getElementById('scholar-container');
    // Second frame for references (collapsible frame)
    const ReferenceFrame = document.createElement('div');
    ReferenceFrame.className = 'search-string-frame collapsible-frame'; // Assign collapsible class
    ReferenceFrame.style.maxHeight = '400px';

    // Create and add headline for references
    const referenceTitle = document.createElement('p');
    referenceTitle.innerHTML = '<strong>References:</strong>';
    referenceTitle.style.marginBottom = '15px'

    // Create a container div to hold the buttons side by side
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'inline-block'; // Ensure buttons are on the same line

    // Create the toggle button for expanding/collapsing
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Show/Hide References';
    toggleButton.className = 'toggle-in-text-button';
    toggleButton.style.marginRight = '10px'; // Add some space between the buttons

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

    // Create the second button for CrossRef search
    const crossRefAllButton = document.createElement('button');
    crossRefAllButton.textContent = 'Search All CrossRef';
    crossRefAllButton.className = 'crossref-all-button';

    // Add event listener to trigger the search for all references when clicked
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Add event listener to the CrossRef search button
    crossRefAllButton.addEventListener('click', async () => {
        // Find all buttons with class 'crossref-search-button'
        const crossRefButtons = document.querySelectorAll('.crossref-search-button');

        // Iterate through each button and trigger its click event with a delay
        for (let i = 0; i < crossRefButtons.length; i++) {
            crossRefButtons[i].click(); // Trigger the individual click event

            // Introduce a delay of 1 second (1000 ms) between each request
            await sleep(1000);
        }
    });
    buttonContainer.appendChild(crossRefAllButton);
    referenceTitle.appendChild(buttonContainer);
    referenceTitle.appendChild(toggleButton);

    ReferenceFrame.appendChild(referenceTitle);


    let citationSpans = document.querySelectorAll('span.citation');

    for (let j = 0; j < referenceCount; j++) {
        const divs = document.querySelectorAll(`[MyId="${j}"]`);
        let matchCount = 0;
        let matchedSpans = [];
        const mergedText = getMergedTextByMyId(j);
        const firstWord = mergedText.split(' ')[0].replace(/,$/, '').replace(".","");
        //console.log(mergedText)
        var MyYear = mergedText.match(/\b\d{4}[a-zA-Z]?\b/)
        if (MyYear) {
            MyYear = MyYear[0]
        }
        const ReferenceFrameParagraph = document.createElement('p');
        ReferenceFrameParagraph.className = 'Reference-frame';


        divs.forEach ((div) => {
    
            div.addEventListener('click', () => {
    
                    ReferenceFrameParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
            });
        })

    

        // Loop through each span element
        citationSpans.forEach((span) => {
            let cleanedText = span.getAttribute('cleanedCit');
            let SpanYear = span.getAttribute('year');   ///// Spanier ;-)
            let firstWordCit = cleanedText.split(' ')[0].replace(",", "");
            //console.log(firstWord.toLowerCase())
            //console.log(firstWordCit.toLowerCase())
            if (firstWord.toLowerCase() === firstWordCit.toLowerCase() && MyYear === SpanYear) {

                matchCount++
                matchedSpans.push(span)
                if (!span.hasAttribute('found')) { span.setAttribute('found', 'true') }
                span.addEventListener('click', () => {

                    ReferenceFrameParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });

                });
            }


        });


        // Create first paragraph with inline style
        var SingleRef = document.createElement('p');
        const clickableText = makeLinksClickable(mergedText);
        SingleRef.innerHTML = clickableText;
        //SingleRef.innerHTML = mergedText;
        SingleRef.style.marginBottom = '15px'; // Add some space below

        ReferenceFrameParagraph.appendChild(SingleRef);

        // Create second paragraph with inline style
        SingleRef = document.createElement('p');
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


        // Add the CrossRef search button
        const crossRefButton = document.createElement('button');
        crossRefButton.textContent = 'Search CrossRef';
        crossRefButton.className = 'crossref-search-button';
        crossRefButton.style.marginBottom = '0px'; // Add space below the button
        crossRefButton.style.marginLeft = '15px';
        crossRefButton.id = `crossref-button-${j}`

        crossRefButton.addEventListener('click', async () => {
            const searchData = await triggerSearch2(j); // Wait for the search data
            const query = getMergedTextByMyId(j); // Get the merged text for comparison

            // Remove the button after it's clicked
            crossRefButton.remove();

            // If search data is available, process it and show results
            if (searchData && searchData.message && searchData.message.items && searchData.message.items.length > 0) {
                const results = searchData.message.items.slice(0, 2); // Get the first 3 results

                const resultsDiv = document.createElement('div'); // Create a div to contain results
                resultsDiv.className = 'crossref-results';
                resultsDiv.style.marginTop = '5px'; // Add margin above results

                let highestMatch = 0;

                // Loop through the first 3 results and add them to the resultsDiv
                results.forEach(item => {
                    if (item.title && item.URL) { // Check if title and URL are present
                        const resultFrame = document.createElement('div');
                        resultFrame.className = 'result-frame';
                        

                        // Format authors
                        const formattedAuthors = formatAuthors(item.author);

                        // Create a single paragraph element
                        const resultParagraph = document.createElement('p');
                        resultParagraph.style.fontSize = '16px'; // Set font size
                        resultParagraph.style.margin = '0px'; // Set font size
                        resultParagraph.style.backgroundColor = "#FFFFFF";

                        // Calculate the match percentage (based on your logic)
                        const matchPercentage = calculateMatchPercentage(item, query);

                        // Construct the inner HTML content without new lines   <strong>${matchPercentage}% Match</strong>.
                        resultParagraph.innerHTML = `
                
                ${formattedAuthors}.
                (${getYear(item.issued)}).
                <strong>${item.title[0]}</strong>.
                ${item['container-title'] ? item['container-title'][0] : 'Unknown Journal'}.
                DOI: <a href="${item.URL}" target="_blank">${item.DOI}</a>`;

                        resultFrame.appendChild(resultParagraph); // Append the combined paragraph to resultFrame

                        // Add empty line between results
                        resultFrame.style.marginBottom = '2px';

                        // Append the resultFrame to the resultsDiv
                        resultsDiv.appendChild(resultFrame);

                        // Track the highest match percentage
                        if (highestMatch < matchPercentage) {
                            highestMatch = matchPercentage;
                        }
                        resultFrame.style.backgroundColor = `hsl(${(highestMatch / 100) * 120}, 100%, 50%)`;
                    }
                });

                ReferenceFrameParagraph.appendChild(resultsDiv); // Append the resultsDiv to the ReferenceFrameParagraph

                // Apply color to ReferenceFrameParagraph based on highest match percentage
                const hue = (highestMatch / 100) * 120; // Calculate hue based on highest match percentage (0 to 120)
                //ReferenceFrameParagraph.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;

            } else {
                const noResultsMsg = document.createElement('p');
                noResultsMsg.textContent = 'No CrossRef results found.';
                ReferenceFrameParagraph.appendChild(noResultsMsg);
            }
        });

        // Append the CrossRef button to the paragraph
        SingleRef.appendChild(crossRefButton);


        const ScholarRefButton = document.createElement('button');
        ScholarRefButton.textContent = 'Search Google Scholar';
        ScholarRefButton.className = 'Scholar-search-button';
        ScholarRefButton.id = `Scholar-button-${j}`
        ScholarRefButton.addEventListener('click', async () => { 
            
                let baseUrl = "https://scholar.google.com/scholar?q=";
                let formattedQuery = encodeURIComponent(mergedText);  // Encodes the search string for URL
                let fullUrl = baseUrl + formattedQuery;
                window.open(fullUrl, '_blank');  // Opens the URL in a new tab or window
            

        })


        SingleRef.appendChild(ScholarRefButton);
        ReferenceFrameParagraph.appendChild(SingleRef);
        // If no matches were found, highlight the text in red
        if (matchCount === 0) {
            ReferenceFrameParagraph.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
            divs.forEach(div => {
                //div.style.color = 'red';
            });
        }

        // Append the ReferenceFrameParagraph to the main ReferenceFrame
        ReferenceFrame.appendChild(ReferenceFrameParagraph);

    }

    // Append the ReferenceFrame to the scholar container
    scholarContainer.appendChild(ReferenceFrame);
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

    const referenceTitle = document.createElement('p');
    const problematicCitationsCount = document.querySelectorAll('span:not([found])').length;
    referenceTitle.innerHTML = `<strong>Found ${problematicCitationsCount} problematic in-text citations:</strong>`;
    referenceTitle.style.marginBottom = '15px'
    referenceTitle.style.paddingtop = '0px'
    InTextCitFrame.appendChild(referenceTitle)


    // Append the toggle buttons to the InTextCitFrame
    InTextCitFrame.appendChild(toggleInTextButton);
    InTextCitFrame.appendChild(showToggleButton);

    // Append the InTextCitFrame to the scholar container
    scholarContainer.appendChild(InTextCitFrame);

    // Initial render showing only problematic spans
    renderSpans();
}
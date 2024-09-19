import { triggerSearch2, calculateMatchPercentage, getYear, getMergedTextByMyId, formatAuthors } from './crossrefSearch.js';

export function displaySoftwareDescription() {
    const scholarContainer = document.getElementById('scholar-container');

    // First div: Software overview
    const overviewFrame = document.createElement('div');
    overviewFrame.className = 'search-string-frame'; // Use similar class names for styling
    overviewFrame.style.padding = '15px'; // Add padding for better visual separation
    overviewFrame.style.lineHeight = '1.6'; // Improve readability with better line height

    // First part of the content (before "How It Works")
    const overviewHTML = `
    <h2>PDF Citation Analyzer</h2>
    <p>This software allows users to upload and interact with PDFs for citation analysis and validation using the CrossRef API. It helps identify and analyze references in PDF documents.</p>
`;

    // Set the innerHTML for the first div (Overview)
    overviewFrame.innerHTML = overviewHTML;

    // Result frame for Features
    const featuresFrame = document.createElement('div');
    featuresFrame.className = 'result-frame';
    featuresFrame.style.backgroundColor = "#FFFFFF";
    featuresFrame.style.marginBottom = '15px'; // Add margin between steps
    featuresFrame.style.padding = '10px'; // Add padding inside each step frame
    featuresFrame.style.border = '1px solid #ddd'; // Optional: Add a light border

    const featuresTitle = document.createElement('h3');
    featuresTitle.textContent = 'Features';

    const featuresList = `
    <ul>
        <li>Upload PDF files for analysis</li>
        <li>Automatic and manual reference section detection</li>
        <li>CrossRef API integration for reference validation</li>
        <li>In-text citation highlighting and matching</li>
        <li>Google Scholar search for additional reference lookup</li>
    </ul>
`;

    // Append features content to the frame
    featuresFrame.appendChild(featuresTitle);
    featuresFrame.innerHTML += featuresList;

    // Second div: How it works section with custom result frame
    const howItWorksFrame = document.createElement('div');
    howItWorksFrame.className = 'search-string-frame'; // Use similar class names for styling
    howItWorksFrame.style.padding = '15px'; // Add padding for better visual separation
    howItWorksFrame.style.lineHeight = '1.6'; // Improve readability with better line height

    // Steps are wrapped in custom-styled resultFrame divs
    const steps = [
        {
            title: 'Step 1: Uploading a PDF',
            description: 'You can upload a PDF either by dragging and dropping it into the designated area or using the file upload button. Once uploaded, the system processes and renders the PDF using the PDF.js library.'
        },
        {
            title: 'Step 2 & 3: Reference Section Detection and Analyzing References',
            description: 'The software can automatically or manually identify the reference section. After that, the reference section is analyzed, and references are separated by paragraph or indentation, depending on the structure of the document.'
        },
        {
            title: 'Step 4: CrossRef Search',
            description: 'Once references are separated, the tool performs CrossRef lookups to validate citations. The results are displayed within the document for easy review.'
        },
        {
            title: 'Step 5: Citation Highlighting',
            description: 'In-text citations are detected and matched with the references. The tool highlights both the in-text citation and its corresponding reference in the reference section.'
        },
        {
            title: 'Step 6: Google Scholar Search',
            description: 'For references where CrossRef doesn’t provide sufficient information, the tool offers a Google Scholar search option for extended citation lookup.'
        }
    ];

    // Add steps to the second div using resultFrame
    steps.forEach(step => {
        const resultFrame = document.createElement('div');
        resultFrame.className = 'result-frame';
        resultFrame.style.backgroundColor = "#FFFFFF";
        resultFrame.style.marginBottom = '15px'; // Add margin between steps
        resultFrame.style.padding = '10px'; // Add padding inside each step frame
        resultFrame.style.border = '1px solid #ddd'; // Optional: Add a light border

        const stepTitle = document.createElement('h4');
        stepTitle.textContent = step.title;

        const stepDescription = document.createElement('p');
        stepDescription.textContent = step.description;

        // Append title and description to the resultFrame
        resultFrame.appendChild(stepTitle);
        resultFrame.appendChild(stepDescription);

        // Append each resultFrame to the howItWorksFrame
        howItWorksFrame.appendChild(resultFrame);
    });

    // Append the overview, features, and how it works frames to the scholar container
    overviewFrame.appendChild(featuresFrame)
    scholarContainer.appendChild(overviewFrame);
    //scholarContainer.appendChild(featuresFrame);
    scholarContainer.appendChild(howItWorksFrame);
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


export function secondFrame(referenceCount) {
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
        console.log(mergedText)
        var MyYear = mergedText.match(/\b\d{4}[a-zA-Z]?\b/)
        if (MyYear) {
            MyYear = MyYear[0]
        }
        const ReferenceFrameParagraph = document.createElement('p');
        ReferenceFrameParagraph.className = 'Reference-frame';

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
        SingleRef.innerHTML = mergedText;
        SingleRef.style.marginBottom = '15px'; // Add some space below

        ReferenceFrameParagraph.appendChild(SingleRef);

        // Create second paragraph with inline style
        SingleRef = document.createElement('p');
        SingleRef.innerHTML = `has been found ${matchCount} times in the document.`;
        SingleRef.style.marginBottom = '15px'; // Add space as needed
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
        crossRefButton.style.marginBottom = '15px'; // Add space below the button
        crossRefButton.style.marginLeft = '15px';
        crossRefButton.id = `crossref-button-${j}`

        crossRefButton.addEventListener('click', async () => {
            const searchData = await triggerSearch2(j); // Wait for the search data
            const query = getMergedTextByMyId(j); // Get the merged text for comparison

            // Remove the button after it's clicked
            crossRefButton.remove();

            // If search data is available, process it and show results
            if (searchData && searchData.message && searchData.message.items && searchData.message.items.length > 0) {
                const results = searchData.message.items.slice(0, 3); // Get the first 3 results

                const resultsDiv = document.createElement('div'); // Create a div to contain results
                resultsDiv.className = 'crossref-results';
                resultsDiv.style.marginTop = '10px'; // Add margin above results

                let highestMatch = 0;

                // Loop through the first 3 results and add them to the resultsDiv
                results.forEach(item => {
                    if (item.title && item.URL) { // Check if title and URL are present
                        const resultFrame = document.createElement('div');
                        resultFrame.className = 'result-frame';
                        resultFrame.style.backgroundColor = "#FFFFFF";

                        // Format authors
                        const formattedAuthors = formatAuthors(item.author);

                        // Create a single paragraph element
                        const resultParagraph = document.createElement('p');
                        resultParagraph.style.fontSize = '16px'; // Set font size
                        resultParagraph.style.backgroundColor = "#FFFFFF";

                        // Calculate the match percentage (based on your logic)
                        const matchPercentage = calculateMatchPercentage(item, query);

                        // Construct the inner HTML content without new lines
                        resultParagraph.innerHTML = `
                <strong>${matchPercentage}% Match</strong>.
                ${formattedAuthors}.
                (${getYear(item.issued)}).
                <strong>${item.title[0]}</strong>.
                ${item['container-title'] ? item['container-title'][0] : 'Unknown Journal'}.
                DOI: <a href="${item.URL}" target="_blank">${item.DOI}</a>`;

                        resultFrame.appendChild(resultParagraph); // Append the combined paragraph to resultFrame

                        // Add empty line between results
                        resultFrame.style.marginBottom = '20px';

                        // Append the resultFrame to the resultsDiv
                        resultsDiv.appendChild(resultFrame);

                        // Track the highest match percentage
                        if (highestMatch < matchPercentage) {
                            highestMatch = matchPercentage;
                        }
                    }
                });

                ReferenceFrameParagraph.appendChild(resultsDiv); // Append the resultsDiv to the ReferenceFrameParagraph

                // Apply color to ReferenceFrameParagraph based on highest match percentage
                const hue = (highestMatch / 100) * 120; // Calculate hue based on highest match percentage (0 to 120)
                ReferenceFrameParagraph.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;

            } else {
                const noResultsMsg = document.createElement('p');
                noResultsMsg.textContent = 'No CrossRef results found.';
                ReferenceFrameParagraph.appendChild(noResultsMsg);
            }
        });

        // Append the CrossRef button to the paragraph
        SingleRef.appendChild(crossRefButton);
        ReferenceFrameParagraph.appendChild(SingleRef);
        // If no matches were found, highlight the text in red
        if (matchCount === 0) {
            ReferenceFrameParagraph.style.color = 'red';
            divs.forEach(div => {
                div.style.color = 'red';
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
            span.style.backgroundColor = 'red'

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

    // Append the toggle buttons to the InTextCitFrame
    InTextCitFrame.appendChild(toggleInTextButton);
    InTextCitFrame.appendChild(showToggleButton);

    // Append the InTextCitFrame to the scholar container
    scholarContainer.appendChild(InTextCitFrame);

    // Initial render showing only problematic spans
    renderSpans();
}
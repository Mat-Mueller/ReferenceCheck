import { startStop, findReferenceSection } from './findReferenceList.js';
import { subdivide } from './separateReferences.js';
import { inTextSearch } from './inTextCitations.js';

export async function startAnalysis() {
   // Clear previous analysis results or messages
    const scholarContainer = document.getElementById("scholar-container");
    scholarContainer.innerHTML = '';

    // Call the function to find the reference section
    let referenceFound = findReferenceSection("byTitle");

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
        continueButton.innerText = 'Continue';
        continueButton.style.cssText = buttonStyle + 'margin-right: 10px;'; // Add some spacing between buttons
        buttonContainer.appendChild(continueButton);

        const setManuallyButton = document.createElement('button');
        setManuallyButton.innerText = 'Set manually';
        setManuallyButton.style.cssText = buttonStyle; // Apply the same style
        buttonContainer.appendChild(setManuallyButton);
        // Append buttons to the features frame
        TextFrame.appendChild(buttonContainer);
        scholarContainer.appendChild(TextFrame);

        // Add event listeners for Continue and Set Manually buttons
        continueButton.addEventListener('click', function () {
            continueAnalysis(referenceFound);
        });

        setManuallyButton.addEventListener('click', async function () {
            // If "Set manually" is clicked, manually select the reference section
            console.log("now manual");
            scholarContainer.innerHTML = '';
            // Create and display manual selection message
            const manualTextFrame = document.createElement('div');
            manualTextFrame.className = 'search-string-frame';
            manualTextFrame.style.marginTop = '20px'; // Add space above

            const manualTextParagraph = document.createElement('p');
            manualTextParagraph.innerHTML = 'Please select the start and end of the reference section manually.';
            manualTextFrame.appendChild(manualTextParagraph);

            scholarContainer.appendChild(manualTextFrame);

            // Call StartStop() to manually find the reference section
            referenceFound = await startStop();

            if (referenceFound) {
                continueAnalysis(referenceFound);
            }
        });
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

        // Call StartStop() to manually find the reference section
        referenceFound = await startStop();

        // If reference section is found after manual selection, continue analysis
        if (referenceFound) {
            continueAnalysis(referenceFound);
        }
    }
}


// Function to continue analysis after reference section is found
function continueAnalysis(referenceFound) {
    const scholarContainer = document.getElementById("scholar-container");
    scholarContainer.innerHTML = '';
    const TextFrame = document.createElement('div');
    TextFrame.className = 'search-string-frame';
    TextFrame.style.marginBottom = '20px'; // Add bigger space between the message and the following content

    // Create paragraph for the reference section found message
    const TextFrameParagraph = document.createElement('p');
    TextFrameParagraph.innerHTML = 'Which separation mode should I use?';
    TextFrame.appendChild(TextFrameParagraph);

    // Call the Sudivide function for both "byParagraph" and "byIndent"
    const paragraphCount = subdivide(referenceFound, "byParagraph");
    const indentCount = subdivide(referenceFound, "byIndent");

    // Create a container for the buttons to ensure they appear below the message
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px'; // Add space above the buttons

    // Shared button style
    const buttonStyle = 'background-color: white; color: black; border: 1px solid black; width: 200px; padding: 10px; cursor: pointer ;border-radius: 5px;';

    // Create and append the "By paragraph" button
    const paragraphButton = document.createElement('button');
    paragraphButton.innerText = `By paragraph (${paragraphCount} references found)`;
    paragraphButton.style.cssText = buttonStyle + 'margin-right: 10px;'; // Add spacing between buttons
    buttonContainer.appendChild(paragraphButton);

    // Create and append the "By indent" button
    const indentButton = document.createElement('button');
    indentButton.innerText = `By indent (${indentCount} references found)`;
    indentButton.style.cssText = buttonStyle; // Apply same style as paragraphButton
    buttonContainer.appendChild(indentButton);

    // Append buttonContainer to the desired DOM element


    // Append the button container below the success message
    TextFrame.appendChild(buttonContainer);
    scholarContainer.appendChild(TextFrame);
    // Add event listeners to the buttons
    paragraphButton.addEventListener('click', function () {
        let referenceCount = subdivide(referenceFound, "byParagraph");
        inTextSearch(referenceCount);
    });

    indentButton.addEventListener('click', function () {
        let referenceCount = subdivide(referenceFound, "byIndent");
        inTextSearch(referenceCount);
    });
}
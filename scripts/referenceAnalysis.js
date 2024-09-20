// Called from main.js, identifies reference section and initiates reference separation

import { subdivide } from './separateReferences.js';
import { inTextSearch } from './inTextCitations.js';

// Function to continue analysis after reference section is found
export function continueAnalysis(referenceFound) {
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
import { getMergedTextByMyId, checkExists } from './crossrefSearch.js';
import {MakeRefName, matching, BestMatch} from './magic.js';
import {checkFooter, checkHeader} from './headerFooterDetect.js'
import { subdivide, userDecisionSeparation } from './separateReferences.js';
import {findNearestTextDivBelow, findNearestTextDivAbove} from './findReferenceList.js'


export function clearRightContainer() {
    const scholarContainer = document.getElementById('scholar-container');
    scholarContainer.innerHTML = ''; // Clear previous content
}


export function MoveToFirstSpan() {
    // Find the first span with the class 'citation'
    const firstCitation = document.querySelector('span.citation');

    if (firstCitation) {
        // Scroll the element into view
        firstCitation.scrollIntoView({
            behavior: 'smooth',  // You can use 'smooth' for a smooth scrolling animation or 'auto' for an instant scroll
            block: 'center',     // Scroll so that the element is centered in the viewport
            inline: 'nearest'    // Align it nearest to the horizontal center (if necessary)
        });
    } else {
        console.log('No citation span found');
    }
}


export function displaySoftwareDescription() {
    const scholarContainer = document.getElementById('description');

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
    document.getElementById("menu-icon").addEventListener("click", function (e) {
        e.stopPropagation(); // prevent it from immediately closing
        document.getElementById("menu").classList.toggle("active");
        this.classList.toggle("active");
      });
    function closeMenu() {
        document.getElementById("menu").classList.remove("active");
        document.getElementById("menu-icon").classList.remove("active");
    }
      
      // Close menu on any click outside the menu
    document.addEventListener("click", function () {
        closeMenu();
    });
}


function activateButton(button) {
    button.style.backgroundColor = "#4a90e2"; // corrected background-color to backgroundColor
    button.style.boxShadow = "0 5px 10px #666"; // corrected box-shadow to boxShadow
    button.style.transform = "translateY(2px)"; // transform is correct
}

function deactivateButton(button) {
    button.style.backgroundColor = "white";
    button.style.boxShadow = "0 7px 10px #999";
    button.style.transform = "translateY(-2px)";
}


function setStart() {
    let isSelecting = false; // Define isSelecting outside to keep track of selection

    return new Promise((resolve) => {
        function handleClick(e) {
            const frame = document.getElementById('pdf-container'); // Get the PDF container element

            // Check if the click is within the frame
            if (frame && frame.contains(e.target)) {
                let startContainer, startOffset;
                
                // First click: Set the start of the selection
                if (!isSelecting) {
                    isSelecting = true;
                    const nearestDiv = findNearestTextDivBelow(e.clientX, e.clientY); // Find the nearest div to click
                    if (nearestDiv) {
                        startContainer = nearestDiv;
                        startOffset = 0; // Start from the beginning of the div
                        console.log("Selection started at div:", startContainer);
                        
                        // Stop listening for further clicks after selection
                        document.removeEventListener("click", handleClick);

                        // Resolve the Promise with the selected start container
                        resolve(startContainer);
                    }
                }
            }
        }

        // Add click event listener to start the selection
        document.addEventListener("click", handleClick);
    });
}

function setEnd() {
    let isSelecting = false; // Define isSelecting outside to keep track of selection

    return new Promise((resolve) => {
        function handleClick(e) {
            const frame = document.getElementById('pdf-container'); // Get the PDF container element

            // Check if the click is within the frame
            if (frame && frame.contains(e.target)) {
                let startContainer, startOffset;
                
                // First click: Set the start of the selection
                if (!isSelecting) {
                    isSelecting = true;
                    const nearestDiv = findNearestTextDivAbove(e.clientX, e.clientY); // Find the nearest div to click
                    if (nearestDiv) {
                        startContainer = nearestDiv;
                        startOffset = 0; // Start from the beginning of the div
                        console.log("Selection ended at div:", startContainer);
                        
                        // Stop listening for further clicks after selection
                        document.removeEventListener("click", handleClick);

                        // Resolve the Promise with the selected start container
                        resolve(startContainer);
                    }
                }
            }
        }

        // Add click event listener to start the selection
        document.addEventListener("click", handleClick);
    });
}

export async function referenceSectionGUI(Points) {
    const scholarContainer = document.getElementById("scholar-container");
    let referenceCount 
    let startPoint
    let endPoint

    if (Points) {
        startPoint = Points[0]
        endPoint = Points[1]
    }
    // get rif of citavi as it fucks with the paragraph computation ///////////////////////// not sure if working!
    document.querySelectorAll('.citavipicker').forEach(function(element) {
        element.style.display = "none"
    });

    // make settings visible
    const settings = document.getElementById("settings")
    settings.style.display = "block"

    // Header and Footer stuff
    const hasFooter = checkFooter()
    const hasHeader = checkHeader()
    console.log(hasFooter, hasHeader)
    let Notifi = ""

    if (hasHeader) {
        document.getElementById("checkHeader").checked = true;
    } else {document.getElementById("checkHeader").checked = false;}
    if (hasFooter) {
        document.getElementById("checkFooter").checked = true;
        
    } else {document.getElementById("checkFooter").checked = false;}
    
    document.getElementById("settings-1text").innerHTML = "<b> Header and footer: </b> <br>"
    if (hasHeader && hasFooter ) {
        document.getElementById("settings-1text").innerHTML += "We found a header and a footer in the PDF. Check/Uncheck the boxes below to manually set the header and footer sections."
    } else if (hasHeader && !(hasFooter) ) {
        document.getElementById("settings-1text").innerHTML += "We found a header in the PDF. Check/Uncheck the boxes below to manually set the header and footer sections."
    } else if (!(hasHeader) && (hasFooter) ) {
        document.getElementById("settings-1text").innerHTML += "We found a footer in the PDF. Check/Uncheck the boxes below to manually set the header and footer sections."
    } else if (!(hasHeader) && !(hasFooter) ) {
        document.getElementById("settings-1text").innerHTML += "We found no footer or header in the PDF. Check/Uncheck the boxes below to manually set the header and footer sections."
    }

    /// Reference section Stuff

    const settings2 = document.getElementById("settings-2")
    const settings3 = document.getElementById("settings-3")
    if (startPoint) {
        document.getElementById("settings-2text").innerHTML = "<b> Start of reference section: </b> <br> Reference section found and highlighted. For manually resetting, click button below."
    } else document.getElementById("settings-2text").innerHTML = "<b> Start of reference section: </b> <br>No reference section found. Please select start of section manually by clicking button below. "
    if (endPoint) {
        document.getElementById("settings-3text").innerHTML = "<b> End of reference section: </b> <br> Reference section found and highlighted. For manually resetting, click button below."
    } else document.getElementById("settings-3text").innerHTML = "<b> End of reference section: </b> <br> No reference section found. Please select end of section manually by clicking button below."

    const SetManually1 = document.getElementById('SetStartManually')  
    SetManually1.addEventListener('click', async function () {
        activateButton(SetManually1)
        document.getElementById("settings-2text").innerHTML = "<b> Start of reference section: </b> <br> Click above the first reference in the reference section to maually reset start."
        startPoint = await setStart();
        deactivateButton(SetManually1)
        document.getElementById("settings-2text").innerHTML = "<b> Start of reference section: </b> <br> Start of reference section set."
        if (startPoint && endPoint) {
            NowSeperate()
        }
    })
    
    const SetManually2 = document.getElementById('SetEndManually')
    SetManually2.addEventListener('click', async function () {
        activateButton(SetManually2)
        document.getElementById("settings-3text").innerHTML = "<b> End of reference section: </b> <br> Click below the last reference in the reference section to manually reset end."
        endPoint = await setEnd();
        deactivateButton(SetManually2)
        document.getElementById("settings-3text").innerHTML = "<b> End of reference section: </b> <br> End of reference section set."
        if (startPoint && endPoint) {
            NowSeperate()
        }
    })
    const settings4 = document.getElementById("settings-4")
    const Cont =  document.getElementById("continue-button")
    
    const subdivButton = document.getElementById("subdivButton")
    subdivButton.innerText = `Separate by paragraph`;    

    const subdivButton2 = document.getElementById("subdivButton2")
    subdivButton2.innerText = `Separate by indent`;    
    

    
    document.getElementById("checkHeader").addEventListener("change", () => {
        const headerDivs = document.querySelectorAll('div[data-header="true"]');
        headerDivs.forEach(function (div) {
            div.classList.add('textLine');
        });
        const Alldivs = document.querySelectorAll('.textLine')
        Alldivs.forEach (function (div){
            div.style.backgroundColor = ""
        })
        if (startPoint && endPoint) {
            NowSeperate();

        } else { 
            document.getElementById("settings-4text").innerHTML = "Please select reference section first";
            Cont.disabled = true;
        }
    });

    document.getElementById("checkFooter").addEventListener("change", () => {
        
        const footerDivs = document.querySelectorAll('div[data-footer="true"]');
        footerDivs.forEach(function (div) {  
            div.classList.add('textLine');  

        });
        const Alldivs = document.querySelectorAll('.textLine')
        Alldivs.forEach (function (div){
            div.style.backgroundColor = ""
        })

        if (startPoint && endPoint) {
            NowSeperate();
            
        } else { 
            document.getElementById("settings-4text").innerText = "Please select reference section first";
            Cont.disabled = true;
        }
    });
    
    

    if (startPoint && endPoint) {
        NowSeperate()
        // Get the element by its ID
        const element = document.getElementById("userSelectText");
        element.textContent = "Reference identification successful.";
        document.getElementById("UserSelectContinue").disabled = false
    } else { 
        document.getElementById("settings-4text").innerText = "Please select reference section first"
        Cont.disabled = true
    }



    
    function NowSeperate() {
            /// first delete all footer and headers
        if (document.getElementById("checkFooter").checked){
            const footerDivs = document.querySelectorAll('div[data-footer="true"]');
            footerDivs.forEach(function (div) {  
                div.classList.remove('textLine', 'highlight');  
                div.removeAttribute("myID");
            });
            console.log("now delete")

        }
        if (document.getElementById("checkHeader").checked ) {
            const headerDivs = document.querySelectorAll('div[data-header="true"]');
            headerDivs.forEach(function (div) {
                div.classList.remove('textLine', 'highlight');
                div.removeAttribute("myID"); 
            });
            
        }       
        Cont.disabled = false;
        const paragraphCount = subdivide(startPoint, endPoint, "byParagraph");
        const indentCount = subdivide(startPoint, endPoint, "byIndent");
        document.getElementById("settings-4text").innerHTML = `<b> Reference separation: </b> <br> ${paragraphCount} references found by paragraph separation, ${indentCount} by indent separation.`;

        referenceCount = indentCount
        const count = document.querySelectorAll('.textLine.highlight').length;
    
       
        // decide which button to activate based on count / paragraphCount and count / indentCount
        // Assuming these values are defined earlier in your script
    
    
        // Calculate the ratios
        const ratioParagraph = count / paragraphCount;
        const ratioIndent = count / indentCount;
    
        console.log(ratioParagraph, ratioIndent); // Log both ratios
    
        // Decision rule
     if (ratioParagraph > 1.7 && ratioParagraph < 4 && ratioIndent > 1.7 && ratioIndent < 4) {
        // Both ratios are within range, pick the smaller one
        
        if (ratioParagraph >= ratioIndent) {
            activateButton(subdivButton)
            deactivateButton(subdivButton2)
            referenceCount = subdivide(startPoint, endPoint, "byParagraph")
            document.getElementById("settings-4text").innerHTML += " We suggest to separate by paragraphs. Click below to change the reference separation algorithm."
        } else {
            activateButton(subdivButton2)
            deactivateButton(subdivButton)
            document.getElementById("settings-4text").innerHTML += " We suggest to separate by intends.  Click below to change the reference separation algorithm."
    
        }
     } else if (ratioParagraph > 1.7 && ratioParagraph < 4) {
        activateButton(subdivButton)
        deactivateButton(subdivButton2)
    
        referenceCount = subdivide(startPoint, endPoint, "byParagraph")
        document.getElementById("settings-4text").innerHTML += " We suggest to separate by paragraphs.  Click below to change the reference separation algorithm."


     } else if (ratioIndent > 1.7 && ratioIndent < 4) {
        activateButton(subdivButton2)
        deactivateButton(subdivButton)
        document.getElementById("settings-4text").innerHTML += " We suggest to separate by intends.  Click below to change the reference separation algorithm."

    
     } 
    
     subdivButton.addEventListener('click', function() {
        activateButton(subdivButton)        
        deactivateButton(subdivButton2)
        referenceCount = subdivide(startPoint, endPoint, "byParagraph")
     })
    
     subdivButton2.addEventListener('click', function() {
        activateButton(subdivButton2)
        deactivateButton(subdivButton)
        referenceCount = subdivide(startPoint, endPoint, "byIndent")
     })
    


    }



    settings4.appendChild(Cont)
    return new Promise((resolve) => {
        Cont.addEventListener('click', function () {

            resolve(referenceCount); // Resolve the promise with startPoint and endPoint values
        });
    });
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
    //ReferenceFrameParagraph.removeChild(ReferenceFrameParagraph.lastChild)
    //console.log(ReferenceFrameParagraph)

    if (searchResults.length > 0 ) {


        // Show the first (best) result
        const firstResult = searchResults[0];
        appendResultToDiv(firstResult, ReferenceFrameParagraph);

        // Append the resultsDiv to the ReferenceFrameParagraph
        





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
        noResultsMsg.textContent = 'No Crossref results found.';
        ReferenceFrameParagraph.appendChild(noResultsMsg);
    }
}

// Helper function to append a single result to the resultsDiv


function appendResultToDiv(item, ReferenceFrameParagraph) {
    if (item.title && item.URL) {
        const resultFrame = ReferenceFrameParagraph.lastChild
        resultFrame.innerHTML = ""

        const resultsDiv = document.createElement('div'); // Create a div to contain results
        resultsDiv.className = 'crossref-results';
        resultsDiv.style.marginTop = '5px'; // Add margin above results
        ReferenceFrameParagraph.appendChild(resultsDiv);

        // Create a single paragraph element for the result
        const resultParagraph = document.createElement('p');
        resultParagraph.style.fontSize = '16px';
        resultParagraph.style.margin = '0px';
        resultParagraph.style.backgroundColor = "#FFFFFF";

        resultParagraph.innerHTML = `Best Crossref match: <br>` + `
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

        // Check if there is an abstract
        if (item.abstract) {
            // Create a link for showing the abstract
            resultParagraph.innerHTML += '&nbsp;'
            resultParagraph.innerHTML += '&nbsp;'
            const showAbstractLink = document.createElement('a');
            showAbstractLink.href = "#"; // Make it behave like a link
            //showAbstractLink.style.color = 'blue'; // Optional: styling to look like a link
            showAbstractLink.style.cursor = 'pointer'; // Change cursor to pointer
            showAbstractLink.innerText = "Show abstract";

            // Append the "Show abstract" link to the resultParagraph
            resultParagraph.appendChild(showAbstractLink);

            // Add an event listener for the "Show abstract" click
            showAbstractLink.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent default link behavior

                // Create a new paragraph for the abstract
                const abstractParagraph = document.createElement('p');
                abstractParagraph.style.fontSize = '14px';
                abstractParagraph.style.marginTop = '10px';
                abstractParagraph.style.backgroundColor = "#f9f9f9";

                // Remove HTML tags from the abstract
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.abstract; // Set the HTML content
                const cleanAbstract = tempDiv.textContent || tempDiv.innerText || ''; // Extract plain text

                abstractParagraph.innerHTML = "<b>Abstract: </b>" + cleanAbstract; 

                // Append the abstract paragraph to the resultFrame
                resultFrame.appendChild(abstractParagraph);

                // Remove or hide the "Show abstract" link after clicking (optional)
                showAbstractLink.remove();
            });
        }
    }
}






      



      function ShowLinks(SingleRef, ReferenceFrameParagraph) {
    if (!SingleRef.MatchedWith){SingleRef.MatchedWith = []}
        const MatchedWith = (SingleRef.MatchedWith);
        const matchCount = MatchedWith.length;
        SingleRef.innerHTML = `<b>${matchCount}</b> ${matchCount === 1 ? 'instance' : 'instances'} in the document:`;
        SingleRef.style.marginBottom = '5px'; // Add space as needed
        MatchedWith.forEach((span, index) => {
            //console.log(span);

            // Create a link for each match
            const link = document.createElement('a');
            link.textContent = `${index + 1}`; // Display 1, 2, 3, etc.
            link.href = "#"; // Dummy href to make it clickable

            // Add an event listener to scroll to the span element when clicked
            link.addEventListener('click', (event) => {
                //event.preventDefault(); // Prevent the default anchor behavior
                span.scrollIntoView({ behavior: 'smooth', block: 'center'  }); // Scroll to the matched span
                DoHighlight(span)
            });

            // Append the link to the paragraph without using innerHTML
            SingleRef.appendChild(link);

            // Add a comma and space after the link, except for the last one
            if (index < MatchedWith.length - 1) {
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
    

    // Second frame for references (collapsible frame)
    const OuterFrame = document.getElementById('secondframe');
    OuterFrame.innerHTML = "";
    OuterFrame.style = "display: block"

    const ReferenceFrame = document.createElement('div');
    ReferenceFrame.id = "ReferenceFrame"
    ReferenceFrame.className = 'search-string-frame collapsible-frame'; // Assign collapsible class
    ReferenceFrame.setAttribute('style', 'border: 0px solid #ccc !important; box-shadow: none !important;');

    
    // Create and add headline for references
    const referenceHeadline = document.createElement('div');
    referenceHeadline.id = "referenceHeadline"

    const LeftContainer = document.createElement('div')
    LeftContainer.id = "LeftContainer"
    referenceHeadline.appendChild(LeftContainer)

    //const Refspinner = document.createElement('div')
    //Refspinner.id = "loading-spinner" 
    //Refspinner.className  = "spinner"
    //LeftContainer.appendChild(Refspinner)
    const referenceTitle = document.createElement('p');
    referenceTitle.id = "References"
    referenceTitle.style.margin = "0px"
    LeftContainer.appendChild(referenceTitle)
    
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
    
    const Searchhits = document.createElement('div')
    Searchhits.id = "SearchhitsRef"

    const RightContainer = document.createElement('div')
    RightContainer.id = "RightContainer"
    
    const Questionsmark = document.createElement('div')
    Questionsmark.innerText = "?"
    Questionsmark.setAttribute("tooltip",  "")
    Questionsmark.className = "Explanations"
    
    Questionsmark.setAttribute("tooltip", 
        "<strong>Reference List Overview</strong><br>" +
        "Here, users can view all detected references from the reference list. An entry may look like this: " +
        "<ul>" +
          "<li>Linked in-text citations are shown if a match is found. These citations are clickable and direct you to their location in the document.</li>" +
          "<li>References with a <span style='border: 1px solid red;'>red border</span> indicate that no in-text citation match was found.</li>" +
          "<li>Each reference includes a 'best match' section from the Crossref database to help verify the accuracy of the entry in the reference list.</li>" +
         
        "<li>A click on " + '<button class="Scholar-search-button" id="Scholar-button-51">GS</button>' + " will open a google scholar search with the detected reference.</li>"
        + "</ul>"
    );
    
    

    const CrossRefbutton = document.createElement("button");
    CrossRefbutton.textContent = "Hide CrossRef Results"; // Initial text
    
    // Add a click event listener to toggle display
    CrossRefbutton.addEventListener("click", () => {
        const resultFrames = document.querySelectorAll("div.result-frame");
    
        // Check if at least one result frame is currently displayed
        const anyVisible = Array.from(resultFrames).some(div => div.style.display !== "none");
    
        resultFrames.forEach(div => {
            // Toggle visibility based on current display style
            div.style.display = anyVisible ? "none" : "block";
        });
    
        // Update button text based on new visibility state
        CrossRefbutton.textContent = anyVisible ? "Show CrossRef Results" : "Hide CrossRef Results";
    }); 
    referenceHeadline.appendChild(RightContainer)
    RightContainer.appendChild(CrossRefbutton)
    RightContainer.appendChild(Searchhits)
    RightContainer.appendChild(searchInput)
    RightContainer.appendChild(Questionsmark)


    // Create a container div to hold the buttons side by side
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'inline-block'; // Ensure buttons are on the same line

    // Create the toggle button for expanding/collapsing
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '▲'; // ▼
    toggleButton.className = 'toggle-in-text-button';
    toggleButton.style.display = "none"; //////////////////////////////////////////////////////////////////////////////////////////////


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
        let mergedText = getMergedTextByMyId(j);

        var MyYear = mergedText.match(/\b\d{4}[a-zA-Z]?\b/)
        if (MyYear) {
            MyYear = MyYear[0]
        }


        const ReferenceFrameParagraph = document.createElement('div');

        //assign author names to ReferenceFrameParagraph
        mergedText = mergedText.replace(/[\u2010-\u2015-][a-zA-Z]\./g, "");        

        const cleanedText = mergedText.replace(/(?:,\s?| )([A-Z]\.)+/g, '').toLowerCase();
        // Step 2: Extract the part before the (year)
        let lastNames = MakeRefName(cleanedText, ReferenceFrameParagraph);

        
        ReferenceFrameParagraph.className = "ReferenceFrameParagraph"
        ReferenceFrameParagraph.setAttribute('authors', lastNames)
        ReferenceFrameParagraph.setAttribute('year', MyYear)
        ReferenceFrameParagraph.setAttribute('tooltip', `Detected authors and year: <br> ${lastNames} (${MyYear})`)
        ReferenceFrameParagraph.id = j;
                // check if there is an abbreviation
        const matchResult = mergedText.match(/^(.*?)(?=\d{4}[a-z]?)/);

        let result;
        if (matchResult) {
            result = matchResult[0]; // Safely access the matched part
        } else {
            result = ""; // Or handle it accordingly if no match is found
        }
        ReferenceFrameParagraph.setAttribute('cleanedText', result.replace(" (", ""))


        /// asigning abbreviations for references
        const match = result.match(/\(([^)]+)\)/);

        if (match) {
            ReferenceFrameParagraph.setAttribute('Abbr', match[1]); // Outputs: "example text"
            //console.log(match[1])
        } else {
            if (!ReferenceFrameParagraph.hasAttribute("abbr")) {
            let abbr = lastNames
            
            if (abbr.length === 1) {
                ReferenceFrameParagraph.setAttribute('Abbr',  abbr[0].split(" ").map(author => author[0].trim()).join(""))
            } else {
            ReferenceFrameParagraph.setAttribute('Abbr', "");
            }
        }
        }
        ReferenceFrameParagraph.className = 'Reference-frame';

        divs.forEach ((div) => {
            div.style.cursor = 'pointer'
            div.addEventListener('click', () => {   
                    ReferenceFrameParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    DoHighlight(ReferenceFrameParagraph)    
            });
        })


        matching(ReferenceFrameParagraph)   ////////////////////////////////////////////////////////////////////////////////////should move
        // Create first paragraph with inline style
        var SingleRef = document.createElement('p');
        const clickableText = makeLinksClickable(mergedText);
        SingleRef.style.margin = "0px"

        SingleRef.innerHTML = clickableText;
        //SingleRef.innerHTML = mergedText;
        SingleRef.style.marginBottom = '15px'; // Add some space below
        SingleRef.style.marginRight = "60px";
        ReferenceFrameParagraph.appendChild(SingleRef);

        SingleRef.addEventListener('click', () => {
            divs[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
            DoHighlight(divs[0])
        })

        // Create second paragraph with inline style
        SingleRef = document.createElement('p');
        SingleRef.classList.add('SingleRef');
        SingleRef.MatchedWith = ReferenceFrameParagraph.MatchedWith
        ShowLinks(SingleRef, ReferenceFrameParagraph)
        //SingleRef.innerHTML += ''

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

        const textNode = document.createTextNode("Best Crossref match:");
        resultParagraph.appendChild(textNode);
        
        const Refspinner = document.createElement('div')
        Refspinner.className  = "spinner"
        Refspinner.style.display = "block"
        resultParagraph.appendChild(Refspinner)

        resultFrame.appendChild(resultParagraph);
        resultFrame.style.marginBottom = '10px';

        // Append the result frame to the resultsDiv
        ReferenceFrameParagraph.appendChild(resultFrame);

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


        // Append the ReferenceFrameParagraph to the main ReferenceFrame
        ReferenceFrame.appendChild(ReferenceFrameParagraph);
    }
    // Append the ReferenceFrame to the scholar container
    OuterFrame.appendChild(ReferenceFrame);




        // should move somewhere else                                        ///////////////////////////////////////////////////////////////////
}


export function DoHighlight(element) {
    // Store the original background color
// Store the original background color and border of the element
let backgroundColor = element.style.backgroundColor;
const currentBorder = element.style.border;
if (!backgroundColor && element.classList.contains("citation")){
    backgroundColor = "#CCE34B"

}


/*
element.classList.add("DoHighlights")
setTimeout(() => {
    element.classList.remove("DoHighlights");
}, 2000); // 2000 ms = 2 seconds
*/

// Check if the current border is not already the desired highlighted border
if (currentBorder !== `5px solid ${backgroundColor}`) {
    
    // Define functions to apply and remove the border
    function applyBorder() {
        element.style.border = `5px solid ${backgroundColor}`;
    }

    function removeBorder() {
        element.style.border = currentBorder; // Revert to original border
    }

    // Apply and remove the border in a sequence for a flashing effect
    applyBorder(); // Initial highlight
    setTimeout(removeBorder, 200); // Remove after 200ms
    setTimeout(applyBorder, 400);  // Re-apply after 400ms
    setTimeout(removeBorder, 600); // Remove again after 600ms
    setTimeout(applyBorder, 800);  // Final re-apply after 800ms
    setTimeout(removeBorder, 1000); // Final removal after 1 second
}


}



export function MatchGuessing() {
    // find problematic spans
    const problematicSpans = document.querySelectorAll('span.citation:not([found])');
    const referenceFrames = document.querySelectorAll('.Reference-frame');

    problematicSpans.forEach(span => {
        BestMatch(span, referenceFrames)
    })

}


let currentMatchIndex = -1; // Initialize outside of the function to track the current match

function searchRef() {
    // Get the search term from the input field
    const searchTerm = event.target.value.toLowerCase();

    // Find the element by its content or ID
    const referenceFrames = Array.from(document.querySelectorAll('.Reference-frame'));

    // Filter the elements that match the search term
    const matchingElements = referenceFrames.filter((element) =>
        element.textContent.toLowerCase().includes(searchTerm) || element.id.toLowerCase() === searchTerm
    );

    const totalMatches = matchingElements.length; // Store total matches

    if (totalMatches === 0) {
        console.log('No matches found.');
        document.getElementById('SearchhitsRef').textContent = 'No matches found.';
        return; // No matches, exit function
    }

    // Update the current match index, cycling through the matches
    currentMatchIndex = (currentMatchIndex + 1) % totalMatches;

    // Scroll to the current match
    const element = matchingElements[currentMatchIndex];
    element.scrollIntoView({behavior: 'smooth', block: 'center'})

    // Save the current background color to restore it later
    const originalColor = element.style.backgroundColor;

    // Highlight the current element to visually indicate the match
    element.style.backgroundColor = 'yellow';
    setTimeout(() => {
        element.style.backgroundColor = originalColor;
    }, 200);

    // Display the current match index and total matches in the div with id 'SearchhitsRef'
    const searchHitsRef = document.getElementById('SearchhitsRef');
    searchHitsRef.textContent = `${currentMatchIndex + 1}/${totalMatches}`;
    searchHitsRef.style.fontSize = '12px'; // Adjust the font size as needed
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
        document.getElementById('SearchCounter').textContent = '0/0'; // Show 0/0 if no matches
        return; // No matches, exit function
    }

    // Keep track of the current match index in a global or higher-scoped variable
    // Assuming currentMatchIndex is declared globally or in a parent scope
    if (typeof currentMatchIndex === 'undefined') {
        currentMatchIndex = 0; // Initialize if not defined
    }

    // Increment index and loop around if necessary
    currentMatchIndex = (currentMatchIndex + 1) % matchingElements.length;
    
    // Scroll to the next match
    const element = matchingElements[currentMatchIndex];    
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const ElementColor = element.style.backgroundColor;

    // Optional: highlight the element to visually indicate the match
    element.style.backgroundColor = 'yellow';
    
    setTimeout(() => {
        element.style.backgroundColor = ElementColor;
    }, 200);

    // Update the SearchCounter with the current index and total matches
    document.getElementById('SearchCounter').textContent = `${currentMatchIndex + 1}/${matchingElements.length}      `;
    document.getElementById('SearchCounter').style.fontSize = '12px'
}



function UpdateFramesAndMatches() {

///// update Span Titles
const citationElements = document.querySelectorAll('span.citation[cleanedCit]');
citationElements.forEach(function (element) {
    FormulateTooltip(element)
});

    // Get the accent color from the CSS variable
    const accentColor = "rgb(227, 87, 75)" 

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


    // Create the clickable 'countWithoutMatch' element
    const countWithoutMatchElement = document.createElement('span');
    countWithoutMatchElement.innerHTML = `Found ${countWithoutMatch}/${referenceFrames.length} references without match:`;
    countWithoutMatchElement.style.cursor = 'pointer'; // Make it clickable
    countWithoutMatchElement.style.textDecoration = 'underline'; // Underline the clickable number

    // Create the text around the clickable number
    const withoutMatchText = document.createTextNode(` (${referenceFrames.length} total)`);

    // Append the elements inside the bold wrapper
    
    boldWrapper.appendChild(countWithoutMatchElement);
    //boldWrapper.appendChild(withoutMatchText);


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
            element.scrollIntoView({behavior: 'smooth', block: 'center'})
            DoHighlight(element)
            unmatchedClickCount++; // Cycle to the next unmatched reference on each click
        }
    });
}


    const ThirdFrameHead = document.getElementById('ThirdFrameHead');
    // Append the text to the existing paragraph
    if (ThirdFrameHead) {
        const totalCitations = document.querySelectorAll('span.citation').length;
        const matchedCitations = document.querySelectorAll('span.citation[found="true"]').length;
        
        const ThirdFrameTitle = document.getElementById("ThirdFrameTitle")

        ThirdFrameTitle.innerHTML = `Found ${totalCitations - matchedCitations} in-text citations without match (${totalCitations} total)`;

        }
    
}




function onDragStartHandler() {
    // Loop through each drop zone and apply a highlight effect
    const dropZones = document.querySelectorAll('#ReferenceFrame, #Trash1');
    /*
    dropZones.forEach(dropZone => {
        // Apply the border highlight (corrected syntax)
        dropZone.style.border = '4px solid yellow';  // Example: highlight with red border

        // Remove the highlight after 1 second (1000 milliseconds)
        setTimeout(() => {
            dropZone.style.border = '0px solid red';  // Reset the border to its original state
        }, 1000);
    });
    */
}


export function DragDrop() {
    let dragStartTime = 0;
    let draggedElement = null; // Keep track of the dragged element

    // Select all draggable span elements with class "citation"
    const draggables = document.querySelectorAll('span.citation[cleanedCit], .InTexts');
    
    // Select all drop zones with class "Reference-frame"
    const dropZones = document.querySelectorAll('.Reference-frame, .Trashs');

    // Get CSS variable values for secondary and accent colors
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

    // Make elements draggable and add event listeners
    draggables.forEach(draggable => {
        draggable.setAttribute('draggable', 'true');
        draggable.style.cursor = 'grab'
        // Drag start event
        draggable.addEventListener('dragstart', (e) => {
            dragStartTime = new Date().getTime(); // Track drag start time
            draggedElement = draggable; // Keep reference to the dragged element
            e.dataTransfer.setData('text/plain', ''); // Some browsers require data to be set
            onDragStartHandler(dropZones)
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
            dropZone.style.border = '4px solid yellow';  // Example: highlight with red border
        });

        // Drag leave event (removes hover state when dragging leaves the zone)
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.border = '';
        });

        // Drop event (handles the actual drop)
        dropZone.addEventListener('drop', (e) => {

            e.preventDefault();
            dropZone.classList.remove('hover');
            dropZone.style.border = '';
                console.log(draggedElement)
                let draggedElementToUse = draggedElement; // Initialize to use the original draggedElement
                const draggableSpans = document.querySelectorAll('span.citation[cleanedCit]');
                // Check if draggedElement is of class 'InTexts'
                if (draggedElement.classList.contains('InTexts')) {
                    // Loop through all 'span.citation' elements to find the corresponding one
                    
                    
                    draggableSpans.forEach((dragged) => {
                        //console.log(dragged.getAttribute("cleanedCit").trim(),draggedElement.innerHTML.trim())
                        // Check if the 'title' of the 'span' matches the 'innerHTML' of the InTexts element
                        if (decodeHTMLEntities(dragged.getAttribute("cleanedCit").trim()) === decodeHTMLEntities(draggedElement.getAttribute("cleanedCit").trim())) {
                            draggedElementToUse = dragged; // Use the matching span as the new draggedElement
                            //console.log(draggedElementToUse)
                            return; // Exit the loop after finding the first match
                        }
                    });
                }
            
                // Now that we have the correct draggedElement (either the original or the matching span)
                let ListSimilar = [];
                
                // Find similar draggable elements
                draggableSpans.forEach((dragged) => {
                    if (dragged.getAttribute("cleanedCit").trim() === draggedElementToUse.getAttribute("cleanedCit").trim()) {
                        ListSimilar.push(dragged);
                    }
                });
                            // If the drop zone is a valid "Reference-frame" element

            if (dropZone.classList.contains('Reference-frame')) {
                // Perform actions for each similar dragged element
                ListSimilar.forEach((dragged) => {
                    MatchDragged(dragged, dropZone);
                });
            }
            
            
            else if (dropZone.classList.contains('Trashs')) {  /////////////////////////////////////////////////////////////////// not working as the other dom elements cant be dropzones
                ListSimilar.forEach((dragged) => {
                    DeleteDragged(dragged, dropZone);
                });
            
            }           
            UpdateFramesAndMatches()
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

                draggedElement.setAttribute('found', 'true');

        
                const element = dropZone
                DoHighlight(element)
                element.scrollIntoView({behavior: 'smooth', block: 'center'})

            
                // 3. Append a link to the drop zone
                console.log(dropZone.querySelector('.SingleRef'))
                let currentLinks = dropZone.querySelector('.SingleRef').MatchedWith;
                if (!currentLinks) {
                    currentLinks = []
                }
                removeLinksRelatedToSpan(draggedElement);
                currentLinks.push(draggedElement);
            
                ShowLinks(dropZone.querySelector('.SingleRef'));
            
                // 4. Go through all .InTexts elements and delete the one that matches the dragged element
                const inTextElements = document.querySelectorAll('.InTexts'); // Select all elements with the class '.InTexts'
            
                inTextElements.forEach(inText => {
                    // Check if the innerHTML of the .InTexts element matches the title of the draggedElement
                    if (decodeHTMLEntities(inText.getAttribute('cleanedCit').trim()) === decodeHTMLEntities(draggedElement.getAttribute('cleanedCit').trim())) {
                        // Remove the matching element
                        inText.remove();
                    }
                });        

    }

    function DeleteDragged(draggedElement, dropZone) {
        
        draggedElement.style.backgroundColor = "";
        removeLinksRelatedToSpan(draggedElement)
        draggedElement.setAttribute('found', 'deleted');
        draggedElement.classList.remove("citation")
        const inTextElements = document.querySelectorAll('.InTexts'); // Select all elements with the class '.InTexts'
            
        inTextElements.forEach(inText => {
            // Check if the innerHTML of the .InTexts element matches the title of the draggedElement
            if (decodeHTMLEntities(inText.getAttribute('cleanedCit').trim()) === decodeHTMLEntities(draggedElement.getAttribute('cleanedCit').trim())) {
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
            if (singleRef && singleRef.MatchedWith) {
                // Find the index of the span in the myLinks array
                const index = singleRef.MatchedWith.indexOf(span);
                
                // If span is in myLinks (index >= 0), remove it
                if (index > -1) {
                    // Remove the span from myLinks array
                    singleRef.MatchedWith.splice(index, 1);
    
                    // Update the links in the UI by calling ShowLinks
                    ShowLinks(singleRef);
                }
            }
        });
    }
    
}



function FormulateTooltip(element) {
    if (element.getAttribute('Found') === 'true') {
        element.setAttribute('tooltip', `Identified in-text citation: <b> ${element.getAttribute("cleanedcit").split(";").join(" ")} </b> <br>Successfully matched with reference!`);
    } else if (!element.getAttribute('Found')) {
        element.setAttribute('tooltip', `Identified in-text citation: <b> ${element.getAttribute("cleanedcit").split(";").join(" ")} </b> <br>No matching reference found! Click for suggestions and assign manually by dragging this element onto the respective reference.`);
    } else if (element.getAttribute('Found') === 'ambig') {
        element.setAttribute('tooltip', `Identified in-text citation: <b> ${element.getAttribute("cleanedcit").split(";").join(" ")} </b> <br>Found more than one matching reference! Click for suggestions and reassign manually by dragging this element onto the respective reference.`)
    }
    else if (element.getAttribute('Found') === 'year') {
        element.setAttribute('tooltip', `Identified in-text citation: <b> ${element.getAttribute("cleanedcit").split(";").join(" ")} </b> <br>Check puplication year! Reassign manually by dragging this element onto the respective reference.`)
    }
    else if (element.getAttribute('Found') === 'byAbbr') {
        element.setAttribute('tooltip', `Identified in-text citation: <b> ${element.getAttribute("cleanedcit").split(";").join(" ")} </b> <br>Matched by abbreviation!`)
    }    else if (element.getAttribute('Found') === 'typo') {
        element.setAttribute('tooltip', `Identified in-text citation: <b> ${element.getAttribute("cleanedcit").split(";").join(" ")} </b> <br>Check spelling! Reassign manually by dragging this element onto the respective reference.`)
    }
    

}


export function thirdFrame() {
    ///// Set Span Titles
const citationElements = document.querySelectorAll('span.citation[cleanedCit]');



citationElements.forEach(function (element) {

    FormulateTooltip(element)
    
});


    const OuterFrame = document.getElementById('thirdframe');
    OuterFrame.innerHTML = "";
    OuterFrame.style = "display: block; resize: vertical;";

    OuterFrame.style.flexShrink = '0'; // Set initial max height
    OuterFrame.style.maxHeight = '40%';
    OuterFrame.style.minHeight = '40px';
    // Create the third frame for in-text citations (collapsible frame)
    const helper = document.createElement('div')
    const InTextCitFrame = document.createElement('div');
    InTextCitFrame.id = "InTextCitFrame";
    InTextCitFrame.className = 'search-string-frame'; // Assign collapsible class
    InTextCitFrame.style.marginBottom = "0px";

    // Create the toggle button for expanding/collapsing the in-text citation frame


    // Function to render only problematic spans
    const renderSpans = () => {
        // Clear existing paragraphs in InTextCitFrame (if any)
        const existingParagraphs = InTextCitFrame.querySelectorAll('.Reference-frame');
        existingParagraphs.forEach(paragraph => paragraph.remove());

        // Select only problematic spans (i.e., spans without the 'found' attribute)
        const problematicSpans = document.querySelectorAll('span:not([found="true"])');
; // Show only problematic spans
        console.log(problematicSpans)



        // Loop through each problematic span and create a clickable list item
        problematicSpans.forEach((span, index) => {
            const cleanedCit = span.getAttribute('cleanedCit'); // Get the cleaned citation text

            function capitalizeFirstLetter(string) {
                if (string === "al" || string === "al." || string === "et" || string === "and" || string === "und") {return string} else
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            if (cleanedCit) { // Only add if cleanedCit is available
                const InTextCitFrameParagraph = document.createElement('div');
                InTextCitFrameParagraph.className = 'InTexts';
                InTextCitFrameParagraph.innerHTML = cleanedCit.split(";").map(stri => capitalizeFirstLetter(stri)).join(" "); // Display the cleaned citation text
                InTextCitFrameParagraph.setAttribute("cleanedCit", cleanedCit)
                InTextCitFrameParagraph.MatchedWith = span.MatchedWith
                InTextCitFrameParagraph.ParentSpan = span; 
                span.ChildIntext = InTextCitFrameParagraph
                InTextCitFrameParagraph.id = `InTexts-${index + 1}`
                InTextCitFrameParagraph.setAttribute("tooltip", span.getAttribute("tooltip")) 
                // Ensure the width of the div fits its content
                if (span.getAttribute("found")) {
                    if (span.getAttribute("found") === "byAbbr") {
                    span.style.backgroundColor = "yellow"
                    InTextCitFrameParagraph.style.backgroundColor = "yellow"
                    } else {
                    span.style.backgroundColor = "orange"
                    InTextCitFrameParagraph.style.backgroundColor = "orange"

                    }
                } else {
                    span.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
                    InTextCitFrameParagraph.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
                }




                // Append the paragraph to the InTextCitFrame
                InTextCitFrame.appendChild(InTextCitFrameParagraph);
            }
        });
    };

    const ThirdFrameHead = document.createElement('div');
    ThirdFrameHead.id = 'ThirdFrameHead';
    //ThirdFrameHead.style.margin = ""
    OuterFrame.appendChild(ThirdFrameHead);
    const ThirdFrameTitle = document.createElement('b');
    ThirdFrameTitle.id = "ThirdFrameTitle"

    ThirdFrameHead.appendChild(ThirdFrameTitle)

    const sortIcon = document.createElement('div');
    const Helperdiv = document.createElement('div');
    const Questionsmark = document.createElement('div')
    Questionsmark.innerText = "?"
    Questionsmark.setAttribute("tooltip", 
        "<strong>In-Text Citation Issues</strong><br>" +
        "Here you find all identified in-text citations that show problems when matched against the reference list. Problems can be:" +
        "<ul>" +
          "<li><span style='background-color: #E3574B;' class='citationDESK'>Author Year</span> In-text citations without a matching reference in the reference list. You can manually match these by dragging and dropping the citation onto the corresponding entry in the reference list below.</li>" +
          "<li><span style='background-color: orange;' class='citationDESK'>Author Year</span> In-text citations with a matching reference, but containing typos or incorrect publication years. You can manually match these by dragging and dropping the citation onto the corresponding entry in the reference list below.</li>" +
          "<li><span style='background-color: yellow;' class='citationDESK'>Author Year</span> In-text citations matched through abbreviations.</li>" +
        "</ul>"
    );
    
      
    Questionsmark.className = "Explanations"
    Helperdiv.id = "Helperdiv";
    sortIcon.id = "sortIcon";
    sortIcon.className = "sorting"
    sortIcon.innerHTML = "ABC" 
    sortIcon.style.cursor = "pointer";
    sortIcon.setAttribute("tooltip", "Sort in-text citations w/o match<br>by alphabetical order");
    sortIcon.addEventListener("click", sorting);
    ThirdFrameHead.appendChild(Helperdiv)
    
    Helperdiv.appendChild(sortIcon)
    const trash = document.createElement('div');
    trash.id = "Trash1";
    trash.className = "Trashs"
    trash.setAttribute("tooltip", "Drag erroneous in-text citations here")    
    Helperdiv.appendChild(trash)
    Helperdiv.appendChild(Questionsmark)

    // Append the toggle button (if necessary) to the InTextCitFrame


    // Append the InTextCitFrame to the scholar container
    OuterFrame.appendChild(InTextCitFrame);

    // Initial render showing only problematic spans
    renderSpans();
    UpdateFramesAndMatches(); // Assuming UpdateFrames() is needed elsewhere



    createTooltips() ///////////////////////////////////////////////////////////////////////////////////////////////////////////MOVE
}

// Define the sorting function
function sorting() {
    const sortIcon = document.getElementById("sortIcon");
    const parentDiv = document.getElementById('InTextCitFrame'); 
    const divsArray = Array.from(parentDiv.children); 

    if (sortIcon.innerHTML === "ABC") {
        // Sort alphabetically based on text content
        divsArray.sort((a, b) => a.textContent.localeCompare(b.textContent));

        // Adapt tooltip to sorting procedure
        sortIcon.setAttribute("tooltip", "Sort in-text citations w/o match<br>by order of appearance");
        createTooltips();

        // Change sortIcon's innerHTML to "1.2.3."
        sortIcon.innerHTML = "1.2.3.";
    } else if (sortIcon.innerHTML === "1.2.3.") {
        // Sort numerically based on the div IDs
        divsArray.sort((a, b) => {
            const idA = parseInt(a.id.split('-')[1]); // Get the numeric part of the ID
            const idB = parseInt(b.id.split('-')[1]); // Get the numeric part of the ID
            return idA - idB; // Compare numerically
        });

        // Adapt tooltip to sorting procedure
        sortIcon.setAttribute("tooltip", "Sort in-text citations w/o match<br>by alphabetical order");
        createTooltips();

        // Change sortIcon's innerHTML back to "ABC"
        sortIcon.innerHTML = "ABC";
    }

    // Clear the parent div and append the sorted divs
    parentDiv.innerHTML = "";
    divsArray.forEach(div => parentDiv.appendChild(div));
}

  
function createTooltips() {
    const citationElements = document.querySelectorAll('span.citation, div.InTexts, div.Reference-frame, div.Trashs, div.sorting, div.Explanations');


    citationElements.forEach(cit => {
        // Create a custom tooltip element
        const tooltip = document.createElement('div');
        tooltip.classList.add('custom-tooltip');
        tooltip.innerHTML = cit.getAttribute('tooltip'); // Use the title attribute as the tooltip text

        // Hide the title attribute to prevent the default browser tooltip
        cit.removeAttribute('title');

        /*
        // Style the tooltip
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'black';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.pointerEvents = 'none';  // Make sure the tooltip doesn't interfere with mouse events
        tooltip.style.opacity = '0';           // Initially hidden
        tooltip.style.transition = 'opacity 0.3s';  // Smooth fade-in effect
        tooltip.style.zIndex = '1000';         // Ensure it's above other elements
        */

        // Append the tooltip to the body
        document.body.appendChild(tooltip);

        // Function to show tooltip
        const showTooltip = (event) => {
            tooltip.style.opacity = '1';
            const rect = cit.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX}px`;  // Adjust for scrolling
            tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;  // Place above the element
        };

        // Function to hide tooltip
        const hideTooltip = () => {
            tooltip.style.opacity = '0';
        };

        // Event listeners for mouse enter and leave
        cit.addEventListener('mouseover', showTooltip);
        cit.addEventListener('mouseleave', hideTooltip);

        // Event listener for click
        cit.addEventListener('click', function(event) {
            if (tooltip.style.opacity === '1') {
                hideTooltip();
            } else {
                showTooltip(event);
            }
        });

        // Optional: Update the tooltip position with the mouse movement
        cit.addEventListener('mousemove', function(event) {
            tooltip.style.left = `${event.pageX + 10}px`;  // Offset from the cursor
            tooltip.style.top = `${event.pageY + 10}px`;
        });

        // Hide the tooltip when clicking elsewhere on the page
        document.addEventListener('click', function(event) {
            if (!cit.contains(event.target) && tooltip.style.opacity === '1') {
                hideTooltip();
            }
        });
    });
}

  

export function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
  }
  
  // Function to hide the loading spinner
 export function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
  }


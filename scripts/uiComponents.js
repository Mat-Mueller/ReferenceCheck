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
    
["hf_both", "hf_header_only", "hf_footer_only", "hf_none"].forEach(id => {
    document.getElementById(id).style.display = "none";
});

// Show the correct one
if (hasHeader && hasFooter) {
    document.getElementById("hf_both").style.display = "block";
} else if (hasHeader) {
    document.getElementById("hf_header_only").style.display = "block";
} else if (hasFooter) {
    document.getElementById("hf_footer_only").style.display = "block";
} else {
    document.getElementById("hf_none").style.display = "block";
}
    /// Reference section Stuff

    const settings2 = document.getElementById("settings-2")
    const settings3 = document.getElementById("settings-3")
    document.getElementById("start_ref_found").style.display = startPoint ? "inline" : "none";
    document.getElementById("start_ref_missing").style.display = startPoint ? "none" : "inline";

    document.getElementById("end_ref_found").style.display = endPoint ? "inline" : "none";
    document.getElementById("end_ref_missing").style.display = endPoint ? "none" : "inline";

    const SetManually1 = document.getElementById('SetStartManually');
    SetManually1.addEventListener('click', async function () {
        activateButton(SetManually1);

        // Show the message for manual click instruction
        document.getElementById("start_ref_initial").style.display = "inline";
        document.getElementById("start_ref_set").style.display = "none";
        document.getElementById("start_ref_found").style.display = "none";
        document.getElementById("start_ref_missing").style.display = "none";

        startPoint = await setStart();

        deactivateButton(SetManually1);

        // After setting the start point
        document.getElementById("start_ref_initial").style.display = "none";
        document.getElementById("start_ref_set").style.display = "inline";

        if (startPoint && endPoint) {
            NowSeperate();
        }
    });

    
        const SetManually2 = document.getElementById('SetEndManually');
        SetManually2.addEventListener('click', async function () {
            activateButton(SetManually2);

            // Show the instruction to click
            document.getElementById("end_ref_initial").style.display = "inline";
            document.getElementById("end_ref_set").style.display = "none";
            document.getElementById("end_ref_found").style.display = "none";
            document.getElementById("end_ref_missing").style.display = "none";

            endPoint = await setEnd();

            deactivateButton(SetManually2);

            // After setting the end point
            document.getElementById("end_ref_initial").style.display = "none";
            document.getElementById("end_ref_set").style.display = "inline";

            if (startPoint && endPoint) {
                NowSeperate();
            }
        });

    const settings4 = document.getElementById("settings-4")
    const Cont =  document.getElementById("continue-button")
    
    const subdivButton = document.getElementById("subdivButton");
    subdivButton.innerText = window.langDict["separate_by_paragraph"];

    const subdivButton2 = document.getElementById("subdivButton2");
    subdivButton2.innerText = window.langDict["separate_by_indent"];  
    

    
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
            document.getElementById("ref_missing").style.display = "inline"
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
            document.getElementById("ref_missing").style.display = "inline"
            Cont.disabled = true;
        }
    });
    
    

    if (startPoint && endPoint) {
        NowSeperate()
        // Get the element by its ID
        const element = document.getElementById("userSelectText");
        element.textContent = window.langDict["ref_id_success"];
        document.getElementById("UserSelectContinue").disabled = false
        document.getElementById("userSelectHeading").textContent = window.langDict["reference_ok"]
    } else { 
       document.getElementById("ref_missing").style.display = "inline"
        Cont.disabled = true
        document.getElementById("userSelectHeading").textContent = window.langDict["reference_not_ok"]
        document.getElementById("userSelectText").textContent = window.langDict["ref_id_unsuccess"];
        document.getElementById("suc_icon").textContent = "⚠";
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


        const title = `<b>${window.langDict["ref_sep_title"]}</b><br>`;
        let stats = window.langDict["ref_sep_stats"]
            .replace("{{paragraphCount}}", paragraphCount)
            .replace("{{indentCount}}", indentCount);

        document.getElementById("settings-4text").innerHTML = title + stats;



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
            if (ratioParagraph >= ratioIndent) {
                activateButton(subdivButton);
                deactivateButton(subdivButton2);
                referenceCount = subdivide(startPoint, endPoint, "byParagraph");
                document.getElementById("settings-4text").innerHTML += " " + window.langDict["ref_sep_suggest_paragraph"];
            } else {
                activateButton(subdivButton2);
                deactivateButton(subdivButton);
                referenceCount = subdivide(startPoint, endPoint, "byIndent");
                document.getElementById("settings-4text").innerHTML += " " + window.langDict["ref_sep_suggest_indent"];
            }
        } else if (ratioParagraph > 1.7 && ratioParagraph < 4) {
            activateButton(subdivButton);
            deactivateButton(subdivButton2);
            referenceCount = subdivide(startPoint, endPoint, "byParagraph");
            document.getElementById("settings-4text").innerHTML += " " + window.langDict["ref_sep_suggest_paragraph"];
        } else if (ratioIndent > 1.7 && ratioIndent < 4) {
            activateButton(subdivButton2);
            deactivateButton(subdivButton);
            referenceCount = subdivide(startPoint, endPoint, "byIndent");
            document.getElementById("settings-4text").innerHTML += " " + window.langDict["ref_sep_suggest_indent"];
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

        resultParagraph.innerHTML = `${window.langDict["best_crossref_match"]}: <br>` + `
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
            showAbstractLink.innerText = window.langDict["show_abstract"];

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
        const key = matchCount === 1 ? "instance_single" : "instance_plural";
SingleRef.innerHTML = `<b>${matchCount}</b> ${window.langDict[key]}`;
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
                
                ReferenceFrameParagraph.style.background = `  radial-gradient(circle at center, white 70%,${getComputedStyle(document.documentElement).getPropertyValue('--accent-color')}`;
                ReferenceFrameParagraph.setAttribute("data-match-status", "no-match");
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
    const OuterFrame        = document.getElementById('secondframe');
    OuterFrame.style = "display: block"; // same as before

    // Use existing DOM instead of createElement
    const ReferenceFrame    = document.getElementById('ReferenceFrame');
    const referenceHeadline = document.getElementById('referenceHeadline');

    const LeftContainer     = document.getElementById('LeftContainer');
    const referenceTitle    = document.getElementById('References');
    referenceTitle.style.margin = "0px";

    const RightContainer    = document.getElementById('RightContainer');
    const CrossRefbutton    = document.getElementById('CrossRefbutton');
    const Searchhits        = document.getElementById('SearchhitsRef');

    const searchInput       = document.getElementById('searchField');
    searchInput.placeholder = window.langDict["search_placeholder"];
    searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') searchRef(event);
    });

    const Questionsmark     = RightContainer.querySelector('.Explanations');
    Questionsmark.innerText = "?";
    Questionsmark.setAttribute("tooltip", "");
    Questionsmark.className = "Explanations";
    Questionsmark.setAttribute("tooltip", window.langDict["tooltip_reference_list"]);






    // CrossRef button: same behavior
    CrossRefbutton.style.display = "none";
    CrossRefbutton.textContent = window.langDict["hide_crossref_results"];
    CrossRefbutton.addEventListener("click", () => {
    const resultFrames = document.querySelectorAll("div.result-frame");
    const anyVisible = Array.from(resultFrames).some(div => div.style.display !== "none");
    resultFrames.forEach(div => { div.style.display = anyVisible ? "none" : "block"; });
    CrossRefbutton.textContent = anyVisible
        ? window.langDict["show_crossref_results"]
        : window.langDict["hide_crossref_results"];
    });





    document.querySelectorAll('#ReferenceFrame .Reference-frame').forEach(el => el.remove());
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
       ReferenceFrameParagraph.setAttribute(
                'tooltip',
                `${window.langDict["detected_authors_year"]} <br> ${lastNames} (${MyYear})`
            );
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
        bestMatchHeading.innerHTML = `<strong>${window.langDict["best_crossref_match"]}</strong>`;
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

        const textNode = document.createTextNode(window.langDict["best_crossref_match"]);
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
  if (!element) return;

  let col = getComputedStyle(element).backgroundColor;
  if (!col || col === "rgba(0, 0, 0, 0)") {
    col = getComputedStyle(element).borderColor;
  }

  const flashCol = getContrastingFlashColor(col);
  element.style.setProperty('--flash-color', flashCol);

  const prevPos = getComputedStyle(element).position;
  if (prevPos === 'static') element.style.position = 'relative';

  element.classList.add('flash-inward');

  element.addEventListener('animationend', () => {
    element.classList.remove('flash-inward');
    element.style.removeProperty('--flash-color');
    if (prevPos === 'static') element.style.position = '';
  }, { once: true });
}


function getContrastingFlashColor(baseColor) {
  // Parse rgb(...) or rgba(...)
  const rgb = baseColor.match(/\d+/g).map(Number);
  if (rgb.length < 3) return 'rgba(255,0,0,0.8)'; // fallback red

  // Calculate luminance
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;

  if (lum > 0.6) {
    // light color → choose a darker, more saturated version
    return `rgba(${rgb[0] * 0.5}, ${rgb[1] * 0.5}, ${rgb[2] * 0.5}, 0.9)`;
  } else {
    // dark color → choose a lighter/whiter version
    return `rgba(${Math.min(255, rgb[0] + 150)}, ${Math.min(255, rgb[1] + 150)}, ${Math.min(255, rgb[2] + 150)}, 0.9)`;
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
        document.getElementById('SearchhitsRef').textContent = window.langDict["no_matches_found"];
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
    DoHighlight(element)

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


    console.log("updating frames and matches")
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
        if (reference.getAttribute("data-match-status") === "no-match") {  
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
        countWithoutMatchElement.innerHTML = 
            window.langDict["refs_without_match"]
                .replace("{count}", countWithoutMatch)
                .replace("{total}", referenceFrames.length);
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

        ThirdFrameTitle.innerHTML = window.langDict["citations_without_match"]
            .replace("{{unmatched}}", totalCitations - matchedCitations)
            .replace("{{total}}", totalCitations);
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
            //dropZone.style.border = '4px solid yellow';  // Example: highlight with red border
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

        console.log("calling matcheddragged")
        console.log(dropZone)
                // 1. Set the background color to secondary color
                draggedElement.style.backgroundColor = secondaryColor;
                dropZone.style.background = "white"
                dropZone.setAttribute("data-match-status", "");
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
    window.MatchDragged = MatchDragged;

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
        UpdateFramesAndMatches()

    }

    window.DeleteDragged = DeleteDragged;

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
    Questionsmark.setAttribute("tooltip", window.langDict["tooltip_intext_issues"]);
    
      
    Questionsmark.className = "Explanations"
    Helperdiv.id = "Helperdiv";
    sortIcon.id = "sortIcon";
    sortIcon.className = "sorting"
    sortIcon.innerHTML = "ABC" 
    sortIcon.style.cursor = "pointer";
    sortIcon.setAttribute("tooltip", window.langDict["tooltip_sort_icon"]);
    sortIcon.addEventListener("click", sorting);
    ThirdFrameHead.appendChild(Helperdiv)
    
    Helperdiv.appendChild(sortIcon)
    const trash = document.createElement('div');
    trash.id = "Trash1";
    trash.className = "Trashs"
    trash.setAttribute("tooltip", window.langDict["tooltip_trash"]);   
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
        sortIcon.setAttribute("tooltip", window.langDict["tooltip_sort_order"]);
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
        sortIcon.setAttribute("tooltip", window.langDict["tooltip_sort_alpha"]);        createTooltips();

        // Change sortIcon's innerHTML back to "ABC"
        sortIcon.innerHTML = "ABC";
    }

    // Clear the parent div and append the sorted divs
    parentDiv.innerHTML = "";
    divsArray.forEach(div => parentDiv.appendChild(div));
}

  


  

export function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
  }
  
  // Function to hide the loading spinner
 export function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
  }

/* FormulateTooltip v2 — HTML, icons, selectable lists, i18n-first */
function FormulateTooltip(element, {
  outAttr = "tooltip",          // where to store the HTML (was "tooltip" in your code)
  maxItems = 5,                 // how many matches/suggestions to show initially
  suggestions = null,           // optional: array of low-confidence suggestions (strings)
  suggestionText = null         // optional: typo correction preview string
} = {}) {
  const dict = (window.langDict || {});

  // --- helpers -------------------------------------------------------------
  const decodeHtml = s => { const t = document.createElement('textarea'); t.innerHTML = s || ""; return t.value; };
  const esc = s => String(s ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

  const get = (el, name) => el?.getAttribute?.(name);
  

  
const normCit = decodeHtml(get(element, "cleanedcit") || "")
   .split(";").join(" ")
   .replace(/\s+/g, " ")
   .trim();

  // tolerant Found/found
  const foundAttr = get(element, "found") ?? get(element, "Found");

  // prefer cleanedtext; else authors (year)
const refToString = (n) => {
  if (!n || !n.getAttribute) return "";
  const cleaned = decodeHtml(n.getAttribute("cleanedtext") || "").trim();
  const year    = decodeHtml(n.getAttribute("year") || "").trim();
  return year ? `${cleaned} (${year})` : cleaned;
};

  // gather matches from your element.MatchedWith
  const raw = Array.isArray(element.MatchedWith)
    ? element.MatchedWith
    : (element.MatchedWith ? [element.MatchedWith] : []);
  const matches = [...new Set(raw.map(refToString).filter(Boolean))];

  // status mapping (explicit beats heuristic)
  let status =
    foundAttr === "true"  ? "found"  :
    foundAttr === "ambig" ? "ambig"  :
    foundAttr === "year"  ? "year"   :
    foundAttr === "byAbbr"? "byAbbr" :
    foundAttr === "typo"  ? "typo"   :
    (!normCit ? "invalid" :
      (matches.length === 0 ? "not_found" : "not_found_with_suggestions"));

  // --- i18n (text only; HTML comes from code) ------------------------------
  const t = (k, d) => {
    const v = dict[k];
    return (v && v !== "undefined") ? v : d;
  };
  
  

  const label = {
    found:  t("tooltip_found_label", "Gefunden"),
    ambig:  t("tooltip_ambig_label", "Mehrdeutig"),
    year:   t("tooltip_year_label", "Jahres-Treffer"),
    byAbbr: t("tooltip_byAbbr_label", "Abkürzungs-Treffer"),
    typo:   t("tooltip_typo_label", "Möglicher Tippfehler"),
    not_found: t("tooltip_not_found_label", "Nicht gefunden"),
    not_found_with_suggestions: t("tooltip_not_found_sugg_label", "Nicht gefunden – Vorschläge"),
    invalid: t("tooltip_invalid_label", "Ungültige Zitation")
  }[status];

  const mainLine = ({
    found:  t("tooltip_found", "Erkannte In-Text-Zitation: {{citation}}"),
    ambig:  t("tooltip_ambig", "Mehrdeutig: {{citation}}"),
    year:   t("tooltip_found", "Erkannte In-Text-Zitation: {{citation}}"),
    byAbbr: t("tooltip_byAbbr", "Über Abkürzung erkannt: {{citation}}"),
    typo:   t("tooltip_typo", "Nahe Übereinstimmung: {{citation}}"),
    not_found: t("tooltip_not_found", "Nicht gefunden: {{citation}}"),
    not_found_with_suggestions: t("tooltip_not_found_with_suggestions", "Keine eindeutige Übereinstimmung für: {{citation}}"),
    invalid: t("tooltip_invalid", "Ungültige Zitation")
  }[status] || "").replace("{{citation}}", (normCit));

  const H_MATCHES = t("tooltip_matches", "Gefundene Referenzen:");
  const H_SUGGS   = t("tooltip_suggestions_header", "Vorschläge (niedrige Übereinstimmung)");
  const MORE_FMT  = t("tooltip_more", "+{{count}} weitere Treffer");
  const HINT = {
    ambig: t("tooltip_hint_select", "Bitte die richtige Referenz auswählen."),
    year:  t("tooltip_hint_year_mismatch", "Das Jahr im In-Text-Zitat stimmt nicht mit den gefundenen Referenzen überein."),
    typo:  t("tooltip_hint_typo", "Bitte bestätigen Sie die Zuordnung. Kleinere Abweichungen im Text wurden erkannt."),
    not_found: t("tooltip_hint_check_spelling", "Prüfen Sie Schreibweise, Autorenreihenfolge und Jahr.")
  }[status];

  // --- header with icons ---------------------------------------------------
const elId = element.id || `cit-${Math.random().toString(36).slice(2)}`;
element.id = elId; // ensure the element has an id

const headerHTML = `
  <div class="tt-status">
    <span class="tt-pill tt-pill--${esc(status)}">${esc(label)}</span>
    <div class="tt-actions">
      <button class="tt-iconbtn"
        onclick="window.DeleteDragged && window.DeleteDragged(document.getElementById('${elId}'), null); const tip=this.closest('.custom-tooltip'); if(tip){ tip.style.opacity='0'; tip.style.visibility='hidden'; }"
        aria-label="${esc(t('tooltip_action_remove','Kein Zitat'))}"
        title="${esc(t('tooltip_action_remove','Kein Zitat'))}">
        <img src="/trash-can.png" style="width:16px;height:16px;">
      </button>
    </div>
  </div>
`;

  // --- main line (+ optional suggestion line for typo) ---------------------
  const suggestionLine = (status === "typo" && suggestionText)
    ? `<div class="tt-suggestion">${esc(t("tooltip_suggestion","Vorschlag: {{suggestion}}").replace("{{suggestion}}", suggestionText))}</div>`
    : "";

  const mainHTML = `
    <div class="tt-line">${esc(mainLine)}</div>
    ${suggestionLine}
    ${HINT ? `<div class="tt-hint">${esc(HINT)}</div>` : ""}
  `;


  
  // --- list builder (radio-style items with tags & show more) --------------
 const renderList = (title, arr, kind, extraTag = null, preselectIdx = null) => {
        if (!arr || !arr.length) return "";
    const shown = arr.slice(0, maxItems);
    const moreN = Math.max(0, arr.length - shown.length);
   const items = shown.map((txt, i) => {
    const selected = preselectIdx === i;
const refEl = raw[i]; 
  return `
    <li class="tt-item${selected ? " is-selected" : ""}"
         data-kind="${kind}"
         data-idx="${i}"
         data-ref-id="${refEl?.id || ''}"
         role="radio"
         aria-checked="${selected ? "true" : "false"}"
         tabindex="0">
      <span class="tt-choice" aria-hidden="true"></span>
      <span class="tt-text">${esc(txt)}</span>
      <span class="tt-tags">
        ${i === 0 ? `<span class="tt-chip">${esc(t("tooltip_tag_top","Höchste Übereinstimmung"))}</span>` : ""}
        ${extraTag ? `<span class="tt-chip">${esc(extraTag)}</span>` : ""}
      </span>
    </li>
  `;
}).join("");

    const more = moreN
      ? `<button class="tt-btn tt-btn--inline" data-action="show-more" data-kind="${kind}">${esc(MORE_FMT.replace("{{count}}", String(moreN)))}</button>`
      : "";

    return `
      <div class="tt-block">
        <div class="tt-header">${esc(title)}</div>
        <ul class="tt-list" role="radiogroup">${items}</ul>
        ${more}
      </div>
    `;
  };

  let listsHTML = "";
  if (status === "found" && matches.length === 1) {
    listsHTML = renderList(H_MATCHES, matches.slice(0,1), "matches");
  } else if (status === "ambig" || status === "year" || status === "byAbbr" || status === "typo") {
    const extra = status === "byAbbr" ? t("tooltip_tag_abbr","Abkürzung erkannt") :
                  null;
     const preselect = (status === "year" && matches.length === 1) ? 0 : null;
   listsHTML = renderList(H_MATCHES, matches, "matches", extra, preselect);
  } else if (status === "not_found_with_suggestions") {
    listsHTML = renderList(H_MATCHES, matches, "suggestions");
  }

  // --- footer actions ------------------------------------------------------
  const selectable = (status === "ambig" || status === "year" || status === "byAbbr" || status === "typo" || status === "not_found_with_suggestions");
  let footerHTML = "";
  if (selectable) {
        const hasPreselect = (status === "year" && matches && matches.length === 1);

    footerHTML = `
      <div class="tt-footer">
        <button class="tt-btn tt-btn--primary" data-action="confirm"${hasPreselect ? "" : " disabled"}>${esc(t("tooltip_btn_select","Auswählen"))}</button>      </div>
    `;
  } else if (status === "not_found") {
    // footerHTML = `
    //   <div class="tt-footer tt-footer--grid">
    //     <button class="tt-btn" data-action="search-again">${esc(t("tooltip_action_search_again","Erneut suchen"))}</button>
    //     <button class="tt-btn" data-action="link-manual">${esc(t("tooltip_action_link_manual","Manuell zuordnen…"))}</button>
    //     <button class="tt-btn" data-action="create-ref">${esc(t("tooltip_action_create_ref","Neue Referenz anlegen…"))}</button>
    //   </div>
    // `;
  }

  const html = `
    <div class="tt" role="tooltip" data-status="${esc(status)}">
      ${headerHTML}
      ${mainHTML}
      ${listsHTML}
      ${footerHTML}
    </div>
  `.trim();

  element.setAttribute(outAttr, html);
  return { html, status };
}

/* Optional: delegated interactions (radios, buttons). Call once. */
function WireTooltipInteractions(root = document, handlers = {}) {
  const h = {
    onRemove: handlers.onRemove || (()=>{}),
    onConfirm: handlers.onConfirm || (()=>{}),
    onNone: handlers.onNone || (()=>{}),
    onShowMore: handlers.onShowMore || (()=>{}),
    onSearchAgain: handlers.onSearchAgain || (()=>{}),
    onLinkManual: handlers.onLinkManual || (()=>{}),
    onCreateRef: handlers.onCreateRef || (()=>{}),
    onItemFocus: handlers.onItemFocus || (()=>{})
  };

  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (btn) {
      const action = btn.getAttribute("data-action");
      const tip = btn.closest(".tt");
      if (action === "remove") return h.onRemove({ tooltip: tip, event: e });
      if (action === "confirm") return h.onConfirm({ tooltip: tip, selection: getSelection(tip), event: e });
      if (action === "none") return h.onNone({ tooltip: tip, event: e });
      if (action === "show-more") return h.onShowMore({ tooltip: tip, kind: btn.getAttribute("data-kind"), event: e });
      if (action === "search-again") return h.onSearchAgain({ tooltip: tip, event: e });
      if (action === "link-manual") return h.onLinkManual({ tooltip: tip, event: e });
      if (action === "create-ref") return h.onCreateRef({ tooltip: tip, event: e });
    }

    const item = e.target.closest(".tt-item");
    if (item) {
      selectItem(item);
      const tip = item.closest(".tt");
      enableConfirm(tip);
      h.onItemFocus({ tooltip: tip, item, event: e });
    }
  });



  function selectItem(item) {
    const group = item.closest(".tt-list");
    group.querySelectorAll(".tt-item").forEach(n => {
      n.classList.toggle("is-selected", n === item);
      n.setAttribute("aria-checked", n === item ? "true" : "false");
    });
  }
  function enableConfirm(tip) {
    const sel = getSelection(tip);
    const btn = tip.querySelector('[data-action="confirm"]');
    if (btn) btn.disabled = !sel;
  }
  function getSelection(tip) {
    const sel = tip.querySelector('.tt-item.is-selected');
    if (!sel) return null;
    return {
      kind: sel.getAttribute("data-kind"),
      idx: Number(sel.getAttribute("data-idx")),
      text: sel.querySelector(".tt-text")?.textContent || ""
    };
  }

  return { destroy(){ root.removeEventListener("click",()=>{}); root.removeEventListener("keydown",()=>{}); } };
}


function createTooltips({
  selector = 'span.citation, div.InTexts, div.Reference-frame, div.Trashs, div.sorting, div.Explanations',
  SHOW_DELAY = 120,   // ms to wait before showing (hover-intent)
  HIDE_DELAY = 180,   // ms to wait before hiding (grace period)
  MOVE_TOLERANCE = 8, // px max mouse movement during SHOW_DELAY to count as intent
  OFFSET = 8          // px gap from host
} = {}) {
  const hosts = document.querySelectorAll(selector);
  const state = new WeakMap(); // host -> {tip, showTimer, hideTimer, startX, startY}

  const clear = (host, which) => {
    const s = state.get(host);
    if (!s) return;
    if ((!which || which==='show') && s.showTimer) { clearTimeout(s.showTimer); s.showTimer = null; }
    if ((!which || which==='hide') && s.hideTimer) { clearTimeout(s.hideTimer); s.hideTimer = null; }
  };

  const position = (host, tip) => {
    const r = host.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    let left = r.left + window.scrollX;
    let top  = r.top  + window.scrollY - tr.height - OFFSET;
    // place below if not enough space above
    if (top < window.scrollY) top = r.bottom + window.scrollY + OFFSET;
    // clamp horizontally
    const vw = document.documentElement.clientWidth;
    if (left + tr.width > window.scrollX + vw - 8) left = window.scrollX + vw - tr.width - 8;
    if (left < window.scrollX + 8) left = window.scrollX + 8;
    tip.style.left = `${left}px`;
    tip.style.top  = `${top}px`;
  };

  const showNow = (host) => {
    const s = state.get(host);
    if (!s) return;
    const tip = s.tip;
    // refresh content (in case attribute changed)
    tip.innerHTML = host.getAttribute('tooltip') || '';
    tip.style.visibility = 'visible';
    tip.style.opacity = '1';
    position(host, tip);
  };

  const hideNow = (host) => {
    const s = state.get(host);
    if (!s) return;
    const tip = s.tip;
    tip.style.opacity = '0';
    tip.style.visibility = 'hidden';
  };

  hosts.forEach((host) => {
    // create tooltip
    const tip = document.createElement('div');
    tip.className = 'custom-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.style.visibility = 'hidden';
    tip.style.opacity = '0';
    tip.innerHTML = host.getAttribute('tooltip') || '';
    document.body.appendChild(tip);
const hostId = `host-${Math.random().toString(36).slice(2)}`;
host.setAttribute('data-host-id', hostId);
tip.setAttribute('data-host-id', hostId);
    state.set(host, { tip, showTimer: null, hideTimer: null, startX: 0, startY: 0 });


    // Make radio rows selectable (click anywhere on the row incl. the circle)
tip.addEventListener('click', (e) => {
  const li = e.target.closest('.tt-item');
  if (!li || !tip.contains(li)) return;
    console.log("clicked")
  selectItem(li);
  enableConfirmIfSelected(tip);
});



// Helpers (keep these inside the same forEach so they see `tip`)
function selectItem(li) {
  const list = li.closest('.tt-list');
  if (!list) return;
  list.querySelectorAll('.tt-item').forEach(node => {
    const on = node === li;
    node.classList.toggle('is-selected', on);
    node.setAttribute('aria-checked', on ? 'true' : 'false');
  });
}

function enableConfirmIfSelected(tooltipRoot) {
  const selected = tooltipRoot.querySelector('.tt-item.is-selected');
  const btn = tooltipRoot.querySelector('[data-action="confirm"]');
  if (btn) btn.disabled = !selected;
}

    // --- hover-intent on host ---
    host.addEventListener('mouseenter', (e) => {
      const s = state.get(host);
      clear(host); // cancel any pending hides
      s.startX = e.clientX; s.startY = e.clientY;

      // track movement during intent window
      const onMove = (me) => { s.lastDx = Math.abs(me.clientX - s.startX); s.lastDy = Math.abs(me.clientY - s.startY); };
      host.addEventListener('mousemove', onMove);

      s.showTimer = setTimeout(() => {
        host.removeEventListener('mousemove', onMove);
        const moved = Math.hypot(s.lastDx || 0, s.lastDy || 0);
        if (moved <= MOVE_TOLERANCE) showNow(host);  // only show if mouse settled
      }, SHOW_DELAY);
    });

    host.addEventListener('mouseleave', () => {
      clear(host, 'show'); // don't show after we've left
      const s = state.get(host);
      s.hideTimer = setTimeout(() => hideNow(host), HIDE_DELAY);
    });

    // keep open while hovering tooltip
    tip.addEventListener('mouseenter', () => clear(host));
    tip.addEventListener('mouseleave', () => {
      const s = state.get(host);
      s.hideTimer = setTimeout(() => hideNow(host), HIDE_DELAY);
    });

    // toggle by click on host
    host.addEventListener('click', (e) => {
      e.stopPropagation();
      const visible = tip.style.visibility === 'visible' && tip.style.opacity !== '0';
      clear(host);
      if (visible) hideNow(host); else showNow(host);
    });

    // close when clicking outside
    document.addEventListener('click', (e) => {
      if (!host.contains(e.target) && !tip.contains(e.target)) {
        const s = state.get(host);
        s.hideTimer = setTimeout(() => hideNow(host), HIDE_DELAY);
      }
    });

    // reposition on scroll/resize while visible
    const rep = () => { if (tip.style.visibility === 'visible') position(host, tip); };
    window.addEventListener('scroll', rep, true);
    window.addEventListener('resize', rep, true);
  });
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.custom-tooltip [data-action="confirm"]');
  if (!btn) return;

  const tip = btn.closest('.custom-tooltip');
  const selectedItem = tip.querySelector('.tt-item.is-selected');
  if (!selectedItem) return; // nothing chosen

  // Find the dragged element (the citation/intext element)
  const host = findHostForTooltip(tip);
  if (!host) return;

  // Find the dropZone (the matching Reference-frame element)
  const refId = selectedItem.getAttribute('data-ref-id');
  const dropZone = refId ? document.getElementById(refId) : null;
  if (!dropZone) return;

  // Call your match function
                  let ListSimilar = [];
                                  const draggableSpans = document.querySelectorAll('span.citation[cleanedCit]');

                
                // Find similar draggable elements
                draggableSpans.forEach((dragged) => {
                    if (dragged.getAttribute("cleanedCit").trim() === host.getAttribute("cleanedCit").trim()) {
                        ListSimilar.push(dragged);
                    }
                });
                  ListSimilar.forEach((host) => {
                    MatchDragged(host, dropZone);
                });
  //MatchDragged(host, dropZone);
UpdateFramesAndMatches()
  // Optionally close the tooltip
  tip.style.visibility = 'hidden';
  tip.style.opacity = '0';
});



function findHostForTooltip(tip) {
  // Get the host from the tooltip's data-host-id
  const hostId = tip.getAttribute('data-host-id');
  let host = hostId ? document.querySelector(`[data-host-id="${hostId}"]`) : null;
  if (!host) return null; // no host found at all
  console.log(host)
  // If the host is an .InTexts element, find the corresponding span.citation
  if (host.classList.contains('InTexts')) {
    const draggableSpans = document.querySelectorAll('span.citation[cleanedCit]');
        host = host.ParentSpan ;  
  }

  return host;
}



import { displaySoftwareDescription, createMenue, referenceSectionGUI, referenceSeparationGUI, MatchGuessing, DragDrop, secondFrame, thirdFrame, clearRightContainer, MoveToFirstSpan  } from './uiComponents.js';
import { readRenderPDF } from './pdfLoader.js';
import { findReferenceSection, userDecisionReferenceSection } from './findReferenceList.js';
import { subdivide, userDecisionSeparation } from './separateReferences.js';
import { inTextSearch } from './inTextCitations.js';
import { performCrossRefSearch } from './crossrefSearch.js';
import {CreateCrossLinksHighlight} from './magic.js'





async function main() {
    // Display a description that helps the user understand the software
    displaySoftwareDescription();
    document.getElementById("scholar-container").scrollTo({ top: 0, behavior: 'smooth' });

    //document.getElementById("DescriptionID").scrollIntoView()
    createMenue();
    // Read and render user-input PDF
    await readRenderPDF();
}

// Initialize the main event listener
document.addEventListener("DOMContentLoaded", main());

export async function analysis() {
    // Try to detect reference section automatically
    console.log("Try to detect reference section automatically")
    let refSecAuto = findReferenceSection("byTitle");

    // Let user decide on where reference section is
    document.getElementById("description").style.display = "none";// clearRightContainer();
    let referenceCount = (await referenceSectionGUI(refSecAuto ));


    // Search for in-text citations and set up GUI for results
    inTextSearch();
    MoveToFirstSpan()
    // Set up GUI for results and crossref search
    //clearRightContainer();
    document.getElementById("settings").style.display = "none"
    //firstFrame(referenceCount);
    secondFrame(referenceCount);
    MatchGuessing()
    thirdFrame();
    //UpdateFrames();
    DragDrop()
    performCrossRefSearch();
    CreateCrossLinksHighlight()

}
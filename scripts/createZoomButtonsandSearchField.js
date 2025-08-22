import {searchSpanRef} from "./uiComponents.js"

let scale = 1; // initial zoom scale
export function createZoomButtonsandSearchField() {
  // hook zoom buttons
  document.getElementById("zoomInBtn").onclick  = zoomIn;
  document.getElementById("zoomOutBtn").onclick = zoomOut;

  // hook search field
  const searchInput = document.getElementById('searchSpanField');
  searchInput.placeholder = window.langDict["search_placeholder"];
  searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      searchSpanRef(event);
    }
  });
}

  function zoomIn() {



    // console.log(getFirstVisibleInViewport(.)

    // get the current relativ position
    const containerRect = document.getElementById('dummy').getBoundingClientRect().height
    const containerScrollTop = document.getElementById('pdf-container').scrollTop;
    const relPos = containerScrollTop / containerRect

    console.log(containerRect, containerScrollTop, relPos)
    /// zoom

    scale += 0.1;
    document.getElementById('dummy').style.transform = `scale(${scale})`;


    /// move to old position
    const NewcontainerRect = document.getElementById('dummy').getBoundingClientRect().height
    const NewcontainerScrollTop = relPos * NewcontainerRect;
    const overflowElement = document.getElementById('pdf-container');
    const scrollLeft = overflowElement.scrollLeft; // Get the current horizontal scroll position
    overflowElement.scrollTo({
      top: NewcontainerScrollTop,
      left: scrollLeft * 1.1 // Adjust horizontal scroll based on scale factor

    });

  }

  // Function to zoom out
  function zoomOut() {
    if (scale > 0.1) {
      const containerRect = document.getElementById('dummy').getBoundingClientRect().height
      const containerScrollTop = document.getElementById('pdf-container').scrollTop;
      const relPos = containerScrollTop / containerRect
  
      console.log(containerRect, containerScrollTop, relPos)
      /// zoom
  
      scale -= 0.1;
      document.getElementById('dummy').style.transform = `scale(${scale})`;
  
  
      /// move to old position
      const NewcontainerRect = document.getElementById('dummy').getBoundingClientRect().height
      const NewcontainerScrollTop = relPos * NewcontainerRect;
      const overflowElement = document.getElementById('pdf-container');
      const scrollLeft = overflowElement.scrollLeft; // Get the current horizontal scroll position
      overflowElement.scrollTo({
        top: NewcontainerScrollTop,
        left: scrollLeft * 1.1 // Adjust horizontal scroll based on scale factor
  
      });

    }
    
  }

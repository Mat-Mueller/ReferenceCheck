import {searchSpanRef} from "./uiComponents.js"

let scale = 1; // initial zoom scale
export function createZoomButtonsandSearchField() {
    const zoomInButton = document.createElement("button");
    zoomInButton.innerHTML = "+";
    zoomInButton.onclick = zoomIn;
    zoomInButton.style.position = "fixed";
    zoomInButton.style.bottom = "20px";
    zoomInButton.style.width = "20px";
    zoomInButton.style.left = "45px";

    const zoomOutButton = document.createElement("button");
    zoomOutButton.innerHTML = "-";
    zoomOutButton.onclick = zoomOut;
    zoomOutButton.style.position = "fixed";
    zoomOutButton.style.bottom = "20px";
    zoomOutButton.style.width = "20px";
    zoomOutButton.style.left = "20px"; // Position it to the right of the Zoom In button

    document.body.appendChild(zoomInButton);
    document.body.appendChild(zoomOutButton);

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'searchSpanField';
    searchInput.placeholder = 'Search...';
    //searchInput.style.marginLeft = '50px';
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {  // Check if the Enter key was pressed
            searchSpanRef(event);      // Call the search function and pass the event
        }
        })

        document.body.appendChild(searchInput)

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

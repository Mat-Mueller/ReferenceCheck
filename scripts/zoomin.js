let scale = 1; // initial zoom scale
export function createZoomButtons() {
    const zoomInButton = document.createElement("button");
    zoomInButton.innerHTML = "Zoom In";
    zoomInButton.onclick = zoomIn;
    zoomInButton.style.position = "fixed";
    zoomInButton.style.bottom = "20px";
    zoomInButton.style.left = "20px";

    const zoomOutButton = document.createElement("button");
    zoomOutButton.innerHTML = "Zoom Out";
    zoomOutButton.onclick = zoomOut;
    zoomOutButton.style.position = "fixed";
    zoomOutButton.style.bottom = "20px";
    zoomOutButton.style.left = "100px"; // Position it to the right of the Zoom In button

    document.body.appendChild(zoomInButton);
    document.body.appendChild(zoomOutButton);
  }

  function zoomIn() {
    scale += 0.1;
    document.getElementById('pdf-container').style.transform = `scale(${scale})`;
  }

  // Function to zoom out
  function zoomOut() {
    if (scale > 0.1) {
      scale -= 0.1;
      document.getElementById('pdf-container').style.transform = `scale(${scale})`;
    }
  }

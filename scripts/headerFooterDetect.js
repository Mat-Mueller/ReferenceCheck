// Called from pdfLoader to detect and remove headers and footers in pdf

export function checkFooter() {
    // Get all div elements that have the data-footer="true" attribute
    const footerDivs = document.querySelectorAll('div[data-footer="true"]');
    let numberOnlyCount = 0;

    // Helper function to check if a string contains only a number
    function isNumberOnly(text) {
        // Remove spaces and check if the remaining text is a number
        return /^\d+$/.test(text.trim());
    }

    // Loop through all footer divs to count how many contain only a number
    footerDivs.forEach(function (div) {
        const textContent = div.textContent.trim();
        if (isNumberOnly(textContent)) {
            numberOnlyCount++;
        }
    });

    // Check if at least half of the footer divs contain only a number
    const halfThreshold = Math.floor(footerDivs.length / 2);
    if (numberOnlyCount >= halfThreshold) {
        console.log("deleting footer")
        // If the condition is met, remove the 'textLine' class from those divs that only contain a number
        footerDivs.forEach(function (div) {

                div.classList.remove('textLine');

        });
    }
}

export function checkHeader() {

    let HeaderArray = []

    const headerDivs = document.querySelectorAll('div[data-header="true"]');

    headerDivs.forEach(function (div) {
        const textContent = div.textContent.trim();
        HeaderArray.push(textContent)
    });
    let uniqueHeaderArray = [...new Set(HeaderArray)];

    console.log(HeaderArray)
    console.log(uniqueHeaderArray)

    if (uniqueHeaderArray.length < (HeaderArray.length / 2)) {

        headerDivs.forEach(function (div) {

            div.classList.remove('textLine');

        });
    }

}
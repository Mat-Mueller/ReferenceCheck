import { searchResultGUI, hideLoadingSpinner, showLoadingSpinner } from './uiComponents.js'

// Functions imported by uiComponents.js to run and evaluate crossref search

// Function to perform the CrossRef search for all buttons
export async function performCrossRefSearch() {
    const References = document.querySelectorAll('.Reference-frame');
    console.log("starting CR search")
    // Create a concurrency limiter
    const MAX_CONCURRENT_REQUESTS = 3;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let activeRequests = 0;
    //showLoadingSpinner()
    for (let i = 0; i < References.length; i++) {
        // Wait until there are fewer than MAX_CONCURRENT_REQUESTS
        while (activeRequests >= MAX_CONCURRENT_REQUESTS) {
            await delay(500); // Check every 100 ms if there's space for new requests
        }

        activeRequests++; // Increment active requests count

        // Manually call the function that was originally triggered by the button click
        const textReference = getMergedTextByMyId(i);
        if (window.demomode === true) {
            const placeholderItem = {
  title: [window.langDict["DemoText1"]],
  "container-title": [window.langDict["DemoText2"]],
  URL: "#",
  DOI: "-",
  formattedAuthors: "Aut1",
  yearString: "XXXX",
   matchPercentage: 100,
  abstract: null
};
            searchResultGUI([placeholderItem], References[i])
            activeRequests--
        }
            else {checkExists(textReference)
            .then((searchResults) => {
                searchResultGUI(searchResults, References[i]);
            })
            .finally(() => {
                activeRequests--; // Decrement after the request is finished
            });

        await delay(100); // Small delay between starting new requests
        }
    }
    //hideLoadingSpinner();
}

// Simulate a sleep function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Call the function to trigger the search automatically



export function getMergedTextByMyId(MyId) {
    const divs = document.querySelectorAll(`[MyId="${MyId}"]`);
    let mergedText = '';
    divs.forEach(div => {
        mergedText += div.textContent.trim();
        //console.log(div.textContent.trim())
    });
    //console.log(mergedText)
    return mergedText.trim();
}


export async function checkExists(textReference) {
    var searchResults = await crossrefSearch(textReference);
    searchResults = formatResults(searchResults);
    searchResults = computeMatch(textReference, searchResults);
    return searchResults
}


async function crossrefSearch(textReference) {
    if (!textReference || !textReference.trim()) {
        console.log('No text found in the selected divs.');
        return [];
    }

    const query = encodeURIComponent(textReference);
    const apiUrl =
        `https://api.crossref.org/works?query.bibliographic=${query}&rows=3&mailto=you@example.com`;

    let attempt = 0;
    const maxAttempts = 5;
    let delay = 500; // start with 500ms

    while (attempt < maxAttempts) {
        try {
            const response = await fetch(apiUrl, {
                headers: { 'Accept': 'application/json' }
            });

            if (response.status === 429) {
                // RATE LIMIT HIT
                console.warn(`Crossref 429 – retrying in ${delay}ms (attempt ${attempt+1}/${maxAttempts})`);
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;          // exponential backoff
                attempt++;
                continue;            // try again
            }

            if (!response.ok) {
                console.warn("Crossref HTTP error:", response.status, response.statusText);
                return [];
            }

            const json = await response.json();
            const items = json?.message?.items || [];
            return items.slice(0, 2);

        } catch (err) {
            console.error("Crossref fetch failed:", err);
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
            attempt++;
        }
    }

    console.error("Crossref failed after maximum retries.");
    return [];
}



function formatResults(searchResults) {
    //if (searchResults) {
    searchResults.forEach(item => {
        
        // Format the authors
        if (!item.author || item.author.length === 0) {
            item.formattedAuthors = 'Unknown';
        } else {
            item.formattedAuthors = item.author.map(author => {
                const givenNameInitial = author.given ? `${author.given[0]}.` : '';
                return `${givenNameInitial} ${author.family}`;
            }).join(', ');
        }

        // Clean and split author surnames
        if (!item.author || item.author.length === 0) {
            item.authorSurnames = ['Unknown'];
        } else {
            item.authorSurnames = item.author.map(author => `$${author.family}`).join(', ').replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);
        }

        // Clean and split title words
        if (item.title) {
        item.titleWords = item.title[0].replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);
        } else {item.titleWords = []}
        // Clean and split journal name
        item.journalWords = item['container-title'] ? item['container-title'][0].replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/) : [];

        // Year as a string
        if (!item.issued || !item.issued['date-parts'] || !Array.isArray(item.issued['date-parts']) || !item.issued['date-parts'][0] || !Array.isArray(item.issued['date-parts'][0]) || !item.issued['date-parts'][0][0]) {
            item.yearString = 'Unknown Year';
        } else {
            item.yearString = item.issued['date-parts'][0][0].toString();
        }

        // DOI from the item
        item.doiString = item.DOI ? item.DOI.toLowerCase() : '';
    });
    return searchResults
//} 
}


function computeMatch(textReference, searchResults) {
    // Prepare text from extracted reference
    // Split decoded query into lowercase words
    var queryWords = textReference.replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);
    queryWords = queryWords.filter((element) => {
        return element.length > 1;
    });
    const queryWordSet = new Set(queryWords);

    // Extract DOI from the query using regex
    const doiRegex = /\b10\.\d{4,}(?:\.\d+)*\/\S+\b/;
    const queryDOI = textReference.match(doiRegex) ? textReference.match(doiRegex)[0] : '';

    // Compute match between extracted reference and crossref search results
    // Weights for different components
    let title_weight = 45;
    let author_weight = 30;
    let journal_weight = 10;
    let year_weight = 10;
    let doi_weight = 5;

    searchResults.forEach(item => {
        // Count matches for title words
        let titleMatchCount = 0;
        item.titleWords.forEach(word => {
            if (queryWordSet.has(word)) {
                titleMatchCount++;
            }
        });
        // Count matches for author surnames
        let authorMatchCount = 0;
        item.authorSurnames.forEach(word => {
            if (queryWordSet.has(word)) {
                authorMatchCount++;
            }
        });
        // Count matches for journal words
        let journalMatchCount = 0;
        item.journalWords.forEach(word => {
            if (queryWordSet.has(word)) {
                journalMatchCount++;
            }
        });
        // Check if year matches
        let yearMatchCount = queryWordSet.has(item.yearString) ? 1 : 0;
        // Check if DOI matches
        let doiMatchCount = (queryDOI && queryDOI === item.doiString) ? 1 : 0;
        // Logging counts

        // Calculate match percentages for each component
        let titleMatchPercentage = (titleMatchCount / item.titleWords.length) * title_weight;
        let authorMatchPercentage = (authorMatchCount / item.authorSurnames.length) * author_weight;
        let journalMatchPercentage = (journalMatchCount / item.journalWords.length) * journal_weight;
        let yearMatchPercentage = yearMatchCount * year_weight;
        let doiMatchPercentage = doiMatchCount * doi_weight;

        // Combine match percentages
        item.matchPercentage = Math.round(titleMatchPercentage + authorMatchPercentage + journalMatchPercentage + yearMatchPercentage + doiMatchPercentage);
    });
    
    return searchResults
}
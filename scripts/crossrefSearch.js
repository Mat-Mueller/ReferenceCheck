// Functions imported by uiComponents.js to run and evaluate crossref search

export function getMergedTextByMyId(MyId) {
    const divs = document.querySelectorAll(`[MyId="${MyId}"]`);
    let mergedText = '';
    divs.forEach(div => {
        mergedText += div.textContent.trim() + ' ';
    });
    return mergedText.trim();
}


export async function triggerSearch2(MyId) {
    const mergedText = getMergedTextByMyId(MyId);
    console.log(mergedText);

    // Select all div elements with the specified MyId attribute
    const divs = document.querySelectorAll(`[MyId="${MyId}"]`);

    if (mergedText.length > 0) {
        try {
            document.body.style.cursor = 'wait'; // Change cursor to wait
            const query = encodeURIComponent(mergedText);
            const apiUrl = `https://api.crossref.org/works?query.bibliographic=${query}&rows=3`;

            // Await the result of the fetch call
            const response = await fetch(apiUrl);
            const data = await response.json();
            const rateLimit = response.headers.get('X-Rate-Limit-Limit');
            const rateLimitRemaining = response.headers.get('X-Rate-Limit-Remaining');
            const rateLimitInterval = response.headers.get('X-Rate-Limit-Interval');

            console.log(`Rate Limit: ${rateLimit}`);
            console.log(`Rate Limit Remaining: ${rateLimitRemaining}`);
            console.log(`Rate Limit Interval: ${rateLimitInterval}`);

            console.log(data); // Log the response from the API
            document.body.style.cursor = 'default'; // Revert cursor to default

            return data; // Return the API data after it is fetched
        } catch (error) {
            console.error('Error fetching CrossRef data:', error);
            document.body.style.cursor = 'default'; // Revert cursor to default even if there's an error
            return null; // Return null in case of an error
        }
    } else {
        alert('No text found in the selected divs.');
        return null; // Return null if no text is found
    }
}



export function calculateMatchPercentage(item, query) {
    // Decode the query string first
    query = decodeURIComponent(query);

    // Weights for different components
    let title_weight = 45;
    let author_weight = 30;
    let journal_weight = 10;
    let year_weight = 10;
    let doi_weight = 5;

    // Format the authors and other components
    const formattedAuthors = formatAuthors(item.author);
    const title = `$${formattedAuthors}
                (${getYear(item.issued)}).
                <strong><a href="${item.URL}" target="_blank">${item.title[0]}</a></strong>.
                ${item['container-title'] ? item['container-title'][0] : 'Unknown Journal'}
                DOI: ${item.DOI}`;

    // Clean and split title words
    const titleWords = item.title[0].replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);

    // Split decoded query into lowercase words
    var queryWords = query.replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);
    queryWords = queryWords.filter((element) => {
        return element.length > 1;
    });
    const queryWordSet = new Set(queryWords);

    // Clean and split author surnames
    let authorSurnames = formatAuthors_Surname(item.author).replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);

    // Clean and split journal name
    let journalWords = item['container-title'] ? item['container-title'][0].replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/) : [];

    // Year as a string
    let yearString = getYear(item.issued).toString();

    // Extract DOI from the query using regex
    const doiRegex = /\b10\.\d{4,}(?:\.\d+)*\/\S+\b/;
    const queryDOI = query.match(doiRegex) ? query.match(doiRegex)[0] : '';

    // DOI from the item
    let doiString = item.DOI ? item.DOI.toLowerCase() : '';
    // Count matches for title words
    let titleMatchCount = 0;
    titleWords.forEach(word => {
        if (queryWordSet.has(word)) {
            titleMatchCount++;
        }
    });
    // Count matches for author surnames
    let authorMatchCount = 0;
    authorSurnames.forEach(word => {
        if (queryWordSet.has(word)) {
            authorMatchCount++;
        }
    });
    // Count matches for journal words
    let journalMatchCount = 0;
    journalWords.forEach(word => {
        if (queryWordSet.has(word)) {
            journalMatchCount++;
        }
    });
    // Check if year matches
    let yearMatchCount = queryWordSet.has(yearString) ? 1 : 0;
    // Check if DOI matches
    let doiMatchCount = (queryDOI && queryDOI === doiString) ? 1 : 0;
    // Logging counts

    // Calculate match percentages for each component
    let titleMatchPercentage = (titleMatchCount / titleWords.length) * title_weight;
    let authorMatchPercentage = (authorMatchCount / authorSurnames.length) * author_weight;
    let journalMatchPercentage = (journalMatchCount / journalWords.length) * journal_weight;
    let yearMatchPercentage = yearMatchCount * year_weight;
    let doiMatchPercentage = doiMatchCount * doi_weight;
    // Combine match percentages
    var matchPercentage = Math.round(titleMatchPercentage + authorMatchPercentage + journalMatchPercentage + yearMatchPercentage + doiMatchPercentage);

    return matchPercentage;
}

function formatAuthors_Surname(authors) {
    if (!authors || authors.length === 0) {
        return '';
    }
    return authors.map(author => `$${author.family}`).join(', ');
}

export function formatAuthors(authors) {
    if (!authors || authors.length === 0) {
        return '';
    }
    return authors.map(author => {
        const givenNameInitial = author.given ? `${author.given[0]}.` : '';
        return `${givenNameInitial} ${author.family}`;
    }).join(', ');
}

export function getYear(issued) {
    if (!issued || !issued['date-parts'] || !Array.isArray(issued['date-parts']) || !issued['date-parts'][0] || !Array.isArray(issued['date-parts'][0])) {
        return 'Unknown Year';
    }
    return issued['date-parts'][0][0] || 'Unknown Year';
}
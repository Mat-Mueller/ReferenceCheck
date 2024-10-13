


export function MakeRefName(cleanedText) {
    let lastNames 
    if (cleanedText) {
        // Attempt to match the authors part using a regular expression
        const matchResult = cleanedText.match(/^(.*?)(?=\d{4}[a-z]?)/);
        
        // Check if the match was successful
        if (matchResult) {
            const authorsPart = matchResult[0]; // Safely access the matched part
            
            // Step 3: Split the remaining string by commas or ampersands and extract the last names
            lastNames = authorsPart
                .replace(" (hrsg.)", "")
                .replace(" (eds.).", "")
                .replace(" (", "")
                .replace(", ,", ",")
                .replace(".", "")
                .split(/,|&/)
                .map(author => author.trim());
    
            // Filter out any empty names
            lastNames = lastNames.filter(name => name !== "");
        } else {
            // If no match is found, set lastNames to an empty array
            lastNames = [];
        }
    } else {
        // If cleanedText is falsy, set lastNames to an empty array
        lastNames = [];
    }
    return lastNames

}
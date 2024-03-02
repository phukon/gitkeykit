export function extractKey(text) {
    // Tokenize strings based on whitespace
    const strings = text.split(/\s+/);
    
    if (!strings) {
        return null;
    }

    let longestString = "";
    for (let str of strings) {
        if (str.length > longestString.length) {
            longestString = str;
        }
    }

    return longestString;
}

// console.log(findLongestString(word));

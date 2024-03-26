export function extractKey(text: string): string | null {
  // Tokenize strings based on whitespace
  const strings: string[] = text.split(/\s+/);

  if (!strings || strings.length === 0) {
    return null;
  }

  let longestString: string = strings[0];
  for (let str of strings) {
    if (str.length > longestString.length) {
      longestString = str;
    }
  }

  return longestString;
}


// Define small kana characters
export const smallKanaSet = new Set([
  "ぁ",
  "ぃ",
  "ぅ",
  "ぇ",
  "ぉ",
  "っ",
  "ゃ",
  "ゅ",
  "ょ",
  "ゎ",
  "ゕ",
  "ゖ",
]);

// Function to split hiragana into moras
export const splitIntoMoras = (hiraganaStr) => {
  const moras = [];
  let currentMora = "";
  for (let i = 0; i < hiraganaStr.length; i++) {
    const c = hiraganaStr[i];
    if (smallKanaSet.has(c)) {
      // Small kana, append to current mora
      currentMora += c;
    } else {
      // Base kana
      if (currentMora !== "") {
        moras.push(currentMora);
      }
      currentMora = c;
    }
  }
  if (currentMora !== "") {
    moras.push(currentMora);
  }
  return moras;
};

// Function to apply accent pattern to moras
export const applyAccentPattern = (moras, accentPattern) => {
  let result = "";
  for (let i = 0; i < moras.length; i++) {
    result += moras[i];
    if (accentPattern === 0 && i === 0) {
      result += "↑";
    } else if (accentPattern === 1 && i === 0) {
      result += "↓";
    } else if (accentPattern >= 2) {
      if (i === 0) {
        result += "↑";
      }
      if (i === accentPattern - 1) {
        result += "↓";
      }
    }
  }
  return result;
};

export const addPitchAccent = (hiragana, accentPatterns) => {

  // Main processing
  const moras = splitIntoMoras(hiragana);
  const results = accentPatterns.map((pattern) =>
    applyAccentPattern(moras, pattern)
  );
  return results;
};

export const convertPitchToUnderline = (text) => {
  // Define the regex patterns for different cases
  const upDownPattern = /\u2191([^\u2193]*)\u2193/g; // Up arrow followed by down arrow
  const upPattern = /\u2191([^\u2193]*)/g; // Only up arrow
  const downPattern = /([^\u2191]*)\u2193/g; // Only down arrow

  // Replace up-down pattern with <u> tags
  let result = text.replace(upDownPattern, (match, p1) => {
    return `<u>${p1}</u>`;
  });

  // Replace up arrow pattern with <u> tags for all after it
  result = result.replace(upPattern, (match, p1) => {
    return `<u>${p1}</u>`;
  });

  // Replace down arrow pattern with <u> tags for all before it
  result = result.replace(downPattern, (match, p1) => {
    return `<u>${p1}</u>`;
  });

  return result;
};

export const convertVowelEtoIAndOtoU = (input) => {
  // Regular expression to match kana ending with the "e" vowel followed by "え"
  const eVowelRegex = /([へめせねてれけげでべぺ])[え]/g;
  // Regular expression to match kana ending with the "o" vowel followed by "お"
  const oVowelRegex = /([ほもそとろこごどぼぽ])[お]/g;

  // Replace "え" with "い" for valid kana combinations
  let result = input.replace(eVowelRegex, (match, char) => {
    return char + "い";
  });

  // Replace "お" with "う" for valid kana combinations
  result = result.replace(oVowelRegex, (match, char) => {
    return char + "う";
  });

  return result;
};

function mapKana(word, reading) {
    // initialize an empty array to store the result
    let result = [];
    // initialize two pointers to track the word and reading indices
    let i = 0;
    let j = 0;
    // loop through the word and reading until one of them reaches the end
    while (i < word.length && j < reading.length) {
        // initialize an empty object to store the current segment
        let segment = {};
        // check if the current character in the word is a kanji
        if (isKanji(word[i])) {
            // set the type to 'kanji'
            segment.type = 'kanji';
            // set the surface to the current character
            segment.surface = word[i];
            // initialize an empty string to store the reading
            let kanjiReading = '';
            // loop through the reading until it matches a hiragana character or reaches the end

            while (j < reading.length && kataganaToHiragana(word[i + 1]) !== reading[j]) {
                // append the current character to the reading
                kanjiReading += reading[j];
                // increment the reading index
                j++;
            }
            // set the reading to the kanjiReading
            segment.reading = kanjiReading;
        } else {
            // set the type to 'non-kanji'
            segment.type = 'non-kanji';
            // set the surface and reading to the current character
            segment.surface = word[i];
            segment.reading = reading[j];
            // increment the reading index
            j++;
        }
        // push the segment to the result array
        result.push(segment);
        // increment the word index
        i++;
    }
    // return the result array
    return mergeConsecutiveKana(result);
}

// helper function to check if a character is a kanji
function isKanji(char) {
    // use Unicode range for kanji characters
    return char >= '\u4e00' && char <= '\u9faf';
}

// helper function to check if a character is a hiragana
function isHiragana(char) {
    // use Unicode range for hiragana characters
    return char >= '\u3040' && char <= '\u309f';
}

function kataganaToHiragana(kata) {
    if (kata == 'パ')
        return 'ぱ'
    if (kata == 'ん')
        return 'ん'
    return kata
}

function mergeConsecutiveKana(obj) {
    // Assuming your object is stored in a variable called obj
    let merged_obj = [];
    let i = 0;
    while (i < obj.length) {
        if (obj[i].type == "non-kanji") {
            // Find the next element that is not 'non-kanji'
            let j = i + 1;
            while (j < obj.length && obj[j].type == "non-kanji") {
                j++;
            }
            // Merge the elements from i to j-1
            merged_obj.push({
                type: "non-kanji",
                surface: obj.slice(i, j).map(e=>e.surface).join(""),
                reading: obj.slice(i, j).map(e=>e.reading).join("")
            });
            // Update i to skip the merged elements
            i = j;
        } else {
            // Keep the element as it is
            merged_obj.push(obj[i]);
            i++;
        }
    }
    return merged_obj
}
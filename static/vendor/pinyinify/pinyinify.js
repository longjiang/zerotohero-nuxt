/**
 * @file Converts pinyin tone numbers to tone marks.
 * @author Kevin K. Yang <yangkevi@usc.edu>
 * @copyright Kevin K. Yang 2017. Licensed under the MIT License.
 */

/**
 * An object holding arrays of Unicode tone marks for each vowel.
 * Each tone mark can be accessed very intuitively. For example,
 * to access the tone marked version of a2, you would call
 * toneMarks["a"][2].
 * 
 * @type {Object}
 */
var toneMarks = {
   a: ["a", "\u0101", "\u00e1", "\u01ce", "\u00e0", "a"],
   e: ["e", "\u0113", "\u00e9", "\u011b", "\u00e8", "e"],
   i: ["i", "\u012b", "\u00ed", "\u01d0", "\u00ec", "i"],
   o: ["o", "\u014d", "\u00f3", "\u01d2", "\u00f2", "o"],
   u: ["u", "\u016b", "\u00fa", "\u01d4", "\u00f9", "u"],
   v: ["\u00fc", "\u01d6", "\u01d8", "\u01da", "\u01dc", "\u00fc"]
};

/**
 * @return {Boolean} whether this string is a single alphabetical letter.
 */
String.prototype.isAlpha = function() {

   return /^[A-Za-z]$/.test(this);
}

/**
 * @return {Boolean} is this string a valid pinyin vowel
 */
String.prototype.isPinyinVowel = function() {

   return /^[aeiouv\u00fc]$/.test(this);
}

/**
 * Finds the last occurrence of a regular expression
 * pattern match in this String.
 * 
 * @param  {RegExp} the pattern to match
 * @return {Number} the last match in this string
 */
String.prototype.lastIndexOfRegex = function(regExp) {

   var lastIndex = -1;
   for (var i = 0; i < this.length; i++) {

      if (regExp.test(this.charAt(i))) {

         lastIndex = i;
      }
   }

   return lastIndex;
}

/**
 * @param  {Number} index The index of the character to replace
 * @param  {String} replacement The string to insert at the index
 * @return {String} this String, with the specified replacement
 */
String.prototype.replaceAt = function(index, replacement) {

   if (index >= 0 && index < this.length && typeof replacement === "string") {

      return this.substring(0, index) + replacement 
            + this.substring(index + 1);
   } else {

      return this;
   }
}

/**
 * Converts this String, which must be a single pinyin word followed by a 
 * tone number, to the equivalent pinyin word with tone marks.
 * 
 * @return {String} this String, with the tone number removed
 *                       and tone mark inserted.
 */
String.prototype.convertPinyin = function() {
   // convert to lowercase
   var str = this.toLocaleLowerCase();
   // get index of the tone number
   var toneNumIndex = str.search(/[1-5]/);
   // get index of the first pinyin vowel
   var firstVowelIndex = str.search(/[aeiouv\u00fc]/);
   if (str.length > 7 || toneNumIndex < 1 || 
       toneNumIndex !== str.length - 1 ||
       firstVowelIndex < 0) {
      // this string is either too long to be pinyin, does not contain a \
      // correctly placed tone number, or has no pinyin vowels
      // console.log("String.prototype.convertPinyin:" + this + 
      //             " is not a valid pinyin word.")
      return this;
   }
   /** @type {Number} from 1 to 5 */
   var toneNum = parseInt(str[toneNumIndex]);
   if (/[ae]/.test(str)) {
      // str contains an 'a' or an 'e', both of which take precedence
      var index = str.search(/[ae]/);
      str = str.replaceAt(index, toneMarks[str.charAt(index)][toneNum]);
   } else if (/ou/.test(str)) {
      // str contains 'ou'. The tone always goes on the 'o'
      var index = str.search(/ou/);
      str = str.replaceAt(index, toneMarks[str.charAt(index)][toneNum]);
   } else {
      // place the tone on the last vowel
      var index = str.lastIndexOfRegex(/[aeiouv\u00fc]/);
      var vowel = str.charAt(index);
      if (vowel == "\u00fc") {

         vowel = "v";
      }
      str = str.replaceAt(index, toneMarks[vowel][toneNum]);
   }
   // strip the tone number
   str = str.substring(0, str.length - 1);
   return str;
}

/**
 * @param  {String} the string to convert
 * @return {String} the converted string
 */
var pinyinify = function(str) {

   if (typeof str !== 'string') {

      return str;
   }

   var res = "";
   var i = 0;
   // parse str character by character
   while (str.length > 0) {

      var char = str.charAt(i);
      if (char.isAlpha()) {
         // a letter has been found
         if (i !== 0) {
            // remove non-letters found up to now, add to res
            res += str.substring(0, i);
            str = str.substring(i);
            i = 0;
         }
         // get index of next tone number, if it exists
         var toneNumIndex = str.search(/[1-5]/);
         // get index of next whitespace, if it exists
         var whitespaceIndex = str.search(/\s/);

         if (toneNumIndex > 0 && toneNumIndex < 7 &&
             (whitespaceIndex < 0 || whitespaceIndex > toneNumIndex)) {
            // there is a tone number within 6 characters from now, and no \
            // whitespaces between this character and the tone number
            res += str.substring(0, toneNumIndex + 1).convertPinyin();
            str = str.substring(toneNumIndex + 1);
         } else if (whitespaceIndex < 0) {
            // no valid tone numbers nor whitespace, add rest of string to res
            res += str.substring(0);
            str = "";
         } else {
            // whitespace found, remove everything up to and including the \
            // whitespace, and add to res
            res += str.substring(0, whitespaceIndex + 1);
            str = str.substring(whitespaceIndex + 1);
         }
      } else if (i >= str.length) {
         // no more characters to parse
         res += str.substring(0);
         str = "";
      }
      else {
         // increment index
         i++;
      }
   }

   return res;
}

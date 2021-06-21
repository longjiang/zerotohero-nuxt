// vim: set ts=4 sw=4 expandtab
// (C) 2010 Dan Bravender - licensed under the AGPL 3.0

/*  Geulja is used to track modifications that have been made to
    characters. Currently, it keeps track of characters' original
    padchims (for ㄷ -> ㄹ irregulars) and if the character has
    no padchim but should be treated as if it does (for ㅅ
    irregulars). When substrings are extracted the Geulja class
    keeps these markers for the last character only.
*/

function Geulja(__value__) {
    this.length = (this.__value__ = __value__ || "").length;
    this.hidden_padchim = false;
    this.original_padchim = null;
    this.charAt = function() {
        result = String.prototype.charAt.apply(this, arguments);
        if (arguments[0] == this.length - 1) {
            result = new Geulja(result);
            result.original_padchim = this.original_padchim;
            result.hidden_padchim = this.hidden_padchim;
        }
        return result;

    }
};

with(Geulja.prototype = new String) {
    toString = valueOf = function() {
        return this.__value__
    };
}

var hangeul = function() {
    this.Geulja = Geulja;
    this.is_hangeul = function(character) {
        if (character.charCodeAt(0) >= '가'.charCodeAt(0) &&
            character.charCodeAt(0) <= '힣'.charCodeAt(0)) {
            return true;
        }
        return false;
    };
    // Equations lifted directly from:
    // http://www.kfunigraz.ac.at/~katzer/korean_hangul_unicode.html
    this.lead = function(character) {
        return String.fromCharCode((Math.floor(character.charCodeAt(0) - 44032) / 588) + 4352);
    };
    this.vowel = function(character) {
        padchim_character = this.padchim(character);
        if (!padchim_character || padchim_character == true) {
            padchim_offset = -1;
        } else {
            padchim_offset = padchim_character.charCodeAt(0) - 'ᆨ'.charCodeAt(0);
        }
        return String.fromCharCode(Math.floor(((character.charCodeAt(0) - 44032 - padchim_offset) % 588) / 28) + 'ㅏ'.charCodeAt(0));
    };
    this.padchim = function(character) {
        if (character.hidden_padchim) {
            return true;
        }
        if (character.original_padchim) {
            return character.original_padchim;
        }
        p = String.fromCharCode(((character.charCodeAt(0) - 44032) % 28) + 'ᆨ'.charCodeAt(0) - 1)
        if (p.charCodeAt(0) == 4519) {
            return null;
        } else {
            return p;
        }
    };
    this.join = function(lead, vowel, padchim) {
        lead_offset = lead.charCodeAt(0) - 'ᄀ'.charCodeAt(0);
        vowel_offset = vowel.charCodeAt(0) - 'ㅏ'.charCodeAt(0);
        if (padchim) {
            padchim_offset = padchim.charCodeAt(0) - 'ᆨ'.charCodeAt(0);
        } else {
            padchim_offset = -1;
        }
        return String.fromCharCode(padchim_offset + (vowel_offset) * 28 + (lead_offset) * 588 + 44032 + 1);
    };
    this.find_vowel_to_append = function(string) {
        self = this;
        append = null;
        string.split('').reverse().forEach(function(character) {
            if (character in {'뜨': true, '쓰': true, '트': true}) {
                if (!append) append = '어';
            }
            if (self.vowel(character) == 'ㅡ' && !self.padchim(character)) {
                //continue
            } else if (self.vowel(character) in {'ㅗ': true, 'ㅏ': true, 'ㅑ': true}) {
                if (!append) append = '아';
            } else {
                if (!append) append = '어';
            }
        });
        if (!append) append = '어';
        return append;
    };
    this.match = function(character, l, v, p) {
        return (l == '*' || this.lead(character) == l) &&
               (v == '*' || this.vowel(character) == v) &&
               (p == '*' || this.padchim(character) == p)
    };
    return this;
}();

// Export functions to node
try {
    for (f in hangeul) {
        exports[f] = hangeul[f];
    }
} catch(e) {
}

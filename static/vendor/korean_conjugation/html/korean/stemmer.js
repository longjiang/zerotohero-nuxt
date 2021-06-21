// vim: set ts=4 sw=4 expandtab
// (C) 2010 Dan Bravender - licensed under the AGPL 3.0

try {
    var hangeul    = require('./hangeul'),
        conjugator = require('./conjugator');
} catch(e) {}

var stemmer = {};

stemmer.iterate_chop_last = function(s) {
    possibles = [];
    for (var i=s.length-1; i > 0; i--) {
        possibles.push(s.substring(0, s.length-i));
    }
    possibles.push(s);
    return possibles;
};

stemmer.generate_stems = function(verb) {
    possibles = [];
    if (verb[verb.length-1] == '해') {
        possibles.push([false, verb.substring(0, verb.length-1) + '하']);
    }
    if (hangeul.vowel(verb[verb.length-1]) == 'ㅕ') {
        possibles.push([false, verb.substring(0, verb.length-1) +
                               hangeul.join(hangeul.lead(verb[verb.length-1]), 'ㅣ')]);
    }
    if (hangeul.vowel(verb[verb.length-1]) == 'ㅐ') {
        possibles.push([false, verb.substring(0, verb.length-1) +
                      hangeul.join(hangeul.lead(verb[verb.length-1]),
                                   hangeul.vowel(hangeul.find_vowel_to_append(verb.substring(0, verb.length-1))),
                                   'ᇂ')]);
    }
    possibles.push([false, verb.substring(0, verb.length-1) +
                           hangeul.join(hangeul.lead(verb[verb.length-1]), 'ㅡ')]);
    possibles.push([true, verb]);
    // try adding back in irregular disappearing padchims
    ['ᆮ', 'ᆸ','ᆯ', 'ᆺ', 'ᄂ'].forEach(function(padchim) {
        possibles.push([false, verb.substring(0, verb.length-1) +
                                hangeul.join(hangeul.lead(verb[verb.length-1]),
                                             hangeul.vowel(verb[verb.length-1]), padchim)]);
    });
    // remove padchim entirely
    possibles.push([false, verb.substring(0, verb.length-1) +
                           hangeul.join(hangeul.lead(verb[verb.length-1]),
                                        hangeul.vowel(verb[verb.length-1]))]);
    return possibles;
};

stemmer.stem = function(verb) {
    // remove all conjugators that return what was passed in
    var ignored_conjugations = {};
    for (var f in conjugator) {
        if (conjugator[f].conjugation && conjugator[f]('test') == 'test') {
            ignored_conjugations[f] = true;
        }
    }
    var possible_stems = stemmer.iterate_chop_last(verb);
    for (var i in possible_stems) {
        var possible_base_stem = possible_stems[i];
        var generated_stems = stemmer.generate_stems(possible_base_stem);
        for (var j in generated_stems) {
            original = generated_stems[j][0];
            possible_stem = generated_stems[j][1];
            for (var f in conjugator) {
                if (!conjugator[f].conjugation || (f in ignored_conjugations && original)) {
                    continue;
                }
                if (conjugator[f](possible_stem) == verb) {
                    return possible_stem + '다';
                }
            }
        }
    }
};

// Export functions to node
try {
    for (f in stemmer) {
        exports[f] = stemmer[f];
    }
} catch(e) {}

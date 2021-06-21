try {
    var hangeul = require('../hangeul'),
        assert  = require('assert');
} catch(e) {}

assert.equal(hangeul.is_hangeul('안'), true);

assert.equal(hangeul.lead('가'), 'ᄀ');
assert.equal(hangeul.lead('만'), 'ᄆ');
assert.equal(hangeul.lead('짉'), 'ᄌ');

assert.equal(hangeul.vowel('갓'), 'ㅏ');
assert.equal(hangeul.vowel('빩'), 'ㅏ');
assert.equal(hangeul.vowel('법'), 'ㅓ');
assert.equal(hangeul.vowel('가'), 'ㅏ');

assert.equal(hangeul.padchim('강'), 'ᆼ');

assert.equal(hangeul.join('ᄀ', 'ㅏ'), '가');
assert.equal(hangeul.join('ᄆ', 'ㅕ', 'ᆫ'), '면');
assert.equal(hangeul.join('ᄈ', 'ㅙ', 'ᆶ'), '뾇');

assert.equal(hangeul.find_vowel_to_append('아프'), '아');
assert.equal(hangeul.find_vowel_to_append('흐르'), '어');
assert.equal(hangeul.find_vowel_to_append('태우'), '어');
assert.equal(hangeul.find_vowel_to_append('만들'), '어');
assert.equal(hangeul.find_vowel_to_append('앗'), '아');

assert.equal(hangeul.match('아', '*', 'ㅏ'), true);
assert.equal(hangeul.match('왅', '*', 'ㅏ'), false);
assert.equal(hangeul.match('아', 'ᄋ','ㅏ'), true);
assert.equal(hangeul.match('아', 'ᄋ','ㅏ', null), true);
assert.equal(hangeul.match('읽', '*', '*', 'ᆰ'), true);
assert.equal(hangeul.match('읽', '*', '*', null), false);

geulja = new hangeul.Geulja('나');
geulja.hidden_padchim = true;
assert.equal(hangeul.padchim(geulja), true);

geulja = new hangeul.Geulja('걸');
geulja.original_padchim = 'ㄷ';
assert.equal(hangeul.padchim(geulja), 'ㄷ');

geulja = new hangeul.Geulja('나');
geulja.hidden_padchim = true;
assert.equal(geulja.charAt(0), '나');
assert.equal(geulja.charAt(0).hidden_padchim, true);

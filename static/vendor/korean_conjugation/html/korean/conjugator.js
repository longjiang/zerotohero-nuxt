// vim: set ts=4 sw=4 expandtab
// (C) 2010 Dan Bravender - licensed under the AGPL 3.0

try {
    var hangeul       = require('./hangeul'),
        pronunciation = require('./pronunciation');
} catch(e) {}

var conjugator = {};

conjugator.no_padchim_rule = function(characters) {
    /* no_padchim_rule is a helper function for defining merges where a
        character will take the padchim of a merged character if the first
        character doesn't already have a padchim, .e.g. 습 -> 가 + 습니다 -> 갑니다.
    */
    return function(x, y) {
        if (!hangeul.padchim(x.charAt(x.length-1)) && y[0] in characters) {
            return ['borrow padchim', x.substring(0, x.length-1) +
                                      hangeul.join(hangeul.lead(x[x.length-1]),
                                                   hangeul.vowel(x[x.length-1]),
                                                   hangeul.padchim(y[0])) +
                                      y.substring(1)];
        }
    }
};

conjugator.vowel_contraction = function(vowel1, vowel2, new_vowel, trace) {
    /* vowel contraction is a helper function for defining common contractions
       between a character without a padchim and a character that starts with
        'ᄋ', e.g. ㅐ + ㅕ -> ㅐ when applied to 해 + 였 yields 했.
    */
    return function(x, y) {
        if (hangeul.match(x.charAt(x.length-1), '*', vowel1, null) &&
            hangeul.match(y.charAt(0), 'ᄋ', vowel2, '*')) {
            return ['vowel contraction [' + vowel1 + ' ' + vowel2 + ' -> ' + new_vowel + ']',
                    x.substring(0, x.length-1) +
                    hangeul.join(hangeul.lead(x.charAt(x.length-1)),
                                 new_vowel,
                                 hangeul.padchim(y[0])) +
                    y.substring(1)];
        }
    }
};

conjugator.drop_l = function(x, y) {
    if (hangeul.padchim(x[x.length-1]) == 'ᆯ') {
        conjugator.reasons.push('drop ㄹ')
        return x.substring(0, x.length-1) +
               hangeul.join(hangeul.lead(x[x.length-1]),
                            hangeul.vowel(x[x.length-1])) +
               y;
    }
};

conjugator.drop_l_and_borrow_padchim = function(x, y) {
    if (hangeul.padchim(x.charAt(x.length-1)) == 'ᆯ') {
        conjugator.reasons.push('drop ' + hangeul.padchim(x.charAt(x.length-1)) + ' borrow padchim')
        return x.substring(0, x.length-1) +
               hangeul.join(hangeul.lead(x[x.length-1]),
                            hangeul.vowel(x[x.length-1]),
                            hangeul.padchim(y[0])) +
               y.substring(1);
    }
};

conjugator.dont_insert_eh = function(x, y) {
    if (hangeul.padchim(x.charAt(x.length-1)) == 'ᆯ' &&
        y[0] == '면') {
        return ['join', x + y];
    }
};

conjugator.insert_eh = function(characters) {
    return function(x, y) {
        if (hangeul.padchim(x.charAt(x.length-1)) && y[0] in characters) {
            return ['padchim + consonant -> insert 으', x + '으' + y];
        }
    }
};

conjugator.lm_merge = function(x, y) {
    if (hangeul.padchim(x.charAt(x.length-1)) == 'ᆯ' && y[0] == '음') {
        return ['ㄹ + ㅁ -> ᆱ',
                x.substring(0, x.length-1) +
                hangeul.join(hangeul.lead(x[x.length-1]),
                             hangeul.vowel(x[x.length-1]),
                             'ᆱ')];
    }
};

/* merge rules is a list of rules that are applied in order when merging a verb 
   stem with a tense ending
*/

conjugator.merge_rules = [
    conjugator.no_padchim_rule({'을': true, '습': true, '읍': true, '는': true, '음': true}),
    conjugator.lm_merge,
    conjugator.vowel_contraction('ㅐ', 'ㅓ', 'ㅐ'),
    conjugator.vowel_contraction('ㅡ', 'ㅓ', 'ㅓ'),
    conjugator.vowel_contraction('ㅜ', 'ㅓ', 'ㅝ'),
    conjugator.vowel_contraction('ㅗ', 'ㅏ', 'ㅘ'),
    conjugator.vowel_contraction('ㅚ', 'ㅓ', 'ㅙ'),
    conjugator.vowel_contraction('ㅙ', 'ㅓ', 'ㅙ'),
    conjugator.vowel_contraction('ㅘ', 'ㅓ', 'ㅘ'),
    conjugator.vowel_contraction('ㅝ', 'ㅓ', 'ㅝ'),
    conjugator.vowel_contraction('ㅏ', 'ㅏ', 'ㅏ'),
    conjugator.vowel_contraction('ㅡ', 'ㅏ', 'ㅏ'),
    conjugator.vowel_contraction('ㅣ', 'ㅓ', 'ㅕ'),
    conjugator.vowel_contraction('ㅓ', 'ㅓ', 'ㅓ'),
    conjugator.vowel_contraction('ㅓ', 'ㅣ', 'ㅐ'),
    conjugator.vowel_contraction('ㅏ', 'ㅣ', 'ㅐ'),
    conjugator.vowel_contraction('ㅑ', 'ㅣ', 'ㅒ'),
    conjugator.vowel_contraction('ㅒ', 'ㅓ', 'ㅒ'),
    conjugator.vowel_contraction('ㅔ', 'ㅓ', 'ㅔ'),
    conjugator.vowel_contraction('ㅕ', 'ㅓ', 'ㅕ'),
    conjugator.vowel_contraction('ㅏ', 'ㅕ', 'ㅐ'),
    conjugator.vowel_contraction('ㅖ', 'ㅓ', 'ㅖ'),
    conjugator.vowel_contraction('ㅞ', 'ㅓ', 'ㅞ'),
    conjugator.dont_insert_eh,
    conjugator.insert_eh({'면': true, '세': true, '십': true}),
    // default rule
    function (x, y) {
        return ['join', x + y];
    }
];

conjugator.reasons = [];

conjugator.merge = function(x, y) {
    /* concatenates every element in a list using the rules to
       merge the strings
    */
    var response = null;
    conjugator.merge_rules.forEach(function(rule) {
        if (!response) {
            output = rule(x, y);
            if (output) {
                conjugator.reasons.push((output[0] ? output[0] : '') + ' (' + x + ' + ' + y + ' -> ' + output[1] + ')');
                response = output[1];
            }
        }
    });
    return response;
};

conjugator.both_regular_and_irregular = {
    '일': true, '곱': true, '파묻': true, '누르': true, '묻': true, '이르': true,
    '되묻': true, '썰': true, '붓': true, '들까불': true, '굽': true, '걷': true,
    '뒤까불': true, '까불': true
};

conjugator.not_p_irregular = {'털썩이잡': true, '넘겨잡': true, '우접': true, '입': true, '맞접': true, '문잡': true, '다잡': true, '까뒤집': true, '배좁': true, '목잡': true, '끄집': true, '잡': true, '옴켜잡': true, '검잡': true, '되순라잡': true, '내씹': true, '모집': true, '따잡': true, '엇잡': true, '까집': true, '겹집': true, '줄통뽑': true, '버르집': true, '지르잡': true, '추켜잡': true, '업': true, '되술래잡': true, '되접': true, '좁디좁': true, '더위잡': true, '말씹': true, '내뽑': true, '집': true, '걸머잡': true, '휘어잡': true, '꿰입': true, '황잡': true, '에굽': true, '내굽': true, '따라잡': true, '맞뒤집': true, '둘러업': true, '늘잡': true, '끄잡': true, '우그려잡': true, '어줍': true, '언걸입': true, '들이곱': true, '껴잡': true, '곱 접': true, '훔켜잡': true, '늦추잡': true, '갈아입': true, '친좁': true, '희짜뽑': true, '마음잡': true, '개미잡': true, '옴씹': true, '치잡': true, '그러잡': true, '움켜잡': true, '씹': true, '비집': true, '꼽': true, '살잡': true, '죄입': true, '졸잡': true, '가려잡': true, '뽑': true, '걷어잡': true, '헐잡': true, '돌라입': true, '덧잡': true, '얕잡': true, '낫잡': true, '부여잡': true, '맞붙잡': true, '걸입': true, '주름잡': true, '걷어입': true, '빌미잡': true, '개잡': true, '겉잡': true, '안쫑잡': true, '좁': true, '힘입': true, '걷잡': true, '바르집': true, '감씹': true, '짓씹': true, '손잡': true, '포집': true, '붙잡': true, '낮잡': true, '책잡': true, '곱잡': true, '흉잡': true, '뒤집': true, '땡잡': true, '어림잡': true, '덧껴입': true, '수줍': true, '뒤잡': true, '꼬집': true, '예굽': true, '덮쳐잡': true, '헛잡': true, '되씹': true, '낮추잡': true, '날파람잡': true, '틀어잡': true, '헤집': true, '남의달잡': true, '바로잡': true, '흠잡': true, '파잡': true, '얼추잡': true, '손꼽': true, '접': true, '차려입': true, '골라잡': true, '거머잡': true, '후려잡': true, '머줍': true, '넉장뽑': true, '사로잡': true, '덧입': true, '껴입': true, '얼입': true, '우집': true, '설잡': true, '늦잡': true, '비좁': true, '고르잡': true, '때려잡': true, '떼집': true, '되잡': true, '홈켜잡': true, '내곱': true, '곱씹': true, '빼입': true, '들이굽': true, '새잡': true, '이르집': true, '떨쳐입': true};

conjugator.not_s_irregular = {'내솟': true, '빗': true, '드솟': true, '비웃': true, '뺏': true, '샘솟': true, '벗': true, '들이웃': true, '솟': true, '되뺏': true, '빼앗': true, '밧': true, '애긋': true, '짜드라웃': true, '어그솟': true, '들솟': true, '씻': true, '빨가벗': true, '깃': true, '벌거벗': true, '엇': true, '되빼앗': true, '웃': true, '앗': true, '헐벗': true, '용솟': true, '덧솟': true, '발가벗': true, '뻘거벗': true, '날솟': true, '치솟': true};

conjugator.not_d_irregular = {'맞받': true, '내딛': true, '내리받': true, '벋': true, '뒤닫': true, '주고받': true, '공얻': true, '무뜯': true, '물어뜯': true, '여닫': true, '그러묻': true, '잇닫': true, '덧묻': true, '되받': true, '뻗': true, '올리닫': true, '헐뜯': true, '들이닫': true, '활걷': true, '겉묻': true, '닫': true, '창받': true, '건네받': true, '물손받': true, '들이받': true, '강요받': true, '내리벋': true, '받': true, '이어받': true, '부르걷': true, '응받': true, '검뜯': true, '인정받': true, '내려딛': true, '내쏟': true, '내리뻗': true, '너름받': true, '세받': true, '내 돋': true, '돌려받': true, '쥐어뜯': true, '껴묻': true, '본받': true, '뒤받': true, '강종받': true, '내리닫': true, '떠받': true, '테받': true, '내받': true, '흠뜯': true, '두남받': true, '치받': true, '부르돋': true, '대받': true, '설굳': true, '처닫': true, '얻': true, '들이돋': true, '돋': true, '죄받': true, '쏟': true, '씨받': true, '딱장받': true, '치걷': true, '믿': true, '치벋': true, '버림받': true, '북돋': true, '딛': true, '치고받': true, '욱걷': true, '물려받': true, '뜯': true, '줴뜯': true, '넘겨받': true, '안받': true, '내뻗': true, '내리쏟': true, '벋딛': true, '뒤묻': true, '뻗딛': true, '치뻗': true, '치닫': true, '줄밑걷': true, '굳': true, '내닫': true, '내림받': true};

conjugator.not_h_irregular = {'들이좋': true, '터놓': true, '접어놓': true, '좋': true, '풀어놓': true, '내쌓': true, '꼴좋': true, '치쌓': true, '물어넣': true, '잇닿': true, '끝닿': true, '그러넣': true, '뽕놓': true, '낳': true, '내리찧': true, '힘닿': true, '내려놓': true, '세놓': true, '둘러놓': true, '들놓': true, '맞찧': true, '잡아넣': true, '돌라쌓': true, '덧쌓': true, '갈라땋': true, '주놓': true, '갈라놓': true, '들이닿': true, '집어넣': true, '닿': true, '의좋': true, '막놓': true, '내놓': true, '들여놓': true, '사놓': true, '썰레놓': true, '짓찧': true, '벋놓': true, '찧': true, '침놓': true, '들이찧': true, '둘러쌓': true, '털어놓': true, '담쌓': true, '돌라놓': true, '되잡아넣': true, '끌어넣': true, '덧놓': true, '맞닿': true, '처넣': true, '빻': true, '뻥놓': true, '내리쌓': true, '곱놓': true, '설레발놓': true, '우겨넣': true, '놓': true, '수놓': true, '써넣': true, '널어놓': true, '덮쌓': true, '연닿': true, '헛놓': true, '돌려놓': true, '되쌓': true, '욱여넣': true, '앗아넣': true, '올려놓': true, '헛방놓': true, '날아놓': true, '뒤놓': true, '업수놓': true, '가로놓': true, '맞놓': true, '펴놓': true, '내켜놓': true, '쌓': true, '끙짜놓': true, '들이쌓': true, '겹쌓': true, '기추놓': true, '넣': true, '불어넣': true, '늘어놓': true, '긁어놓': true, '어긋놓': true, '앞넣': true, '눌러놓': true, '땋': true, '들여쌓': true, '빗놓': true, '사이좋': true, '되놓': true, '헛불놓': true, '몰아넣': true, '먹놓': true, '밀쳐놓': true, '살닿': true, '피새놓': true, '빼놓': true, '하차놓': true, '틀어넣': true};

conjugator.not_l_euh_irregular = {'우러르': true, '따르': true, '붙따르': true, '늦치르': true, '다다르': true, '잇따르': true, '치르': true};

conjugator.not_l_irregular = {};

conjugator.after_last_space = function(infinitive) {
    return infinitive.split(' ').reverse()[0];
};

conjugator.is_s_irregular = function(infinitive, regular) {
    if (regular) {
        return false;
    }
    return hangeul.match(infinitive.charAt(infinitive.length-1), '*', '*', 'ᆺ') &&
           !(conjugator.after_last_space(infinitive) in conjugator.not_s_irregular);
};


conjugator.is_l_irregular = function(infinitive, regular) {
    if (regular) {
        return false;
    }
    return hangeul.match(infinitive.charAt(infinitive.length-1), '*', '*', 'ᆯ') &&
           !(conjugator.after_last_space(infinitive) in conjugator.not_l_irregular);
}

conjugator.is_l_euh_irregular = function(infinitive, regular) {
    if (regular) {
        return false;
    }
    return hangeul.match(infinitive.charAt(infinitive.length-1), 'ᄅ', 'ㅡ', null) &&
           !(conjugator.after_last_space(infinitive) in conjugator.not_l_euh_irregular);
};

conjugator.is_h_irregular = function(infinitive, regular) {
    if (regular) {
        return false;
    }
    return (hangeul.padchim(infinitive.charAt(infinitive.length-1)) == 'ᇂ' ||
           infinitive.charAt(infinitive.length-1) == '러') &&
           !(conjugator.after_last_space(infinitive) in conjugator.not_h_irregular);
};

conjugator.is_p_irregular = function(infinitive, regular) {
    if (regular) {
        return false;
    }
    return hangeul.match(infinitive.charAt(infinitive.length-1), '*', '*', 'ᆸ') &&
           !(conjugator.after_last_space(infinitive) in conjugator.not_p_irregular);
};

conjugator.is_d_irregular = function(infinitive, regular) {
    if (regular) {
        return false;
    }
    return hangeul.match(infinitive.charAt(infinitive.length-1), '*', '*', 'ᆮ') &&
           !(conjugator.after_last_space(infinitive) in conjugator.not_d_irregular);
};

conjugator.verb_types = {
    'ㅅ 불규칙 동사 (irregular verb)': conjugator.is_s_irregular,
    'ㄹ 불규칙 동사 (irregular verb)': conjugator.is_l_irregular,
    '르 불규칙 동사 (irregular verb)': conjugator.is_l_euh_irregular,
    'ㅎ 불규칙 동사 (irregular verb)': conjugator.is_h_irregular,
    'ㅂ 불규칙 동사 (irregular verb)': conjugator.is_p_irregular,
    'ㄷ 불규칙 동사 (irregular verb)': conjugator.is_d_irregular
};

conjugator.verb_type = function(infinitive, regular) {
    if (regular) {
        return 'regular verb';
    }
    for (irregular_name in conjugator.verb_types) {
        func = conjugator.verb_types[irregular_name];
        if (func(conjugator.base(infinitive))) {
            return irregular_name;
        }
    }
    return 'regular verb';
}

conjugator.base = function(infinitive, regular) {
    if (infinitive.charAt(infinitive.length-1) == '다') {
        return infinitive.substring(0, infinitive.length-1);
    } else {
        return infinitive;
    }
};

conjugator.base2 = function(infinitive, regular) {
    infinitive = conjugator.base(infinitive, regular);

    if (infinitive == '아니') {
        infinitive = new hangeul.Geulja('아니');
        infinitive.hidden_padchim = true;
        return infinitive;
    }
    if (infinitive == '뵙') {
        return '뵈';
    }
    if (infinitive == '푸') {
        return '퍼';
    }
    new_infinitive = infinitive;
    if (conjugator.is_h_irregular(infinitive, regular)) {
        new_infinitive = conjugator.merge(infinitive.substring(0, infinitive.length-1) +
                                          hangeul.join(hangeul.lead(infinitive.charAt(infinitive.length-1)),
                                                       hangeul.vowel(infinitive.charAt(infinitive.length-1))),
                                          '이');
        conjugator.reasons.push('ㅎ irregular (' + infinitive + ' -> ' + new_infinitive + ')');
    } else if (conjugator.is_p_irregular(infinitive, regular)) {
        // only some verbs get ㅗ (highly irregular)
        if (infinitive in {'묻잡': true} ||
            infinitive.charAt(infinitive.length-1) in {'돕': true, '곱': true}) {
            new_vowel = 'ㅗ';
        } else {
            new_vowel = 'ㅜ';
        }
        new_infinitive = conjugator.merge(infinitive.substring(0, infinitive.length-1) +
                                          hangeul.join(hangeul.lead(infinitive.charAt(infinitive.length-1)),
                                                       hangeul.vowel(infinitive.charAt(infinitive.length-1))),
                                          hangeul.join('ᄋ', new_vowel))
        conjugator.reasons.push('ㅂ irregular (' + infinitive + ' -> ' + new_infinitive + ')');
    } else if (conjugator.is_d_irregular(infinitive, regular)) {
        new_infinitive = new hangeul.Geulja(infinitive.substring(0, infinitive.length-1) +
                                            hangeul.join(hangeul.lead(infinitive.charAt(infinitive.length-1)),
                                            hangeul.vowel(infinitive.charAt(infinitive.length-1)),
                                             'ᆯ'));
        new_infinitive.original_padchim = 'ᆮ';
        conjugator.reasons.push('ㄷ irregular (' + infinitive + ' -> ' + new_infinitive + ')');
    } else if (conjugator.is_s_irregular(infinitive, regular)) {
        new_infinitive = new hangeul.Geulja(infinitive.substring(0, infinitive.length-1) +
                                            hangeul.join(hangeul.lead(infinitive.charAt(infinitive.length-1)),
                                            hangeul.vowel(infinitive.charAt(infinitive.length-1))));
        new_infinitive.hidden_padchim = true;
        conjugator.reasons.push('ㅅ irregular (' + infinitive + ' -> ' + new_infinitive + ' [hidden padchim])');
    }
    return new_infinitive;
};

conjugator.base3 = function(infinitive, regular) {
    infinitive = conjugator.base(infinitive, regular);
    if (infinitive == '아니') {
        return '아니';
    }
    if (infinitive == '푸') {
        return '푸';
    }
    if (infinitive == '뵙') {
        return '뵈';
    }
    if (conjugator.is_h_irregular(infinitive, regular)) {
        return infinitive.substring(0, infinitive.length-1) +
               hangeul.join(hangeul.lead(infinitive.charAt(infinitive.length-1)),
                            hangeul.vowel(infinitive.charAt(infinitive.length-1)))
    } else if (conjugator.is_p_irregular(infinitive, regular)) {
        return infinitive.substring(0, infinitive.length-1) +
               hangeul.join(hangeul.lead(infinitive.charAt(infinitive.length-1)),
                            hangeul.vowel(infinitive.charAt(infinitive.length-1))) + '우';
    } else {
        return conjugator.base2(infinitive, regular);
    }
};

conjugator.declarative_present_informal_low = function(infinitive, regular, further_use) {
    infinitive = conjugator.base2(infinitive, regular);
    if (!further_use && ((infinitive == '이' && !infinitive.hidden_padchim) ||
                         infinitive == '아니') ||
                        (regular && infinitive.charAt(infinitive.length-1) == '이')) {
        conjugator.reasons.push('야 irregular');
        return infinitive + '야';
    }
    // 르 irregular
    if (regular && infinitive == '이르') {
        return '일러';
    }
    if (conjugator.is_l_euh_irregular(infinitive, regular)) {
        new_base = infinitive.substring(0, infinitive.length-2) +
                   hangeul.join(hangeul.lead(infinitive[infinitive.length-2]),
                                hangeul.vowel(infinitive[infinitive.length-2]),
                                'ᆯ');
        if (infinitive.substring(infinitive.length-2, infinitive.length) in {'푸르': true, '이르': true}) {
            new_base = new_base + hangeul.join('ᄅ',
                                               hangeul.vowel(hangeul.find_vowel_to_append(new_base)))
            conjugator.reasons.push('irregular stem + ' + infinitive + ' -> ' + new_base);
            return infinitive + '러';
        } else if (hangeul.find_vowel_to_append(infinitive.substring(0, infinitive.length-1)) == '아') {
            new_base += '라'
            conjugator.reasons.push('르 irregular stem change [' + infinitive + ' -> ' + new_base + ']');
            return new_base;
        } else {
            new_base += '러';
            conjugator.reasons.push('르 irregular stem change [' + infinitive + ' -> ' + new_base + ']');
            return new_base;
        }
    } else if (infinitive.charAt(infinitive.length-1) == '하') {
        return conjugator.merge(infinitive, '여');
    } else if (conjugator.is_h_irregular(infinitive, regular)) {
        return conjugator.merge(infinitive, '이');
    }
    return conjugator.merge(infinitive, hangeul.find_vowel_to_append(infinitive));
};
conjugator.declarative_present_informal_low.conjugation = true;

conjugator.declarative_present_informal_high = function(infinitive, regular) {
    infinitive = conjugator.base2(infinitive, regular)
    if ((infinitive == '이' && !infinitive.hidden_padchim) ||
        (infinitive.charAt(infinitive.length-1) == '이' && regular) ||
        infinitive == '아니') {
        conjugator.reasons.push('에요 irregular')
        return infinitive + '에요';
    }
    return conjugator.merge(conjugator.declarative_present_informal_low(infinitive, regular, true), '요');
};
conjugator.declarative_present_informal_high.conjugation = true;

conjugator.declarative_present_formal_low = function(infinitive, regular) {
    if (conjugator.is_l_irregular(conjugator.base(infinitive), regular)) {
        return conjugator.drop_l_and_borrow_padchim(conjugator.base(infinitive, regular), '는다');
    }
    return conjugator.merge(conjugator.base(infinitive, regular), '는다');
};
conjugator.declarative_present_formal_low.conjugation = true;

conjugator.declarative_present_formal_high = function(infinitive, regular) {
    if (conjugator.is_l_irregular(conjugator.base(infinitive), regular)) {
        return conjugator.drop_l_and_borrow_padchim(conjugator.base(infinitive, regular), '습니다');
    }
    return conjugator.merge(conjugator.base(infinitive, regular), '습니다')
};
conjugator.declarative_present_formal_high.conjugation = true;

conjugator.past_base = function(infinitive, regular) {
    ps = conjugator.declarative_present_informal_low(infinitive, regular, true);
    if (hangeul.find_vowel_to_append(ps) == '아') {
        return conjugator.merge(ps, '았');
    } else {
        return conjugator.merge(ps, '었');
    }
};
conjugator.past_base.conjugation = true;

conjugator.declarative_past_informal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.past_base(infinitive, regular), '어');
};
conjugator.declarative_past_informal_low.conjugation = true;

conjugator.declarative_past_informal_high = function(infinitive, regular) {
    return conjugator.merge(conjugator.declarative_past_informal_low(infinitive, regular), '요');
};
conjugator.declarative_past_informal_high.conjugation = true;

conjugator.declarative_past_formal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.past_base(infinitive, regular), '다');
};
conjugator.declarative_past_formal_low.conjugation = true;

conjugator.declarative_past_formal_high = function(infinitive, regular) {
    return conjugator.merge(conjugator.past_base(infinitive, regular), '습니다');
};
conjugator.declarative_past_formal_high.conjugation = true;

conjugator.future_base = function(infinitive, regular) {
    if (conjugator.is_l_irregular(conjugator.base(infinitive, regular))) {
        return conjugator.drop_l_and_borrow_padchim(conjugator.base3(infinitive, regular), '을');
    }
    return conjugator.merge(conjugator.base3(infinitive, regular), '을');
};
conjugator.future_base.conjugation = true;

conjugator.declarative_future_informal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.future_base(infinitive, regular), ' 거야');
};
conjugator.declarative_future_informal_low.conjugation = true;

conjugator.declarative_future_informal_high = function(infinitive, regular) {
    return conjugator.merge(conjugator.future_base(infinitive, regular), ' 거예요');
};
conjugator.declarative_future_informal_high.conjugation = true;

conjugator.declarative_future_formal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.future_base(infinitive, regular), ' 거다');
};
conjugator.declarative_future_formal_low.conjugation = true;

conjugator.declarative_future_formal_high = function(infinitive, regular) {
    return conjugator.merge(conjugator.future_base(infinitive, regular), ' 겁니다');
};
conjugator.declarative_future_formal_high.conjugation = true;

conjugator.declarative_future_conditional_informal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.base(infinitive, regular), '겠어');
};
conjugator.declarative_future_conditional_informal_low.conjugation = true;

conjugator.declarative_future_conditional_informal_high = function(infinitive, regular) {
    return conjugator.merge(conjugator.base(infinitive, regular), '겠어요');
};
conjugator.declarative_future_conditional_informal_high.conjugation = true;

conjugator.declarative_future_conditional_formal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.base(infinitive, regular), '겠다');
};
conjugator.declarative_future_conditional_formal_low.conjugation = true;

conjugator.declarative_future_conditional_formal_high = function(infinitive, regular) {
    return conjugator.merge(conjugator.base(infinitive, regular), '겠습니다');
};
conjugator.declarative_future_conditional_formal_high.conjugation = true;

conjugator.inquisitive_present_informal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.declarative_present_informal_low(infinitive, regular), '?');
};
conjugator.inquisitive_present_informal_low.conjugation = true;

conjugator.inquisitive_present_informal_high = function(infinitive, regular) {
    return conjugator.merge(conjugator.declarative_present_informal_high(infinitive, regular), '?');
};
conjugator.inquisitive_present_informal_high.conjugation = true;

conjugator.inquisitive_present_formal_low = function(infinitive, regular) {
    infinitive = conjugator.base(infinitive, regular);
    if (conjugator.is_l_irregular(infinitive, regular)) {
        return conjugator.drop_l(infinitive, '니?');
    }
    return conjugator.merge(infinitive, '니?');
};
conjugator.inquisitive_present_formal_low.conjugation = true;

conjugator.inquisitive_present_formal_high = function(infinitive, regular) {
    infinitive = conjugator.base(infinitive, regular);
    if (conjugator.is_l_irregular(infinitive, regular)) {
        return conjugator.drop_l_and_borrow_padchim(infinitive, '습니까?');
    }
    return conjugator.merge(infinitive, '습니까?');
};
conjugator.inquisitive_present_formal_high.conjugation = true;

conjugator.inquisitive_past_informal_low = function(infinitive, regular) {
    return conjugator.declarative_past_informal_low(infinitive, regular) + '?';
};
conjugator.inquisitive_past_informal_low.conjugation = true;

conjugator.inquisitive_past_informal_high = function(infinitive, regular) {
    return conjugator.merge(conjugator.declarative_past_informal_high(infinitive, regular), '?');
};
conjugator.inquisitive_past_informal_high.conjugation = true;

conjugator.inquisitive_past_formal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.past_base(infinitive, regular), '니?');
};
conjugator.inquisitive_past_formal_low.conjugation = true;

conjugator.inquisitive_past_formal_high = function(infinitive, regular) {
    return conjugator.merge(conjugator.past_base(infinitive, regular), '습니까?');
};
conjugator.inquisitive_past_formal_high.conjugation = true;

conjugator.imperative_present_informal_low = function(infinitive, regular) {
    return conjugator.declarative_present_informal_low(infinitive, regular);
};
conjugator.imperative_present_informal_low.conjugation = true;

conjugator.imperative_present_informal_high = function(infinitive, regular) {
    if (conjugator.is_l_irregular(conjugator.base(infinitive, regular))) {
        return conjugator.drop_l(conjugator.base3(infinitive, regular), '세요');
    }
    return conjugator.merge(conjugator.base3(infinitive, regular), '세요');
};
conjugator.imperative_present_informal_high.conjugation = true;

conjugator.imperative_present_formal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.imperative_present_informal_low(infinitive, regular), '라');
};
conjugator.imperative_present_formal_low.conjugation = true;

conjugator.imperative_present_formal_high = function(infinitive, regular) {
    if (conjugator.is_l_irregular(conjugator.base(infinitive, regular))) {
        return conjugator.drop_l(conjugator.base3(infinitive, regular), '십시오');
    }
    return conjugator.merge(conjugator.base3(infinitive, regular), '십시오');
};
conjugator.imperative_present_formal_high.conjugation = true;

conjugator.propositive_present_informal_low = function(infinitive, regular) {
    return conjugator.declarative_present_informal_low(infinitive, regular);
};
conjugator.propositive_present_informal_low.conjugation = true;

conjugator.propositive_present_informal_high = function(infinitive, regular) {
    return conjugator.declarative_present_informal_high(infinitive, regular);
};
conjugator.propositive_present_informal_high.conjugation = true;

conjugator.propositive_present_formal_low = function(infinitive, regular) {
    return conjugator.merge(conjugator.base(infinitive, regular), '자');
};
conjugator.propositive_present_formal_low.conjugation = true;

conjugator.propositive_present_formal_high = function(infinitive, regular) {
    infinitive = conjugator.base(infinitive);
    if (conjugator.is_l_irregular(infinitive, regular)) {
        return conjugator.drop_l_and_borrow_padchim(conjugator.base3(infinitive, regular), '읍시다');
    }
    return conjugator.merge(conjugator.base3(infinitive, regular), '읍시다');
};
conjugator.propositive_present_formal_high.conjugation = true;

conjugator.connective_if = function(infinitive, regular) {
    return conjugator.merge(conjugator.base3(infinitive, regular), '면');
};
conjugator.connective_if.conjugation = true;

conjugator.connective_and = function(infinitive, regular) {
    infinitive = conjugator.base(infinitive, regular);
    return conjugator.merge(conjugator.base(infinitive, regular), '고');
};
conjugator.connective_and.conjugation = true;

conjugator.nominal_ing = function(infinitive, regular) {
    return conjugator.merge(conjugator.base3(infinitive, regular), '음');
};
conjugator.nominal_ing.conjugation = true;

conjugator.conjugations = [];

for (f in conjugator) {
    if (f && conjugator[f].conjugation) {
        conjugator.conjugations.push(f);
    }
}

conjugator.display_conjugations = function(infinitive, regular, callback) {
    var both_regular_and_irregular = false;
    infinitive = conjugator.base(infinitive, regular);
    out = '';
    if (infinitive in conjugator.both_regular_and_irregular) {
        both_regular_and_irregular = true;
        out += '<dd class="warning">warning</dd>';
        out += '<dt>This verb has both regular and irregular forms.</dt>';
    }
    out += '<div class="conjugation"><dd>verb type</dd>';
    out += '<dt>' + conjugator.verb_type(infinitive, regular)
    if (both_regular_and_irregular) {
        out += ' <button id="form-change">view ' + (regular ? 'irregular' : 'regular') + ' form</button>';
    }
    out += '</dt></div>';
    for (conjugation in conjugator) {
        conjugator.reasons = [];
        if (conjugator[conjugation].conjugation) {
            out += '<div class="conjugation"><dd>' + conjugation.replace(/_/g, ' ') + '</dd>';
            var conjugated = conjugator[conjugation](infinitive, regular);
            var pron = pronunciation.get_pronunciation(conjugated);
            var romanized = romanization.romanize(pron);
            out += '<dt>' + conjugated + ' <button class="show-reasons">↴</button></dt>';
            out += '<ul class="reasons">';
            out += '<li>pronunciation [' + (pron != conjugated ? (pron + ' / ') : '') + romanized + ']</li>';
            for (reason in conjugator.reasons) {
                out += '<li>' + conjugator.reasons[reason] + '</li>';
            }
            out += '</ul></div>';
        }
    }
    callback(out);
};

conjugator.each_conjugation = function(infinitive, regular, callback) {
    infinitive = conjugator.base(infinitive, regular);
    for (conjugation in conjugator) {
        conjugator.reasons = [];
        if (conjugator[conjugation].conjugation) {
            var r = {};
            r.infinitive = infinitive;
            r.conjugation_name = conjugation.replace(/_/g, ' ');
            r.conjugated = conjugator[conjugation](infinitive, regular);
            r.pronunciation = pronunciation.get_pronunciation(r.conjugated);
            r.romanized = romanization.romanize(r.pronunciation);
            r.reasons = [];
            for (reason in conjugator.reasons) {
                r.reasons.push(conjugator.reasons[reason]);
            }
            callback(r);
        }
    }
};

// Export functions to node
try {
    for (f in conjugator) {
        exports[f] = conjugator[f];
    }
} catch(e) {}

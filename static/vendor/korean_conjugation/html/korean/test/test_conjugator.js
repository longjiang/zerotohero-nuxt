try {
    var conjugator = require('../conjugator'),
        assert     = require('assert');
} catch(e) {}

var rule = conjugator.no_padchim_rule({'을': true, '습': true, '읍': true, '는': true, '음': true});
assert.deepEqual(rule('하', '습'), ['borrow padchim', '합']);

var rule = conjugator.vowel_contraction('ㅐ', 'ㅓ', 'ㅐ');
assert.deepEqual(rule('해', '어'), ['vowel contraction [ㅐ ㅓ -> ㅐ]', '해']);

assert.equal(conjugator.drop_l('갈', '아'), '가아');

assert.equal(conjugator.drop_l_and_borrow_padchim('갈', '습'), '갑');

assert.deepEqual(conjugator.dont_insert_eh('알', '면'), ['join', '알면']);

var rule = conjugator.insert_eh({'면': true, '세': true, '십': true});
assert.deepEqual(rule('갔', '면'), ['padchim + consonant -> insert 으', '갔으면']);

assert.deepEqual(conjugator.lm_merge('살', '음'), ['ㄹ + ㅁ -> ᆱ', '삶']);

assert.equal(conjugator.merge('오', '아요'), '와요');
assert.equal(conjugator.merge('오', '아'), '와');
assert.equal(conjugator.merge('갔', '면'), '갔으면');
assert.equal(conjugator.merge('맡', '세요'), '맡으세요');
assert.equal(conjugator.merge('맡', '세요'), '맡으세요');
assert.equal(conjugator.merge('해', '었'), '했');
//sys.puts(conjugator.reasons);
//assert.deepEqual(conjugator.reasons, ['vowel contraction [ㅗ + ㅏ -> ㅘ] (오 + 아요 -> 와요)']);
//
assert.equal(conjugator.after_last_space('시작을 하다'), '하다');

assert.equal(conjugator.is_s_irregular('내솟'), false);
assert.equal(conjugator.is_s_irregular('낫'), true);
assert.equal(conjugator.is_s_irregular('낫', true), false);

assert.equal(conjugator.is_l_irregular('알'), true);
assert.equal(conjugator.is_l_irregular('알', true), false);

assert.equal(conjugator.is_l_euh_irregular('아르'), true);
assert.equal(conjugator.is_l_euh_irregular('아르', true), false);

assert.equal(conjugator.is_h_irregular('가맣'), true);
assert.equal(conjugator.is_h_irregular('가맣', true), false);
assert.equal(conjugator.is_h_irregular('좋'), false);

assert.equal(conjugator.is_p_irregular('춥'), true);
assert.equal(conjugator.is_p_irregular('춥', true), false);

assert.equal(conjugator.is_d_irregular('묻'), true);
assert.equal(conjugator.is_d_irregular('묻', true), false);

assert.equal(conjugator.verb_type('낫다'), 'ㅅ 불규칙 동사 (irregular verb)');
assert.equal(conjugator.verb_type('모르다'), '르 불규칙 동사 (irregular verb)');
assert.equal(conjugator.verb_type('까맣다'), 'ㅎ 불규칙 동사 (irregular verb)');
assert.equal(conjugator.verb_type('춥다'), 'ㅂ 불규칙 동사 (irregular verb)');
assert.equal(conjugator.verb_type('캐묻다'), 'ㄷ 불규칙 동사 (irregular verb)');
assert.equal(conjugator.verb_type('알다'), 'ㄹ 불규칙 동사 (irregular verb)');
assert.equal(conjugator.verb_type('가다'), 'regular verb');

assert.equal(conjugator.base('알다'), '알');

assert.equal(conjugator.base2('알다'), '알');

assert.equal(conjugator.base2('곱다'), '고오');

assert.equal(conjugator.base2('아니'), '아니');

assert.equal(conjugator.base3('돕다'), '도우');

assert.equal(conjugator.declarative_present_informal_low('모이다'), '모여');
assert.equal(conjugator.declarative_present_informal_high('모이다'), '모여요');
assert.equal(conjugator.declarative_present_informal_low('이르다', true), '일러');
assert.equal(conjugator.declarative_present_informal_low('이르다'), '이르러');
assert.equal(conjugator.declarative_present_informal_low('받다'), '받아');
assert.equal(conjugator.declarative_present_informal_low('주고 받다'), '주고 받아');
assert.equal(conjugator.declarative_present_informal_low('민주적이다', true), '민주적이야');
assert.equal(conjugator.declarative_present_informal_high('민주적이다', true), '민주적이에요');
// needed a random verb to test regularifying ㅅ :-)
assert.equal(conjugator.declarative_present_informal_low('귯'), '규어');
assert.equal(conjugator.declarative_present_informal_low('치르다'), '치러');
assert.equal(conjugator.declarative_present_informal_low('줍다'), '주워');
assert.equal(conjugator.declarative_present_informal_low('동트다'), '동터');
assert.equal(conjugator.declarative_present_informal_low('농트다'), '농터');
assert.equal(conjugator.declarative_present_informal_low('엇다'), '엇어');
assert.equal(conjugator.declarative_present_informal_low('푸다'), '퍼');
assert.equal(conjugator.declarative_present_informal_low('깃다'), '깃어');
assert.equal(conjugator.declarative_present_informal_low('그러다'), '그래');
assert.equal(conjugator.declarative_present_informal_low('애긋다'), '애긋어');
assert.equal(conjugator.declarative_present_informal_low('되묻다'), '되물어');
assert.equal(conjugator.declarative_present_informal_low('밧다'), '밧아');
assert.equal(conjugator.declarative_present_informal_low('힘닿다'), '힘닿아');
assert.equal(conjugator.declarative_present_informal_low('용솟다'), '용솟아');
assert.equal(conjugator.declarative_present_informal_low('쌓다'), '쌓아');
assert.equal(conjugator.declarative_present_informal_low('파묻다', true), '파묻어');
assert.equal(conjugator.declarative_present_informal_low('부르걷다'), '부르걷어');
assert.equal(conjugator.declarative_present_informal_low('되묻다', true), '되묻어');
assert.equal(conjugator.declarative_present_informal_low('뵙다'), '봬');
assert.equal(conjugator.declarative_present_informal_low('쏟다'), '쏟아');
assert.equal(conjugator.declarative_present_informal_low('묻잡다'), '묻자와');
assert.equal(conjugator.declarative_present_informal_low('가로닫다'), '가로달아');
assert.equal(conjugator.declarative_present_informal_low('동트다'), '동터');
assert.equal(conjugator.declarative_present_informal_low('농트다'), '농터');
assert.equal(conjugator.declarative_present_informal_low('농트다'), '농터');
assert.equal(conjugator.declarative_present_informal_low('엇다'), '엇어');
assert.equal(conjugator.declarative_present_informal_low('푸다'), '퍼');
assert.equal(conjugator.declarative_present_informal_low('깃다'), '깃어');
assert.equal(conjugator.declarative_present_informal_low('그러다'), '그래');
assert.equal(conjugator.declarative_present_informal_low('애긋다'), '애긋어');
assert.equal(conjugator.declarative_present_informal_low('되묻다'), '되물어');
assert.equal(conjugator.declarative_present_informal_low('밧다'), '밧아');
assert.equal(conjugator.declarative_present_informal_low('힘닿다'), '힘닿아');
assert.equal(conjugator.declarative_present_informal_low('용솟다'), '용솟아');
assert.equal(conjugator.declarative_present_informal_low('쌓다'), '쌓아');
assert.equal(conjugator.declarative_present_informal_low('파묻다', true), '파묻어');
assert.equal(conjugator.declarative_present_informal_low('부르걷다'), '부르걷어');
assert.equal(conjugator.declarative_present_informal_low('되묻다', true), '되묻어');
assert.equal(conjugator.declarative_present_informal_low('뵙다'), '봬');
assert.equal(conjugator.declarative_present_informal_low('놓다'), '놓아');
//assert.equal(conjugator.declarative_present_informal_low('요러다'), '요래');
assert.equal(conjugator.declarative_present_informal_low('내솟다'), '내솟아');
assert.equal(conjugator.declarative_present_informal_low('북돋다'), '북돋아');
assert.equal(conjugator.declarative_present_informal_low('부르돋다'), '부르돋아');
assert.equal(conjugator.declarative_present_informal_low('뒤묻다'), '뒤묻어');
assert.equal(conjugator.declarative_present_informal_low('껴묻다'), '껴묻어');
assert.equal(conjugator.declarative_present_informal_low('그러묻다'), '그러묻어');
assert.equal(conjugator.declarative_present_informal_low('겉묻다'), '겉묻어');
assert.equal(conjugator.declarative_present_informal_low('손쓰다'), '손써');
assert.equal(conjugator.declarative_present_informal_low('따르다'), '따라');
assert.equal(conjugator.declarative_present_informal_low('악쓰다'), '악써');
assert.equal(conjugator.declarative_present_informal_low('활걷다'), '활걷어');
assert.equal(conjugator.declarative_present_informal_low('파묻다'), '파물어');
assert.equal(conjugator.declarative_present_informal_low('캐묻다'), '캐물어');
assert.equal(conjugator.declarative_present_informal_low('줄밑걷다'), '줄밑걷어');
assert.equal(conjugator.declarative_present_informal_low('묻다'), '물어');
assert.equal(conjugator.declarative_present_informal_low('예굽다'), '예굽어');
assert.equal(conjugator.declarative_present_informal_low('에굽다'), '에굽어');
assert.equal(conjugator.declarative_present_informal_low('치걷다'), '치걷어');
assert.equal(conjugator.declarative_present_informal_low('욱걷다'), '욱걷어');
assert.equal(conjugator.declarative_present_informal_low('설굳다'), '설굳어');
assert.equal(conjugator.declarative_present_informal_low('내리벋다'), '내리벋어');
assert.equal(conjugator.declarative_present_informal_low('내딛다'), '내딛어');
assert.equal(conjugator.declarative_present_informal_low('굳다'), '굳어');
assert.equal(conjugator.declarative_present_informal_low('흉업다'), '흉어워');
assert.equal(conjugator.declarative_present_informal_low('빛접다'), '빛저워');
assert.equal(conjugator.declarative_present_informal_low('바잡다'), '바자워');
//assert.equal(conjugator.declarative_present_informal_low('허여멀겋다'), '허여멀게');
assert.equal(conjugator.declarative_present_informal_low('켜다'), '켜');
assert.equal(conjugator.declarative_present_informal_low('폐다'), '폐');
assert.equal(conjugator.declarative_present_informal_low('서릊다'), '서릊어');
assert.equal(conjugator.declarative_present_informal_low('홉뜨다'), '홉떠');
assert.equal(conjugator.declarative_present_informal_low('접다'), '접어');
assert.equal(conjugator.declarative_present_informal_low('업다'), '업어');
assert.equal(conjugator.declarative_present_informal_low('뺏다'), '뺏어');
assert.equal(conjugator.declarative_present_informal_low('겉약다'), '겉약아');
assert.equal(conjugator.declarative_present_informal_low('흠뜯다'), '흠뜯어');
assert.equal(conjugator.declarative_present_informal_low('수줍다'), '수줍어');
assert.equal(conjugator.declarative_present_informal_low('이르다'), '이르러');
assert.equal(conjugator.declarative_present_informal_low('엷푸르다'), '엷푸르러');
assert.equal(conjugator.declarative_present_informal_low('덧묻다'), '덧묻어');
assert.equal(conjugator.declarative_present_informal_low('묻다', true), '묻어');
assert.equal(conjugator.declarative_present_informal_low('끄집다'), '끄집어');
assert.equal(conjugator.declarative_present_informal_low('내리찧다'), '내리찧어');
assert.equal(conjugator.declarative_present_informal_low('헐벗다'), '헐벗어');
assert.equal(conjugator.declarative_present_informal_low('빼입다'), '빼입어');
assert.equal(conjugator.declarative_present_informal_low('많다'), '많아');
assert.equal(conjugator.declarative_present_informal_low('앗다'), '앗아');
assert.equal(conjugator.declarative_present_informal_low('좋다'), '좋아');
assert.equal(conjugator.declarative_present_informal_low('만들다'), '만들어');
assert.equal(conjugator.declarative_present_informal_low('어떻다'), '어때');
assert.equal(conjugator.declarative_present_informal_low('까맣다'), '까매');
assert.equal(conjugator.declarative_present_informal_low('하얗다'), '하얘');
assert.equal(conjugator.declarative_present_informal_low('잡'), '잡아');
assert.equal(conjugator.declarative_present_informal_low('뽑'), '뽑아');
assert.equal(conjugator.declarative_present_informal_low('입'), '입어');
assert.equal(conjugator.declarative_present_informal_low('아프다'), '아파');
assert.equal(conjugator.declarative_present_informal_low('하'), '해');
assert.equal(conjugator.declarative_present_informal_low('가'), '가');
assert.equal(conjugator.declarative_present_informal_low('오'), '와');
assert.equal(conjugator.declarative_present_informal_low('피우'), '피워');
assert.equal(conjugator.declarative_present_informal_low('듣'), '들어');
assert.equal(conjugator.declarative_present_informal_low('춥'), '추워');
assert.equal(conjugator.declarative_present_informal_low('낫'), '나아');
assert.equal(conjugator.declarative_present_informal_low('알'), '알아');
assert.equal(conjugator.declarative_present_informal_low('기다리'), '기다려');
assert.equal(conjugator.declarative_present_informal_low('마르'), '말라');
assert.equal(conjugator.declarative_present_informal_low('부르다'), '불러');
assert.equal(conjugator.declarative_present_informal_low('되'), '돼');
assert.equal(conjugator.declarative_present_informal_low('쓰'), '써');
assert.equal(conjugator.declarative_present_informal_low('서'), '서');
assert.equal(conjugator.declarative_present_informal_low('세'), '세');
assert.equal(conjugator.declarative_present_informal_low('기다리다'), '기다려');
assert.equal(conjugator.declarative_present_informal_low('굽다'), '구워');
assert.equal(conjugator.declarative_present_informal_low('걷다'), '걸어');
assert.equal(conjugator.declarative_present_informal_low('짓다'), '지어');
assert.equal(conjugator.declarative_present_informal_low('웃다'), '웃어');
assert.equal(conjugator.declarative_present_informal_low('걸다'), '걸어');
assert.equal(conjugator.declarative_present_informal_low('깨닫다'), '깨달아');
assert.equal(conjugator.declarative_present_informal_low('남다'), '남아');
assert.equal(conjugator.declarative_present_informal_low('오르다'), '올라');
assert.equal(conjugator.declarative_present_informal_low('돕다'), '도와');
assert.equal(conjugator.declarative_present_informal_low('덥다'), '더워');
assert.equal(conjugator.declarative_present_informal_low('푸르다'), '푸르러');
assert.equal(conjugator.declarative_present_informal_low('번거롭다'), '번거로워');

assert.equal(conjugator.declarative_present_informal_high('굽다', true), '굽어요');
assert.equal(conjugator.declarative_present_informal_high('가다'), '가요');

assert.equal(conjugator.declarative_present_formal_low('가다'), '간다');
assert.equal(conjugator.declarative_present_formal_low('믿다'), '믿는다');
assert.equal(conjugator.declarative_present_formal_low('걷다'), '걷는다');
assert.equal(conjugator.declarative_present_formal_low('짓다'), '짓는다');
assert.equal(conjugator.declarative_present_formal_low('부르다'), '부른다');
assert.equal(conjugator.declarative_present_formal_low('살다'), '산다');
assert.equal(conjugator.declarative_present_formal_low('오르다'), '오른다');

assert.equal(conjugator.declarative_present_formal_high('가다'), '갑니다');
assert.equal(conjugator.declarative_present_formal_high('좋다'), '좋습니다');
assert.equal(conjugator.declarative_present_formal_high('믿다'), '믿습니다');
assert.equal(conjugator.declarative_present_formal_high('걸다'), '겁니다');
assert.equal(conjugator.declarative_present_formal_high('깨닫다'), '깨닫습니다');
assert.equal(conjugator.declarative_present_formal_high('알다'), '압니다');
assert.equal(conjugator.declarative_present_formal_high('푸르다'), '푸릅니다');

/*
assert declarative_present_informal_high('민주적이다'), '민주적이에요');
assert.equal(conjugator.propositive_present_informal_low('꿰다'), '꿰');
*/

assert.equal(conjugator.past_base('하'), '했');
assert.equal(conjugator.past_base('가'), '갔');
assert.equal(conjugator.past_base('기다리'), '기다렸');
assert.equal(conjugator.past_base('기다리다'), '기다렸');
assert.equal(conjugator.past_base('마르다'), '말랐');
assert.equal(conjugator.past_base('드르다'), '들렀');

assert.equal(conjugator.declarative_past_informal_low('푸다'), '펐어');
assert.equal(conjugator.declarative_past_informal_low('뵙다'), '뵀어');
assert.equal(conjugator.declarative_past_informal_low('쬐다'), '쬈어');
assert.equal(conjugator.declarative_past_informal_low('하'), '했어');
assert.equal(conjugator.declarative_past_informal_low('가'), '갔어');
assert.equal(conjugator.declarative_past_informal_low('먹'), '먹었어');
assert.equal(conjugator.declarative_past_informal_low('오'), '왔어');

assert.equal(conjugator.declarative_past_informal_high('하다'), '했어요');
assert.equal(conjugator.declarative_past_informal_high('가다'), '갔어요');

assert.equal(conjugator.declarative_past_formal_low('가다'), '갔다');

assert.equal(conjugator.declarative_past_formal_high('가다'), '갔습니다');

assert.equal(conjugator.future_base('가다'), '갈');
assert.equal(conjugator.future_base('가늘다'), '가늘');
assert.equal(conjugator.future_base('좋다'), '좋을');
assert.equal(conjugator.future_base('뵙다'), '뵐');

assert.equal(conjugator.declarative_future_informal_low('끌어넣다'), '끌어넣을 거야');
assert.equal(conjugator.declarative_future_informal_low('좁디좁다'), '좁디좁을 거야');
assert.equal(conjugator.declarative_future_informal_low('가다'), '갈 거야');
assert.equal(conjugator.declarative_future_informal_low('믿다'), '믿을 거야');
assert.equal(conjugator.declarative_future_informal_low('알다'), '알 거야');

assert.equal(conjugator.declarative_future_informal_high('하얗다'), '하얄 거예요');
assert.equal(conjugator.declarative_future_informal_high('가다'), '갈 거예요');
assert.equal(conjugator.declarative_future_informal_high('믿다'), '믿을 거예요');
assert.equal(conjugator.declarative_future_informal_high('걷다'), '걸을 거예요');
assert.equal(conjugator.declarative_future_informal_high('알다'), '알 거예요');

assert.equal(conjugator.declarative_future_formal_low('가다'), '갈 거다');
assert.equal(conjugator.declarative_future_formal_low('앉다'), '앉을 거다');
assert.equal(conjugator.declarative_future_formal_low('알다'), '알 거다');

assert.equal(conjugator.declarative_future_formal_high('가다'), '갈 겁니다');
assert.equal(conjugator.declarative_future_formal_high('앉다'), '앉을 겁니다');
assert.equal(conjugator.declarative_future_formal_high('알다'), '알 겁니다');

assert.equal(conjugator.declarative_future_conditional_informal_low('가다'), '가겠어');

assert.equal(conjugator.declarative_future_conditional_informal_high('가다'), '가겠어요');

assert.equal(conjugator.declarative_future_conditional_formal_low('가다'), '가겠다');

assert.equal(conjugator.declarative_future_conditional_formal_high('가다'), '가겠습니다');

assert.equal(conjugator.inquisitive_present_informal_low('가다'), '가?');
assert.equal(conjugator.inquisitive_present_informal_low('하다'), '해?');

assert.equal(conjugator.inquisitive_present_informal_high('가다'), '가요?');
assert.equal(conjugator.inquisitive_present_informal_high('걷다'), '걸어요?');

assert.equal(conjugator.inquisitive_present_formal_low('가다'), '가니?');
assert.equal(conjugator.inquisitive_present_formal_low('알다'), '아니?');

assert.equal(conjugator.inquisitive_present_formal_high('가다'), '갑니까?');
assert.equal(conjugator.inquisitive_present_formal_high('까맣다'), '까맣습니까?');

assert.equal(conjugator.inquisitive_past_informal_low('가다'), '갔어?');

assert.equal(conjugator.inquisitive_past_informal_high('가다'), '갔어요?');

assert.equal(conjugator.inquisitive_past_formal_low('가다'), '갔니?');

assert.equal(conjugator.inquisitive_past_formal_high('가다'), '갔습니까?');

assert.equal(conjugator.imperative_present_informal_low('가다'), '가');

assert.equal(conjugator.imperative_present_informal_high('가다'), '가세요');
assert.equal(conjugator.imperative_present_informal_high('돕다'), '도우세요');
assert.equal(conjugator.imperative_present_informal_high('걷다'), '걸으세요');
assert.equal(conjugator.imperative_present_informal_high('눕다'), '누우세요');
assert.equal(conjugator.imperative_present_informal_high('살다'), '사세요');
assert.equal(conjugator.imperative_present_informal_high('걸다'), '거세요');

assert.equal(conjugator.imperative_present_formal_low('가다'), '가라');
assert.equal(conjugator.imperative_present_formal_low('굽다'), '구워라');
assert.equal(conjugator.imperative_present_formal_low('살다'), '살아라');
assert.equal(conjugator.imperative_present_formal_low('서'), '서라');
assert.equal(conjugator.imperative_present_formal_low('뵙다'), '봬라');

assert.equal(conjugator.imperative_present_formal_high('가다'), '가십시오');
assert.equal(conjugator.imperative_present_formal_high('걷다'), '걸으십시오');
assert.equal(conjugator.imperative_present_formal_high('돕다'), '도우십시오');
assert.equal(conjugator.imperative_present_formal_high('알다'), '아십시오');
assert.equal(conjugator.imperative_present_formal_high('눕다'), '누우십시오');
assert.equal(conjugator.imperative_present_formal_high('뵙다'), '뵈십시오');

assert.equal(conjugator.propositive_present_informal_low('가'), '가');

assert.equal(conjugator.propositive_present_informal_high('가'), '가요');

assert.equal(conjugator.propositive_present_formal_low('가'), '가자');

assert.equal(conjugator.propositive_present_formal_high('가'), '갑시다');
assert.equal(conjugator.propositive_present_formal_high('살'), '삽시다');
assert.equal(conjugator.propositive_present_formal_high('눕다'), '누웁시다');
assert.equal(conjugator.propositive_present_formal_high('돕다'), '도웁시다');

assert.equal(conjugator.connective_if('낫'), '나으면');
assert.equal(conjugator.connective_if('짓'), '지으면');
assert.equal(conjugator.connective_if('짖'), '짖으면');
assert.equal(conjugator.connective_if('가'), '가면');
assert.equal(conjugator.connective_if('알'), '알면');
assert.equal(conjugator.connective_if('살'), '살면');
assert.equal(conjugator.connective_if('푸르다'), '푸르면');
assert.equal(conjugator.connective_if('돕다'), '도우면');

assert.equal(conjugator.connective_and('가다'), '가고');

assert.equal(conjugator.nominal_ing('살다'), '삶');
assert.equal(conjugator.nominal_ing('걷다'), '걸음');
assert.equal(conjugator.nominal_ing('가져오다'), '가져옴');
assert.equal(conjugator.nominal_ing('걷다'), '걸음');
assert.equal(conjugator.nominal_ing('그렇다'), '그럼');
assert.equal(conjugator.nominal_ing('까맣다'), '까맘');
assert.equal(conjugator.nominal_ing('돕다'), '도움');

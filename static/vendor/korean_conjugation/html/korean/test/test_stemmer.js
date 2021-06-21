try {
    var stemmer = require('../stemmer'),
        assert  = require('assert');
} catch(e) {}

assert.deepEqual(stemmer.iterate_chop_last('fred'), ['f', 'fr', 'fre', 'fred']);
assert.deepEqual(stemmer.iterate_chop_last('안녕'), ['안', '안녕']);

assert.equal(stemmer.stem('가'), '가다');
assert.equal(stemmer.stem('가요'), '가다');
assert.equal(stemmer.stem('가요'), '가다');
assert.equal(stemmer.stem('가세요'), '가다');
assert.equal(stemmer.stem('기다려'), '기다리다');
assert.equal(stemmer.stem('기다렸어'), '기다리다');
assert.equal(stemmer.stem('저었어'), '젓다');
assert.equal(stemmer.stem('가셨습니까?'), '가시다');
assert.equal(stemmer.stem('안녕하세요'), '안녕하다');
assert.equal(stemmer.stem('추워요'), '춥다');
assert.equal(stemmer.stem('지어'), '짓다');
assert.equal(stemmer.stem('도와'), '돕다');
assert.equal(stemmer.stem('더워'), '덥다');
assert.equal(stemmer.stem('갑니까?'), '갈다');
assert.equal(stemmer.stem('삶'), '살다');
assert.equal(stemmer.stem('걸음'), '걷다');
assert.equal(stemmer.stem('해'), '하다');
assert.equal(stemmer.stem('까맣습니까?'), '까맣다');
assert.equal(stemmer.stem('까매'), '까맣다');
assert.equal(stemmer.stem('그래'), '그렇다');
assert.equal(stemmer.stem('아파'), '아프다');
assert.equal(stemmer.stem('하세요'), '하다');
assert.equal(stemmer.stem('있으면'), '있다');

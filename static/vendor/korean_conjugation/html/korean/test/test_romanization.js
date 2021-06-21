try {
var romanization = require('../romanization'),
    assert       = require('assert');
} catch(e) {}

[['안녕',     'ahn-nyuhng'],
 ['시간',     'shee-gahn'],
 ['축구',     'choog-ggoo'],
 ['야구',     'yah-goo'],
 ['탁구',     'tahg-ggoo'],
 ['김치',     'geem-chee'],
 ['원숭이',   'wuhn-soong-ee'],
 ['댄',       'daen'],
 ['강남',     'gahng-nahm'],
 ['수연',     'soo-yuhn'],
 ['숭실',     'soong-sheel'],
 ['열쇠',     'yuhl-swae'],
 ['참치',     'chahm-chee'],
 ['양파',     'yahng-pah'],
 ['괜잖아',   'gwaen-chahn-ah'],
 ['이따 봐',  'ee-ttah- -bwah'],
 ['없어',     'uhp-ssuh'],
 ['합니다',   'hahm-nee-dah'],
 ['합시다',   'hahp-shee-dah'],
 ['먹을거야', 'muh-geul-guh-yah'],
 ['슈퍼',     'shyoo-puh']].forEach(function(test_data) {
     input = test_data[0];
     expected = test_data[1];
     assert.equal(romanization.romanize(input), expected);
});

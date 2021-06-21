// vim: set ts=4 sw=4 expandtab
// (C) 2010 Dan Bravender - licensed under the AGPL 3.0

function display_keyboard(div) {
    var keys = [
        ['q', 'ㅂ', 'ㅃ'],
        ['w', 'ㅈ', 'ㅉ'],
        ['e', 'ㄷ', 'ㄸ'],
        ['r', 'ㄱ', 'ㄲ'],
        ['t', 'ㅅ', 'ㅆ'],
        ['y', 'ㅛ'],
        ['u', 'ㅕ'],
        ['i', 'ㅑ'],
        ['o', 'ㅐ', 'ㅒ'],
        ['p', 'ㅔ', 'ㅖ'],
        'break',
        ['a', 'ㅁ'],
        ['s', 'ㄴ'],
        ['d', 'ㅇ'],
        ['f', 'ㄹ'],
        ['g', 'ㅎ'],
        ['h', 'ㅗ'],
        ['j', 'ㅓ'],
        ['k', 'ㅏ'],
        ['l', 'ㅣ'],
        'break',
        ['z', 'ㅋ'],
        ['c', 'ㅊ'],
        ['v', 'ㅍ'],
        ['b', 'ㅠ'],
        ['n', 'ㅜ'],
        ['m', 'ㅡ'],
        'shift',
        ['backspace', '⇐']
    ];
    hangeul_keyboard = $(div)[0];
    for (key in keys) {
        if (keys[key] == 'break') {
            $(hangeul_keyboard).append('<br/>');
        } else if (keys[key] == 'shift') {
            $(hangeul_keyboard).append('<button onclick="hangeul_keyboard_shift();">⇧</button>');
        } else {
            button = $('<button class="hangeul-keyboard" onclick="hangeul_keyboard_insert(\'' + keys[key][0] + '\', \'' + (keys[key][2] ? keys[key][0].toUpperCase() : '') + '\');" />').html(keys[key][1]);
            if (keys[key][2]) {
                hangeul_shiftables.push([button].concat(keys[key]));
            }
            $(hangeul_keyboard).append(button);
        }
    }
}

var hangeul_shiftables = [];
var hangeul_input = '';
var hangeul_shift = false;

function hangeul_keyboard_insert(key, shift_key) {
    if (key == 'backspace') {
        hangeul_input = '';
    } else {
        if (shift_key && hangeul_shift) {
            key = shift_key;
        }
        hangeul_input = strPlusJasoKey(hangeul_input, key);
    }
    $('#infinitive').val(hangeul_input);
}

function hangeul_keyboard_shift() {
    hangeul_shift = !hangeul_shift;

    for (shiftable in hangeul_shiftables) {
        $(hangeul_shiftables[shiftable][0]).html(hangeul_shiftables[shiftable][hangeul_shift ? 3 : 2])
    }
}

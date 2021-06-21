// -*- coding: utf-8; -*-
// This is Public Domain Software: nobody can have any copyright with this.
// Distribution and improvement of this software are strongly encouraged.
/*
ハングルを初声・中声・終声に分解・合成するための道具作り

関数
bool isWansungChar(char)
bool isJasoConsonantChar(char)
bool isJasoVowelChar(char)
bool isJasoChar(char)
bool isConsonantKey(key)
bool isVowelKey(key)
bool isJasoKey(key)
int  johabFirstFromKeyToCode(keys) //変換できなければ -1 を返す
int  johabSecondFromKeyToCode(keys) //変換できなければ -1 を返す
int  johabThirdFromKeyToCode(keys) //変換できなければ -1 を返す
int  jasoFromKeyToCode(keys) //変換できなければ -1 を返す
bool isJohabFirstKey(keys)
bool isJohabSecondKey(keys)
bool isJohabThirdKey(keys)
bool isJohabJasoKey(keys)
char jasoFromCodeToChar(code)
char jasoFromKeyToChar(keys)
char johabFromThreeCodeToChar(first_code, second_code, third_code)
str  wansungPlusJasoKey(wansungChar, jasoKey)
str  wansungPlusJasoKey_ai(wansungChar, jasoKey)
str  jasoPlusJasoKey(jasoChar, jasoKey)
str  strPlusJasoKey(str, jasoKey)
str  strPlusJasoKey_ai(str, jasoKey)
str  strPlusJasoKeyString(str, jasoKeyString)
str  strDeleteOneJaso(str)
str  toHangulKeyAll(str)

クラス 
コンストラクタ
ClassJohabFromChar(char)
ClassJohabFromKey(first_key, second_key, third_key)
メソッド
char toChar()
keys getFirstKey()
keys getSecondKey()
keys getThirdKey()
code getFirstCode()
code getSecondCode()
code getThirdCode()
void setFirstKey(keys)
void setSecondKey(keys)
void setThirdKey(keys)
void setFirstCode(code)
void setSecondCode(code)
void setThirdCode(code)
void deleteOneJaso()

クラス
コンストラクタ
ClassJohabFromJasoChar(jasoChar) 
メソッド
char toChar()
keys getJasoKey()
code getJasoCode()
void setJasoKey(keys)
void setJasoCode(code)
void deleteOneJaso()
*/

johabFirstTable = new Array(
  "r",//ㄱ
  "R",//ㄲ
  "s",//ㄴ
  "e",//ㄷ
  "E",//ㄸ
  "f",//ㄹ
  "a",//ㅁ
  "q",//ㅂ
  "Q",//ㅃ
  "t",//ㅅ
  "T",//ㅆ
  "d",//ㅇ
  "w",//ㅈ
  "W",//ㅉ
  "c",//ㅊ
  "z",//ㅋ
  "x",//ㅌ
  "v",//ㅍ
  "g" //ㅎ
)

johabSecondTable = new Array(
  "k",//ㅏ
  "o",//ㅐ
  "i",//ㅑ
  "O",//ㅒ
  "j",//ㅓ
  "p",//ㅔ
  "u",//ㅕ
  "P",//ㅖ
  "h",//ㅗ
  "hk",//ㅘ
  "ho",//ㅙ
  "hl",//ㅚ
  "y",//ㅛ
  "n",//ㅜ
  "nj",//ㅝ
  "np",//ㅞ
  "nl",//ㅟ
  "b",//ㅠ
  "m",//ㅡ
  "ml",//ㅢ
  "l" //ㅣ
)

johabThirdTable = new Array(
  "",//null
  "r",//ㄱ
  "R",//ㄲ
  "rt",//ㄳ
  "s",//ㄴ
  "sw",//ㄵ
  "sg",//ㄶ
  "e",//ㄷ
  "f",//ㄹ
  "fr",//ㄺ
  "fa",//ㄻ
  "fq",//ㄼ
  "ft",//ㄽ
  "fx",//ㄾ
  "fv",//ㄿ
  "fg",//ㅀ
  "a",//ㅁ
  "q",//ㅂ
  "qt",//ㅄ
  "t",//ㅅ
  "T",//ㅆ
  "d",//ㅇ
  "w",//ㅈ
  "c",//ㅊ
  "z",//ㅋ
  "x",//ㅌ
  "v",//ㅍ
  "g" //ㅎ
)

jasoTable = new Array(
  "r",//ㄱ
  "R",//ㄲ
  "rt",//ㄳ
  "s",//ㄴ
  "sw",//ㄵ
  "sg",//ㄶ
  "e",//ㄷ
  "E",//ㄸ
  "f",//ㄹ
  "fr",//ㄺ
  "fa",//ㄻ
  "fq",//ㄼ
  "ft",//ㄽ
  "fx",//ㄾ
  "fv",//ㄿ
  "fg",//ㅀ
  "a",//ㅁ
  "q",//ㅂ
  "Q",//ㅃ
  "qt",//ㅄ
  "t",//ㅅ
  "T",//ㅆ
  "d",//ㅇ
  "w",//ㅈ
  "W",//ㅉ
  "c",//ㅊ
  "z",//ㅋ
  "x",//ㅌ
  "v",//ㅍ
  "g",//ㅎ
  "k",//ㅏ
  "o",//ㅐ
  "i",//ㅑ
  "O",//ㅒ
  "j",//ㅓ
  "p",//ㅔ
  "u",//ㅕ
  "P",//ㅖ
  "h",//ㅗ
  "hk",//ㅘ
  "ho",//ㅙ
  "hl",//ㅚ
  "y",//ㅛ
  "n",//ㅜ
  "nj",//ㅝ
  "np",//ㅞ
  "nl",//ㅟ
  "b",//ㅠ
  "m",//ㅡ
  "ml",//ㅢ
  "l" //ㅣ
)

function isWansungChar(mystr) {
  my_unicode_number = mystr.charCodeAt(0);
  if(my_unicode_number >=44032 && my_unicode_number <= (44032 + 11172 - 1))
    return true;
  return false;
}

function isJasoConsonantChar(mystr) {
  my_unicode_number = mystr.charCodeAt(0);
  if(my_unicode_number >= 12593 && my_unicode_number <= (12593 + 30 -1))
    return true;
  return false;
}

function isJasoVowelChar(mystr) {
  my_unicode_number = mystr.charCodeAt(0);
  if(my_unicode_number >= 12623 && my_unicode_number <= (12623 + 21 -1))
    return true;
  return false;
}

function isJasoChar(mystr) {
  if(isJasoConsonantChar(mystr) || isJasoVowelChar(mystr)) return true;
  return false;
}

function isConsonantKey(mystr) {
  if("rRseEfaqQtTdwWczxvg".indexOf(mystr) < 0)
    return false;
  return true;
}

function isVowelKey(mystr) {
  if("koiOjpuPhynbml".indexOf(mystr) < 0)
    return false;
  return true;
}

function isJasoKey(mystr) {
  if(isConsonantKey(mystr) || isVowelKey(mystr))
    return true;
  return false;
}

function johabFirstFromKeyToCode(mystr) {
  for(i=0;i < johabFirstTable.length; i++) {
    if(mystr == johabFirstTable[i]) return i;
  }
  return -1;
}

function johabSecondFromKeyToCode(mystr) {
  for(i=0;i < johabSecondTable.length; i++) {
    if(mystr == johabSecondTable[i]) return i
  }
  return -1
}

function johabThirdFromKeyToCode(mystr) {
  for(i=0;i < johabThirdTable.length; i++) {
    if(mystr == johabThirdTable[i]) return i
  }
  return -1
}

function jasoFromKeyToCode(mystr) {
  for(i=0; i < jasoTable.length; i++) {
    if(mystr == jasoTable[i]) return i
  }
  return -1
}

function isJohabFirstKey(mystr) {
  if(johabFirstFromKeyToCode(mystr) < 0)
    return false
  return true
}

function isJohabSecondKey(mystr) {
  if(johabSecondFromKeyToCode(mystr) < 0)
    return false
  return true
}

function isJohabThirdKey(mystr) {
  if(johabThirdFromKeyToCode(mystr) < 0)
    return false
  return true
}

function isJohabJasoKey(mystr) {
  if(jasoFromKeyToCode(mystr) < 0)
    return false
  return true
}

function jasoFromCodeToChar(my_no) {
  my_no = my_no + 12593
  return String.fromCharCode(my_no)
}

function jasoFromKeyToChar(my_key){
  return jasoFromCodeToChar(jasoFromKeyToCode(my_key))
}

function johabFromThreeCodeToChar(myfirst_no, mysecond_no, mythird_no) {
  my_no = (myfirst_no * 21 + mysecond_no) * 28 + mythird_no + 44032
  return String.fromCharCode(my_no)
}

function ClassJohabFromChar(mystr) {
  if(isWansungChar(mystr)) {
    my_unicode_number = mystr.charCodeAt(0);
    dec = my_unicode_number - 44032;
    tmp = 0;
    this.third = dec % 28;
    tmp = (dec - this.third) / 28;
    this.second = tmp % 21;
    this.first = (tmp - this.second) / 21;
  }
  this.toChar = method_fromJohabObjToChar
  this.getFirstKey = method_fromJohabObjToFirstKey
  this.getSecondKey = method_fromJohabObjToSecondKey
  this.getThirdKey = method_fromJohabObjToThirdKey
  this.getFirstCode = method_fromJohabObjToFirstCode
  this.getSecondCode = method_fromJohabObjToSecondCode
  this.getThirdCode = method_fromJohabObjToThirdCode
  this.setFirstKey = method_johabSetFirstKey
  this.setSecondKey = method_johabSetSecondKey
  this.setThirdKey = method_johabSetThirdKey
  this.setFirstCode = method_johabSetFirstCode
  this.setSecondCode = method_johabSetSecondCode
  this.setThirdCode = method_johabSetThirdCode
  this.deleteOneJaso = method_johabDeleteOneJaso
}

function ClassJohabFromKey(myfirst, mysecond, mythird) {
  if(johabFirstCode(myfirst) >=0) {
    this.first = johabFirstFromKeyCode(myfirst)
  }
  if(johabSecondCode(mysecond) >=0) {
    this.second = johabSecondFromKeyToCode(mysecond)
  }
  if(johabThirdCode(mythird) >=0) {
    this.third = johabThirdFromKeyToCode(mythird)
  }
  this.toChar = method_fromJohabObjToChar
  this.getFirstKey = method_fromJohabObjToFirstKey
  this.getSecondKey = method_fromJohabObjToSecondKey
  this.getThirdKey = method_fromJohabObjToThirdKey
  this.getFirstCode = method_fromJohabObjToFirstCode
  this.getSecondCode = method_fromJohabObjToSecondCode
  this.getThirdCode = method_fromJohabObjToThirdCode
  this.setFirstKey = method_johabSetFirstKey
  this.setSecondKey = method_johabSetSecondKey
  this.setThirdKey = method_johabSetThirdKey
  this.setFirstCode = method_johabSetFirstCode
  this.setSecondCode = method_johabSetSecondCode
  this.setThirdCode = method_johabSetThirdCode
  this.deleteOneJaso = method_johabDeleteOneJaso
}

function method_fromJohabObjToChar() {
  return johabFromThreeCodeToChar(this.first, this.second, this.third)
}

function method_johabDeleteOneJaso() {
  if(this.getThirdCode() != 0) {
    this.setThirdKey(this.getThirdKey().substring(0,
                                             this.getThirdKey().length - 1));
    return this.toChar();
  } else if(this.getSecondKey().length > 1) {
    this.setSecondKey(this.getSecondKey().substring(0,1));
    return this.toChar();
  } else {
    return jasoFromKeyToChar(this.getFirstKey());
  } 
}

function ClassJohabFromJasoChar(mystr) {
  if(isJasoChar(mystr)) {
    my_unicode_number = mystr.charCodeAt(0);
    this.jaso = my_unicode_number - 12593;

    this.toChar = method_fromJohabObjToJasoChar
    this.getJasoKey = method_johabGetJasoKey
    this.getJasoCode = method_johabGetJasoCode
    this.setJasoKey = method_johabSetJasoKey
    this.setJasoCode = method_johabSetJasoCode
    this.deleteOneJaso = method_jasoDeleteOneJaso
  }
}

function method_fromJohabObjToJasoChar() {
  return jasoFromCodeToChar(this.jaso)
}

function method_fromJohabObjToFirstKey() {
  return johabFirstTable[this.first]
}

function method_fromJohabObjToSecondKey() {
  return johabSecondTable[this.second]
}

function method_fromJohabObjToThirdKey() {
  return johabThirdTable[this.third]
}

function method_johabGetJasoKey() {
  return jasoTable[this.jaso]
}

function method_fromJohabObjToFirstCode(){
  return this.first
}

function method_fromJohabObjToSecondCode(){
  return this.second
}

function method_fromJohabObjToThirdCode(){
  return this.third
}

function method_johabGetJasoCode() {
  return this.jaso
}

function method_johabSetFirstKey(mykey){
  this.first = johabFirstFromKeyToCode(mykey)
}

function method_johabSetSecondKey(mykey){
  this.second = johabSecondFromKeyToCode(mykey)
}

function method_johabSetThirdKey(mykey){
  this.third = johabThirdFromKeyToCode(mykey)
}

function method_johabSetJasoKey(mykey) {
  this.jaso = jasoFromKeyToCode(mykey)
}

function method_johabSetFirstCode(mycode){
  this.first = mycode
}

function method_johabSetSecondCode(mycode){
  this.second = mycode
}

function method_johabSetThirdCode(mycode){
  this.third = mycode
}

function method_johabSetJasoCode(mycode) {
  this.jaso = mycode
}

function method_jasoDeleteOneJaso() {
  if(this.getJasoKey().length > 1) {
    this.setJasoKey(this.getJasoKey().substring(0,1));
    return this.toChar();
  } else return "";
}

function wansungPlusJasoKey(mystr, jaso_key) {
  var last_johab = new ClassJohabFromChar(mystr);
  if(isConsonantKey(jaso_key)) {
    if(isJohabThirdKey(last_johab.getThirdKey() + jaso_key)) {
      last_johab.setThirdKey(last_johab.getThirdKey() + jaso_key)
      return last_johab.toChar()
    } else {
      return (mystr + jasoFromKeyToChar(jaso_key))
    }
  }
  if(isVowelKey(jaso_key)) {
    if(last_johab.getThirdKey().length == 2) {
      new_firstCode = johabFirstFromKeyToCode(last_johab.getThirdKey().charAt(1))
      new_secondCode = johabSecondFromKeyToCode(jaso_key)
      last_johab.setThirdKey(last_johab.getThirdKey().charAt(0))
      return (last_johab.toChar()
              + johabFromThreeCodeToChar(new_firstCode,new_secondCode, 0))
    } else if (last_johab.getThirdKey().length == 1) {
      new_firstCode = johabFirstFromKeyToCode(last_johab.getThirdKey())
      new_secondCode = johabSecondFromKeyToCode(jaso_key)
      last_johab.setThirdKey("")
      return (last_johab.toChar()
              + johabFromThreeCodeToChar(new_firstCode,new_secondCode, 0))
    } else if(isJohabSecondKey(last_johab.getSecondKey() + jaso_key)) {
      last_johab.setSecondKey(last_johab.getSecondKey() + jaso_key)
      return last_johab.toChar()
    } else {
      return (last_johab.toChar() + jasoFromKeyToChar(jaso_key))
    }
  }
}

// ㅏ + ㅣ ==> ㅐ の合成をするための関数
// ベースが2ボル式キーなので、この合成には特別な処理が必要
function wansungPlusJasoKey_ai(mystr, jaso_key) {
  var last_johab = new ClassJohabFromChar(mystr);
  var key_sequence = last_johab.getFirstKey() + last_johab.getSecondKey()
                     + last_johab.getThirdKey() + jaso_key;
  var last_2_keys = key_sequence.substring(key_sequence.length - 2,key_sequence.length);
  if(last_2_keys == "kl") { // ㅏ + ㅣ の形
    var last_second_keys = last_johab.getSecondKey();
    last_johab.setSecondKey(last_second_keys.substring(0,last_second_keys.length -1) + "o"); // ㅐ
    return last_johab.toChar();
  } else if(last_2_keys == "jl") { // ㅓ + ㅣ の形
    var last_second_keys = last_johab.getSecondKey();
    last_johab.setSecondKey(last_second_keys.substring(0,last_second_keys.length -1) + "p"); // ㅔ
    return last_johab.toChar();
  } else if(last_2_keys == "il") { // ㅑ + ㅣ の形
    var last_second_keys = last_johab.getSecondKey();
    last_johab.setSecondKey(last_second_keys.substring(0,last_second_keys.length -1) + "O"); // ㅒ
    return last_johab.toChar();
  } else if(last_2_keys == "ul") { // ㅕ + ㅣ の形
    var last_second_keys = last_johab.getSecondKey();
    last_johab.setSecondKey(last_second_keys.substring(0,last_second_keys.length -1) + "P"); // ㅖ
    return last_johab.toChar();
  } else {
    return wansungPlusJasoKey(mystr, jaso_key);
  }
}

function jasoPlusJasoKey(jasoChar, jasoKey){
  last_jaso = new ClassJohabFromJasoChar(jasoChar);
  if(isVowelKey(jasoKey) && isJasoConsonantChar(jasoChar)){
    return johabFromThreeCodeToChar(
              johabFirstFromKeyToCode(last_jaso.getJasoKey()),
              johabSecondFromKeyToCode(jasoKey), 0)
  } else return (jasoChar + jasoFromKeyToChar(jasoKey))
}

function strPlusJasoKey(mystr, jasoKey){
  if(mystr.length <= 0) return jasoFromKeyToChar(jasoKey);
  lastChar = mystr.substring(mystr.length - 1, mystr.length);
  mystr = mystr.substring(0, mystr.length - 1);
  if(isWansungChar(lastChar)) {
    return (mystr + wansungPlusJasoKey(lastChar, jasoKey));
  } else if(isJasoChar(lastChar)) {
    return (mystr + jasoPlusJasoKey(lastChar, jasoKey));
  } else return (mystr + lastChar + jasoFromKeyToChar(jasoKey));
}

// ㅏ + ㅣ ==> ㅐ の合成をするための関数
// ベースが2ボル式キーなので、この合成には特別な処理が必要
function strPlusJasoKey_ai(mystr, jasoKey){
  if(mystr.length <= 0) return jasoFromKeyToChar(jasoKey);
  lastChar = mystr.substring(mystr.length - 1, mystr.length);
  mystr = mystr.substring(0, mystr.length - 1);
  if(isWansungChar(lastChar)) {
    return (mystr + wansungPlusJasoKey_ai(lastChar, jasoKey));
  } else if(isJasoChar(lastChar)) {
    return (mystr + jasoPlusJasoKey(lastChar, jasoKey));
  } else return (mystr + lastChar + jasoFromKeyToChar(jasoKey));
}

function strPlusJasoKeyString(mystr, jasoKeyString){
  for(k = 0; k < jasoKeyString.length; k++) {
    mystr = strPlusJasoKey(mystr, jasoKeyString.charAt(k));
  }
  return mystr;
}

function strDeleteOneJaso(mystr){
  if(mystr.length <= 0) return "";
  lastChar = mystr.substring(mystr.length - 1, mystr.length);
  mystr = mystr.substring(0, mystr.length - 1);
  if(isWansungChar(lastChar)) {
    lastCharObj = new ClassJohabFromChar(lastChar);
    lastChar = lastCharObj.deleteOneJaso();
    if(isJasoChar(lastChar)) {
      lastCharObj = new ClassJohabFromJasoChar(lastChar);
      return strPlusJasoKey(mystr, lastCharObj.getJasoKey());
    } else return (mystr + lastChar);
  } else return mystr;
}

//この関数を追加
function toHangulKeyAll(mystr) {
  var j=0;
  var return_str = "";
  for (j=0; j<mystr.length; j++) {
    if(isWansungChar(mystr.charAt(j))) {
      var wansungchar = new ClassJohabFromChar(mystr.charAt(j));
      return_str += wansungchar.getFirstKey();
      return_str += wansungchar.getSecondKey();
      return_str += wansungchar.getThirdKey();
    } else if(isJasoConsonantChar(mystr.charAt(j))) {
      var jasochar = new ClassJohabFromJasoChar(mystr.charAt(j));
      return_str += jasochar.getJasoKey();
    } else {
      return_str += mystr.charAt(j);
    }
  }
  return return_str;
}

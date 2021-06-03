JavaScript Lemmatizer
====

This library is based on takafumir's library (https://github.com/takafumir/javascript-lemmatizer).

JavaScript Lemmatizer is a lemmatization library for JavaScript to retrieve a base form from an inflected form word in English. 

## Requirements

Depends on Underscore.js.

- [Underscore.js](http://underscorejs.org/)

## Install

1. Download JavaScript Lemmatizer and put into your project

2. Import  JavaScript Lemmatizer in your javascript file

```javascript
import Lemmatizer from 'js/lemmatizer.js'
```



## Usage

You can use `Lemmatizer#lemmas` or `Lemmatizer#only_lemmas` methods like the follwoing sample in your JavaScript code.

```javascript
// initialize Lemmatizer.
var lemmatizer = new Lemmatizer();

// retrieve a lemma with a part of speech.
// you can assign 'verb' or 'noun' or 'adj' or 'adv' as a part of speech.
lemmatizer.lemmas('desks',  'noun');   // => [ ['desk', 'noun'] ]
lemmatizer.lemmas('talked', 'verb');   // => [ ['talk', 'verb'] ]
lemmatizer.lemmas('coded', 'verb');    // => [ ['code', 'verb'] ]

// of course, available for irregular iflected form words.
lemmatizer.lemmas('went', 'verb');     // => [ ['go', 'verb'] ]
lemmatizer.lemmas('written', 'verb');  // => [ ['write', 'verb'] ]
lemmatizer.lemmas('better', 'adj');    // => [ ['better', 'adj'], ['good', 'adj'] ]

// when multiple base forms are found, return all of them.
lemmatizer.lemmas('leaves', 'noun');   // => [ ['leave', 'noun'], ['leaf', 'noun'] ]

// retrieve a lemma without a part of speech.
lemmatizer.lemmas('sitting');  // => [ ['sit', 'verb'], ['sitting', 'noun'], ['sitting', 'adj'] ]
lemmatizer.lemmas('oxen');     // => [ ['oxen', 'noun'], ['ox', 'noun'] ]
lemmatizer.lemmas('leaves');   // => [ ['leave', 'verb'], ['leave', 'noun'], ['leaf', 'noun'] ]

// retrieve only lemmas not including part of speeches in the returned value.
lemmatizer.only_lemmas('desks', 'noun');  // => [ 'desk' ]
lemmatizer.only_lemmas('coded', 'verb');  // => [ 'code' ]
lemmatizer.only_lemmas('priorities');     // => [ 'priority' ]
lemmatizer.only_lemmas('leaves');         // => [ 'leave', 'leaf' ]
```

## Limitations
```javascript
// Lemmatizer leaves alone a word not included in it's dictionary index.
lemmatizer.lemmas('MacBooks', 'noun');  // => [ ['MacBooks', 'noun'] ]
```

## Licence

[MIT License](https://github.com/myabu-dev/javascript-lemmatizer/blob/master/LICENSE)

## Author

[Takafumi Yamano](https://github.com/takafumir), [myabu](https://github.com/myabu-dev)


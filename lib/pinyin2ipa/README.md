# pinyin2ipa

[![dependencies Status](https://david-dm.org/Connum/npm-pinyin2ipa/status.svg)](https://david-dm.org/Connum/npm-pinyin2ipa) [![devDependencies Status](https://david-dm.org/Connum/npm-pinyin2ipa/dev-status.svg)](https://david-dm.org/Connum/npm-pinyin2ipa?type=dev) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)  [![npm total downloads](https://img.shields.io/npm/dt/pinyin2ipa.svg)](https://www.npmjs.com/package/pinyin2ipa)

Converts Mandarin Chinese Pinyin notation to IPA (International Phonetic Alphabet) notation. Supports different methods of transliteration, by default using an approach by the Beijing Language and Culture University (北京语言大学).


# Installation
`npm install pinyin2ipa`

or use the files in `/dist` or from the [releases](https://github.com/Connum/npm-pinyin2ipa/releases) for direct in-browser usage.

# Usage and examples
```js
const pinyin2ipa = require('pinyin2ipa').default
// or
import pinyin2ipa from 'pinyin2ipa'
// or (for usage in a browser environment)
<script src="dist/pinyin2ipa.min.js"></script>

// and then it's as simple as
pinyin2ipa("nĭ hăo"); // result: ni3 xau3

// in addition to diacritics, number notation can also be used,
// with spaces or without
pinyin2ipa("ni3hao3"); // result: ni3 xau3
pinyin2ipa("ni3 hao3"); // result: ni3 xau3

// to use an alternative built-in method,
// set the "method" option to "sophisticated"
pinyin2ipa("nĭ hăo", {
    method: "sophisticated"
}); // result: ni3 xɑʊ̯3

// In order to define a custom method, extend the object in pinyin2ipa.methods.
// A method is an object whose keys represent the pinyin notation without
// diacritics, optionally followed by a tone number if that tone needs to be
// treated differently. The value represents the IPA transliteration.
// See the built-in methods in src/methods/ for a better understanding.
pinyin2ipa.methods.myCustomMethod = {
    // ...
    'den': 'tən',
    'de5': 'tə',
    'de': 'tɤ',
    // ...
}
// and then use it like this:
pinyin2ipa('nĭhăoma', {
    method: 'myCustomMethod'
}) 
```

For more examples, see `examples/examples.js` or the tests in `test/index.js`.

## Options
Options can be passed via an object as the second argument of `pinyin2ipa()` (see code example above).

| Option Name  | Default | Description |
| ------------- | ------------- | ------------- |
| `method`  | `"default"`  | Either `"default"` or `"sophisticated"`, or a custom method defined via `pinyin2ipa.methods`.<br><br>`"default"` is an approach used by the Beijing Language and Culture University (北京语言大学)<br>`"sophisticated"` uses an alternative method with more diacritics and some different characters to resemble the actual pronunciation even more closely.<br><br>For defining custom methods, see the code example above. |
| `toneMarker`  | `"number"`  | The tone marker to use after each syllable (neutral tone will not be marked at all by default, see `markNeutral` option). Either `"number"`, `"chaonumber"`, or `"chaoletter"`.<br><br>`"number"` uses integers from 1 to 4<br>`"chaonumber"` uses the Chao tone numerals 55, 35, 214, and 51<br>`"chaoletter"` uses the Chao tone letters ˥, ˧˥, ˨˩˦, and ˥˩
| `markNeutral`  | `false`  | Whether to mark the neutral tone. Only has an effect if `toneMarker` is `number`.
| `superscript`  | `false`  | Boolean indicating whether to display numbers as superscript (¹²³⁴⁵) or normal numbers (12345). Only has an effect if the `toneMarker` option is either `"number"` or `"chaonumber"`. |
| `filterUnknown`  | `true`  | Boolean indicating whether to filter out any unknown syllables. If `false`, unknown syllables will be surrounded by asterisks |

# Development Commands
- `npm run clean` - Remove `lib/` directory
- `npm test` - Run tests with linting
- `npm test:only` - Run tests without linting
- `npm test:watch` - Re-run tests on file changes
- `npm test:prod` - Run tests with minified code
- `npm run test:examples` - Test examples with node
- `npm run lint` - Run ESlint with airbnb-config
- `npm run build` - Babel will transpile ES6 => ES5 and minify the code, Browserify will create a bundle in `dist/` for in-browser usage.
- `npm run prepublish` - Hook for npm. Do all the checks before publishing the module.

# License

MIT © Connum

based on [flexdinesh/npm-module-boilerplate](https://github.com/flexdinesh/npm-module-boilerplate), MIT © Dinesh Pandiyan

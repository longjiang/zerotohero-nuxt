<div align="center">
  <img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>
  <div><b>de-compromise</b></div>
  <img src="https://user-images.githubusercontent.com/399657/68222691-6597f180-ffb9-11e9-8a32-a7f38aa8bded.png"/>
  <div>bescheidene Computerlinguistik im Browser</div>
  <div><code>npm install de-compromise</code></div>
  <div align="center">
    <sub>
      work-in-progress! •  in Arbeit!
    </sub>
  </div>
  <img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>
  <div align="center">
    <sub>see: 
     <a href="https://github.com/nlp-compromise/fr-compromise">Französisch</a> • <a href="https://github.com/nlp-compromise/es-compromise">Spanisch</a>  • <a href="https://github.com/spencermountain/compromise">Englisch</a> • <a href="https://github.com/nlp-compromise/it-compromise">Italienisch</a> 
     • <a href="https://github.com/nlp-compromise/pt-compromise">Portugiesisch</a> 
    </sub>
  </div>
</div>

<div align="center">
  <div>
    <a href="https://npmjs.org/package/de-compromise">
    <img src="https://img.shields.io/npm/v/de-compromise.svg?style=flat-square" />
  </a>
  <!-- <a href="https://codecov.io/gh/spencermountain/de-compromise">
    <img src="https://codecov.io/gh/spencermountain/de-compromise/branch/master/graph/badge.svg" />
  </a> -->
  <a href="https://bundlephobia.com/result?p=de-compromise">
    <img src="https://badge-size.herokuapp.com/spencermountain/de-compromise/master/builds/de-compromise.min.js" />
  </a>
  </div>
</div>

<!-- spacer -->
<img height="85px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>


`de-compromise` (kompromiss) is a port of [compromise](https://github.com/nlp-compromise/compromise) in german.

The goal of this project is to provide a small, basic, rule-based POS-tagger.

Das Ziel dieses Projekts ist es, einen kleinen, einfachen, regelbasierten POS-Tagger bereitzustellen.


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

```js
import ldv from 'de-compromise'

let dok = ldv('Werden wir Helden für einen Tag.')
dok.match('#Noun').out('array')
// [ 'wir', 'Helden', 'Tag.' ]
```

### Parsing von Zahlen / Number parsing
es kann Zahlen in natürlicher Sprache analysieren und formatieren
```js
let doc = ldv('Ich habe einhunderteinundzwanzig Euro')
doc.numbers().minus(10)
doc.text()
// 'Ich habe einhundertelf Euro'
```


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

oder im Browser:
```html
<script src="https://unpkg.com/de-compromise"></script>
<script>
  let txt = 'Hast du etwas Zeit für mich? Dann singe ich ein Lied für dich'
  let doc = deCompromise(txt) //globalen Namensraum
  console.log(doc.sentences(1).json())
  // { text:'Dann singe...', terms:[ ... ] }
</script>
```

### Konjugation von Verbformen
erkennen und transformieren jede Verbform:
```js
txt = 
let doc = nlp('Die Kinder waren geschwommen')
console.log(doc.verbs().conjugate())
/*
[{
  presentTense: {
    first: 'schwimme',
    second: 'schwimmst',
    third: 'schwimmt',
    firstPlural: 'schwimmen',
    secondPlural: 'schwimmt',
    thirdPlural: 'schwimmen'
  },
  pastTense: {
    first: 'schwamm',
    second: 'schwammst',
    third: 'schwamm',
    firstPlural: 'schwammen',
    secondPlural: 'schwammt',
    thirdPlural: 'schwammen'
  },
  subjunctive1: {
    first: 'schwimme',
    second: 'schwimmest',
    third: 'schwimme',
    firstPlural: 'schwimmen',
    secondPlural: 'schwimmet',
    thirdPlural: 'schwimmen'
  },
  subjunctive2: {
    first: 'schwämme',
    second: 'schwämmest',
    third: 'schwämme',
    firstPlural: 'schwämmen',
    secondPlural: 'schwämmet',
    thirdPlural: 'schwämmen'
  },
  imperative: { secondSingular: 'schwimme', secondPlural: 'schwimmt' },
  pastParticiple: 'geschwommen',
  presentParticiple: 'schwimmend'
}]
*/
```

see [en-compromise/api](https://github.com/spencermountain/compromise#api) for full API documentation.

Bitte beitreten, um zu helfen! - please join to help!

<!-- spacer -->
<img height="85px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<h2 align="center">
  <a href="https://rawgit.com/nlp-compromise/de-compromise/master/demo/index.html">Demo</a>
</h2>




### Beitragen / Contributing
```
git clone https://github.com/nlp-compromise/de-compromise.git
cd de-compromise
npm install
npm test
npm watch
```


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<table>
  <tr align="center">
    <td>
      <a href="https://www.twitter.com/compromisejs">
        <img src="https://cloud.githubusercontent.com/assets/399657/21956672/a30cf206-da53-11e6-8c6c-0995cf2aef62.jpg"/>
        <div>&nbsp; &nbsp; &nbsp; Twitter &nbsp; &nbsp; &nbsp; </div>
      </a>
    </td>
    <td>
      <a href="https://github.com/nlp-compromise/compromise/wiki/Contributing">
        <img src="https://cloud.githubusercontent.com/assets/399657/21956742/5985a89c-da55-11e6-87bc-4f0f1549d202.jpg"/>
        <div>&nbsp; &nbsp; &nbsp; Pull-requests &nbsp; &nbsp; &nbsp; </div>
      </a>
    </td>
  </tr>
</table>

### See also
* [dweiss/compound-splitter](https://github.com/dweiss/compound-splitter) - german compound-word splitter
* [danielnaber/jwordsplitter](https://github.com/danielnaber/jwordsplitter) - Java compound-word splitter

MIT

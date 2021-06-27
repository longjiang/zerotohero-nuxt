# Stemmer_es
Javascript Stemmer for Spanish - Lexemador Javascript del Español

Stemmer_es is an implementation in javascript of the Porter algorithm for the Spanish language. It is based on this article: http://snowball.tartarus.org/algorithms/spanish/stemmer.html

Stemmer_es es una implementación en javascript del algoritmo de Porter para el idioma Español. Está basado en este artículo: http://snowball.tartarus.org/algorithms/spanish/stemmer.html

### Install - Instalación
```
npm install stemmer_es
```

### Example - Ejemplo

*Browser*
```html
<script src="/dist/stemmer_es.min.js"></script>
<script type="text/javascript">
  var stem = stemmer_es.stem('Asombrosamente');
  // stem = asombr
</script>
```

*Node*
```javascript
const stemmer_es = require('stemmer_es');

var stem = stemmer_es.stem('Asombrosamente');
//stem = asombr
```

### Project Website
http://stemmer-es.lopezezequiel.com/


// @/lib/inflectors/russian-inflector.js

importScripts('../js/inflectors/base-inflector.js')

class RussianInflector extends BaseInflector {

  constructor() {
    super();

    this.wordsIndex = {};
    this.adjectives = {};
    this.conjugations = {};
    this.declensions = {};
    this.verbs = {};

  }

  async loadData() {
    const wordsIndexUrl = 'https://server.chinesezerotohero.com/data/openrussian/words-index.csv.txt';
    const adjectiveUrl = 'https://server.chinesezerotohero.com/data/openrussian/adjectives.csv.txt';
    const conjugationUrl = 'https://server.chinesezerotohero.com/data/openrussian/conjugations.csv.txt';
    const declensionUrl = 'https://server.chinesezerotohero.com/data/openrussian/declensions.csv.txt';
    const verbUrl = 'https://server.chinesezerotohero.com/data/openrussian/verbs.csv.txt';

    await Promise.all([
      this.loadWordsIndex(wordsIndexUrl),
      this.loadTable(adjectiveUrl, 'adjectives'),
      this.loadTable(conjugationUrl, 'conjugations'),
      this.loadTable(declensionUrl, 'declensions'),
      this.loadTable(verbUrl, 'verbs'),
    ]);
  }

  loadWordsIndex(wordsIndexUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get(wordsIndexUrl);
        const data = Papa.parse(response.data, {
          delimiter: '\t',
          header: true
        });
  
        data.data.forEach(row => {
          this.wordsIndex[row.id] = row.bare;
        });
        resolve();
      } catch (err) {
        console.error('Error loading words index:', err);
        reject(err);
      }
    });
  }
  
  loadTable(url, propertyName) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get(url);
        const data = Papa.parse(response.data, {
          delimiter: '\t',
          header: true
        });
  
        data.data.forEach(row => {
          this[propertyName][row.word_id] = row;
        });
        resolve();
      } catch (err) {
        console.error(`Error loading ${propertyName}:`, err);
        reject(err);
      }
    });
  }  

  async inflect(word) {
    await this.loadData;
    const wordId = Object.keys(this.wordsIndex).find(id => this.wordsIndex[id] === word);

    if (!wordId) {
      return null;
    }

    const forms = [];
    const tables = ['adjectives', 'conjugations', 'declensions', 'verbs'];

    for (const tableName of tables) {
      const table = this[tableName];
      const formData = table[wordId];

      if (formData) {
        Object.entries(formData).forEach(([field, form]) => {
          if (field !== 'word_id' && field !== 'id' && form) {
            // If the field is an id, look up the word in the words index
            if (field.includes('id')) {
              form = this.wordsIndex[form];
              field = field.replace('_id', '');
            }
            form = form.replace(/([,;].*)/g, ""); // Remove everything after commas and semicolons
            // TO-DO: When there are multiple forms, add them all
            forms.push({
              table: this.tableAndFieldNames(tableName),
              field: this.tableAndFieldNames(field),
              form: addAccentMarks(form), // (Russian) Add accent marks
            });
          }
        });
      }
    }

    return forms;
  }


  tableAndFieldNames(name) {
    const stylize = {
      adjectives: 'adjective',
      incomparable: 'incomparable',
      short_f: 'short (fem.)',
      short_m: 'short (masc.)',
      short_n: 'short (neut.)',
      short_pl: 'short plural',
      superlative: 'superlative',
      conjugations: 'conjugations',
      pl1: 'мы',
      pl2: 'вы',
      pl3: 'они',
      sg1: 'я',
      sg2: 'ты',
      sg3: 'он/она',
      declensions: 'declensions',
      decl_sg: 'singular',
      decl_pl: 'plural',
      decl_f: 'feminine',
      decl_m: 'masculine',
      decl_n: 'neuter',
      acc: 'accusative',
      dat: 'dative',
      gen: 'genitive',
      inst: 'instrumental',
      nom: 'nominative',
      prep: 'prepositional',
      verbs: 'verb',
      aspect: 'aspect',
      imperative_pl: 'imperative plural',
      imperative_sg: 'imperative singular',
      partner: 'partner',
      past_f: 'past tense (feminine)',
      past_m: 'past tense (masculine)',
      past_n: 'past tense (neuter)',
      past_pl: 'past tense (plural)'
    }
    return stylize[name] || name;
  }


  async getAccentForm(text, head = undefined) {
    let search = text.toLowerCase();
    head = head || text
    let forms = await this.inflect(head)
    if (!forms) return text;
    forms = forms.map(f => f.form)
    const accentLessForms = forms.map(f => f.replace(/́/g, ""))
    let matchedIndex = accentLessForms.findIndex((f) => search === f);
    if (matchedIndex) {
      let matchedForm = forms[matchedIndex];
      if (matchedForm) {
        let accentIndex = matchedForm.indexOf('́');
        if (accentIndex >= 0) {
          let accentText =
            text.substring(0, accentIndex) +
            '́' +
            text.substring(accentIndex);
          return accentText;
        }
      }
    }
  }
}

// @/lib/inflectors/russian-inflector.js

import BaseInflector from './base-inflector';
import Papa from 'papaparse';

class RussianInflector extends BaseInflector {

  constructor() {
    super();

    this.wordsIndex = {};
    this.adjectiveForms = {};

    const wordsIndexUrl = 'https://server.chinesezerotohero.com/data/openrussian/words-index.csv.txt';
    const adjectiveUrl = 'https://server.chinesezerotohero.com/data/openrussian/adjectives.csv.txt';

    this.loadData = (async () => {
      await Promise.all([
        this.loadWordsIndex(wordsIndexUrl),
        this.loadAdjectives(adjectiveUrl),
      ]);
    })();
  }

  loadWordsIndex(wordsIndexUrl) {
    return new Promise((resolve, reject) => {
      Papa.parse(wordsIndexUrl, {
        download: true,
        delimiter: '\t',
        header: true,
        complete: (results) => {
          results.data.forEach(row => {
            this.wordsIndex[row.id] = row.bare;
          });
          resolve();
        },
        error: (err) => {
          console.error('Error loading words index:', err);
          reject(err);
        }
      });
    });
  }

  loadAdjectives(adjectiveUrl) {
    return new Promise((resolve, reject) => {
      Papa.parse(adjectiveUrl, {
        download: true,
        delimiter: '\t',
        header: true,
        complete: (results) => {
          results.data.forEach(row => {
            this.adjectiveForms[row.word_id] = row;
          });
          resolve();
        },
        error: (err) => {
          console.error('Error loading adjectives:', err);
          reject(err);
        }
      });
    });
  }

  async inflect(word) {
    await this.loadData;
    const wordId = Object.keys(this.wordsIndex).find(id => this.wordsIndex[id] === word);

    if (!wordId) {
      return null;
    }

    const forms = [];
    const adjForm = this.adjectiveForms[wordId];

    if (adjForm) {
      Object.entries(adjForm).forEach(([field, form]) => {
        if (field !== 'word_id' && form) {
          // If the field is an id, look up the word in the words index
          if (field.includes('id')) {
            form = this.wordsIndex[form];
            field = field.replace('_id', '');
          }
          forms.push({
            table: 'adjective',
            field,
            form
          });
        }
      });
    }

    return forms;
  }
}

export default RussianInflector;

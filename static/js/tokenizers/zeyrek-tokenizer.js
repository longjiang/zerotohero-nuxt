importScripts('../js/tokenizers/base-tokenizer.js')

class ZeyrekTokenizer extends BaseTokenizer {
  
  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text); // L2 is taken care of in the base class
    if (!tokenized) { 
      let url = `${PYTHON_SERVER}lemmatize-turkish?text=${encodeURIComponent(
        text
      )}`;
      tokenized = await proxy(url, { timeout: 5000 });
    }
    // Check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      return this.tokenizeLocally(text);
    }
    let tokens = [];
    for (let lemmas of tokenized) {
      if (!lemmas[0]) {
        tokens.push(" ");
      } else if (["Punc"].includes(lemmas[0].pos)) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else {
        let token = {
          text: lemmas[0].word,
          lemmas: lemmas.filter(l => l.lemma !== "Unk"),
          pos: lemmas[0].pos,
        }
        tokens.push(this.normalizeToken(token));
        tokens.push(" ");
      }
    }
    return tokens;
  }
  
}

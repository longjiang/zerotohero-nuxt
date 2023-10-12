importScripts('../js/tokenizers/base-tokenizer.js')

// arabic-tokenizer.js
class QalsadiTokenizer extends BaseTokenizer {

  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      let url = `${PYTHON_SERVER}lemmatize-arabic?text=${encodeURIComponent(
        text
      )}`;
      tokenized = await proxy(url, { timeout: 5000 });
    }
    // Check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      return this.tokenizeLocally(text);
    }
    if (!tokenized) return this.tokenizeIntegral(text);
    let tokens = [];
    for (let lemmas of tokenized) {
      if (!lemmas[0]) {
        tokens.push(" ");
      } else if (["punc"].includes(lemmas[0].pos)) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else if (
        ["all"].includes(lemmas[0].pos) &&
        isNumeric(lemmas[0].word)
      ) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else {
        let token = {
          text: lemmas[0].word,
          lemmas,
          pos: lemmas[0].pos,
          pronunciation: lemmas[0].pronunciation,
        }
        tokens.push(this.normalizeToken(token));
        tokens.push(" ");
      }
    }
    return tokens;
  }
}
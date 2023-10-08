importScripts('../js/tokenizers/base-tokenizer.js')

class ZeyrekTokenizer extends BaseTokenizer {
  
  async tokenize(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-turkish?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await proxy(url, { timeout: 5000 });
    // Check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      // Try again without caching
      tokenized = await proxy(url, {cacheLife: 0, timeout: 5000});
      if (!tokenized || typeof tokenized === 'string') {
        return this.tokenizeIntegral(text);
      }
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

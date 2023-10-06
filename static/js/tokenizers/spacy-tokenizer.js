importScripts('../js/tokenizers/base-tokenizer.js')

class SpacyTokenizer extends BaseTokenizer {
  
  async tokenize(text) {
    let tokens = [];
    text = text.replace(/-/g, "- ");
    let langCode = this.l2["iso639-3"] || this.l2["glottologId"];
    if (langCode === "nor") langCode = "nob"; // Use Bokmål for Norwegian
    let url = `${PYTHON_SERVER}lemmatize-spacy?lang=${langCode}&text=${encodeURIComponent(text)}`;
    let tokenized = await proxy(url, { timeout: 5000 });
    // Check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      // Try again without caching
      tokenized = await proxy(url, {cacheLife: 0, timeout: 5000});
      if (!tokenized || typeof tokenized === 'string') {
        return this.tokenizeLocally(text);
      }
    }
    for (let token of tokenized) {
      if (!token) {
        // do nothing
      } else if (["PUNCT"].includes(token.pos)) {
        tokens.push(token.word);
      } else {
        tokens.push(this.normalizeToken(token));
      }
    }
    return this.recoverSpaces(tokens, text);
  }
}
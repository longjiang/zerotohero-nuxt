importScripts('../js/tokenizers/base-tokenizer.js')

class BurmeseTokenizer extends BaseTokenizer {
  async tokenize(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-burmese?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await proxy(url);
    // check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      // try again without caching
      tokenized = await proxy(url, 0);
      if (!tokenized || typeof tokenized === 'string') {
        return
      }
    }
    let tokens = [];
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else {
        tokens.push(this.normalizeToken(token));
      }
    }
    console.log({ tokenized, tokens });
    return tokens;
  }
}
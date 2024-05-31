importScripts('../js/tokenizers/base-tokenizer.js')

class PyidaungsuTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      let url = `${PYTHON_SERVER}lemmatize-burmese?text=${encodeURIComponent(
        text
      )}`;
      try {
        const response = await axios.get(url, { timeout: 5000 });
        tokenized = response.data;
      } catch (error) {
        console.error('There was a problem with the axios operation: ', error);
      }
    }

    // check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      return this.tokenizeLocally(text);
    }

    let tokens = [];
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else {
        tokens.push(this.normalizeToken(token));
      }
    }
    return tokens;
  }
}
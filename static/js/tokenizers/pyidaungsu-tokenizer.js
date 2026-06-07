// pyidaungsu-tokenizer.js
if (typeof self.BaseTokenizer === 'undefined') importScripts('../js/tokenizers/base-tokenizer.js')

class PyidaungsuTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      let url = `${PYTHON_SERVER}lemmatize-burmese`;
      try {
        const response = await axios.post(
          url,
          { text: text },  // POSTリクエストのペイロードとしてtextを送信
          { timeout: 5000 }
        );
        tokenized = response.data;
      } catch (error) {
        console.error('PyidaungsuTokenizer: There was a problem with the axios operation: ', error);
      }
    }

    // check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      return this.tokenizeLocally(text);
    }

    return this.normalizeTokens(tokenized);
  }

  normalizeTokens(tokenized) {
    // Falls back onto the base tokenizer's standard array parsing logic loops cleanly
    return super.normalizeTokens(tokenized);
  }
}
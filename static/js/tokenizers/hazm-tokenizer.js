// hazm-tokenizer.js
importScripts("../js/tokenizers/base-tokenizer.js");

class HazmTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let tokens = this.loadFromServerCache(text);
    if (!tokens) {
      let url = `${PYTHON_SERVER}lemmatize-persian`;
      try {
        const response = await axios.post(url, 
          { text: text },  // POSTリクエストのペイロードとしてtextを送信
          { timeout: 5000 }
        );
        tokens = response.data;
      } catch (error) {
        console.error('There was a problem with the axios operation: ', error);
      }
    }
    
    // Check if the tokenized is an array and not a string
    if (!tokens || typeof tokens === 'string') {
      return this.tokenizeLocally(text);
    }

    return this.normalizeTokens(tokens);
  }

  normalizeTokens(tokenized) {
    let tokens = tokenized.map(token => this.normalizeToken(token));
    return tokens.flatMap(token => [token, " "]);
  }
}

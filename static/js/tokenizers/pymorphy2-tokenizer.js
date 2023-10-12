importScripts('../js/tokenizers/base-tokenizer.js')

class Pymorphy2Tokenizer extends BaseTokenizer {
  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      let url = `${PYTHON_SERVER}lemmatize-russian?text=${encodeURIComponent(text)}`;
      tokenized = await proxy(url);
    }
    
    // Make sure that tokenized is an array of objects
    if (!tokenized || typeof tokenized === 'string') {
      return super.tokenize(text);
    }

    let tokens = [];

    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else {
        this.normalizeToken(token);
        if (token.pos === 'PUNCT') {
          tokens.push(token.text);
        } else {
          tokens.push(token);
        }
      }
    }
    
    return this.recoverSpaces(tokens, text);
  }
}
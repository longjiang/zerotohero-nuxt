importScripts('../js/tokenizers/base-tokenizer.js')

class RussianTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let url = `${PYTHON_SERVER}lemmatize-russian?text=${encodeURIComponent(text)}`;
    let tokenized = await proxy(url);
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
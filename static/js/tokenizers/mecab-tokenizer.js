importScripts('../js/tokenizers/base-tokenizer.js')

class MeCabTokenizer extends BaseTokenizer {

  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      let url = `${PYTHON_SERVER}lemmatize-japanese?text=${encodeURIComponent(
        text
      )}`;
      tokenized = await proxy(url);
    }

    let tokens = [];
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else if (["補助記号-"].includes(token.pos)) {
        tokens.push(token.text);
      } else {
        tokens.push(this.normalizeToken(token));
        if (!isJapanese(token.text)) {
          tokens.push(" ");
        }
      }
    }
    return tokens;

  }
}
importScripts('../js/tokenizers/base-tokenizer.js')

class MeCabTokenizer extends BaseTokenizer {

  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      let url = `${PYTHON_SERVER}lemmatize-japanese?text=${encodeURIComponent(
        text
      )}`;
      try {
        const response = await axios.get(url, { timeout: 5000 });
        tokenized = response.data;
      } catch (error) {
        console.error('There was a problem with the axios operation: ', error);
      }
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
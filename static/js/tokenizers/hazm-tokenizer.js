importScripts('../js/tokenizers/base-tokenizer.js')

class HazmTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let tokens = this.loadFromServerCache(text);
    if (!tokens) {
      let url = `${PYTHON_SERVER}lemmatize-persian?text=${encodeURIComponent(
        text
      )}`;
      tokens = await proxy(url);
    }
    tokens = tokens.map((token) => {
      return this.normalizeToken(token);
    });
    //  after every token, dd a string item consisting of a space character
    tokens = tokens.flatMap((token) => [token, " "]);
    return tokens
  }
}
importScripts("../js/tokenizers/base-tokenizer.js");

class HazmTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let tokens = this.loadFromServerCache(text);
    if (!tokens) {
      let url = `${PYTHON_SERVER}lemmatize-persian?text=${encodeURIComponent(
        text
      )}`;
      try {
        const response = await axios.get(url, { timeout: 5000 });
        tokens = response.data;
      } catch (error) {
        console.error('There was a problem with the axios operation: ', error);
      }
    }
    tokens = tokens.map((token) => {
      return this.normalizeToken(token);
    });
    //  after every token, dd a string item consisting of a space character
    tokens = tokens.flatMap((token) => [token, " "]);
    return tokens;
  }
}

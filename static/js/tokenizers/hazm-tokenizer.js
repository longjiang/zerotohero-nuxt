importScripts('../js/tokenizers/base-tokenizer.js')

class HazmTokenizer extends BaseTokenizer {
  async tokenize(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-persian?text=${encodeURIComponent(
      text
    )}`;
    let tokens = await proxy(url);
    tokens = tokens.map((token) => {
      return this.normalizeToken(token);
    });
    //  after every token, dd a string item consisting of a space character
    tokens = tokens.flatMap((token) => [token, " "]);
    return tokens
  }
}
importScripts('../js/tokenizers/base-tokenizer.js')

class JapaneseTokenizer extends BaseTokenizer {

  async tokenize(text) {

    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-japanese?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await proxy(url);
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
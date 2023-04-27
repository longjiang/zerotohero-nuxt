importScripts('../js/tokenizers/base-tokenizer.js')

class PersianTokenizer extends BaseTokenizer {
  async tokenize(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-persian?text=${encodeURIComponent(
      text
    )}`;
    let tokens = await proxy(url);
    tokens = tokens.map((token) => {
      const lemmaWithStem = token.lemma;
      const parts = lemmaWithStem.split("#");
      const lemma = parts[0];
      const stem = parts.length > 1 ? parts[1] : null;
      token.lemma = lemma;
      token.stem = stem;
      return this.normalizeToken(token);
    });
    return tokens
  }
}
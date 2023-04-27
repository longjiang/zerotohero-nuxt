importScripts('../js/tokenizers/base-tokenizer.js')

// arabic-tokenizer.js
class ArabicTokenizer extends BaseTokenizer {

  async tokenize(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-arabic?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await proxy(url);
    let tokens = [];
    for (let lemmas of tokenized) {
      if (!lemmas[0]) {
        tokens.push(" ");
      } else if (["punc"].includes(lemmas[0].pos)) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else if (
        ["all"].includes(lemmas[0].pos) &&
        isNumeric(lemmas[0].word)
      ) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else {
        let token = {
          text: lemmas[0].word,
          lemmas: lemmas.map((l) => l.lemma),
          pos: lemmas[0].pos,
        }
        tokens.push(this.normalizeToken(token));
        tokens.push(" ");
      }
    }
    return tokens;
  }
}
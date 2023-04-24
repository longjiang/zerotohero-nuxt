import { PYTHON_SERVER } from "@/lib/utils/servers"
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";

// arabic-tokenizer.js
class ArabicTokenizer extends BaseTokenizer {
  
  async tokenize(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-arabic?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await DictionaryUtils.proxy(url);
    let tokens = [];
    for (let lemmas of tokenized) {
      if (!lemmas[0]) {
        tokens.push(" ");
      } else if (["punc"].includes(lemmas[0].pos)) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else if (
        ["all"].includes(lemmas[0].pos) &&
        DictionaryUtils.isNumeric(lemmas[0].word)
      ) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else {
        tokens.push({
          text: lemmas[0].word,
          lemmas: lemmas.map((l) => l.lemma),
          pos: lemmas[0].pos,
        });
        tokens.push(" ");
      }
    }
    return tokens;
  }
}

export default ArabicTokenizer; // Export the ArabicTokenizer class
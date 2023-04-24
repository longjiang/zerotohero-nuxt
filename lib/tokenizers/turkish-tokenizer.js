import { PYTHON_SERVER } from "@/lib/utils/servers"
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";

// turkish-tokenizer.js
class TurkishTokenizer extends BaseTokenizer {
  
  async tokenize(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-turkish?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await DictionaryUtils.proxy(url);
    let tokens = [];
    for (let lemmas of tokenized) {
      if (!lemmas[0]) {
        tokens.push(" ");
      } else if (["Punc"].includes(lemmas[0].pos)) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else {
        tokens.push({
          text: lemmas[0].word,
          lemmas: lemmas.filter(l => l.lemma !== "Unk").map((l) => l.lemma),
          pos: lemmas[0].pos,
        });
        tokens.push(" ");
      }
    }
    return tokens;
  }
  
}

export default TurkishTokenizer; // Export the TurkishTokenizer class

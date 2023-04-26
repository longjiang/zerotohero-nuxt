import { PYTHON_SERVER } from "@/lib/utils/servers";
import { proxy } from "@/lib/utils/proxy";
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";

class RussianTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let url = `${PYTHON_SERVER}lemmatize-russian?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await proxy(url);
    let tokens = [];
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else if (["PUNCT"].includes(token.pos)) {
        tokens.push(token.word);
      } else {
        tokens.push(this.normalizeToken(token));
      }
    }
    return tokens;
  }
}

export default RussianTokenizer; // Export the RussianTokenizer class

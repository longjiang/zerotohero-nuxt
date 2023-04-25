import { PYTHON_SERVER } from "@/lib/utils/servers"
import { proxy } from "@/lib/utils/proxy"
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";

// japanese-tokenizer.js
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
        tokens.push(token.word);
      } else {
        tokens.push(this.normalizeToken(token));
      }
    }
    return tokens;

  }
}

export default JapaneseTokenizer; // Export the JapaneseTokenizer class
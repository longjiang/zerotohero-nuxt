import { PYTHON_SERVER } from "@/lib/utils/servers"
import { proxy } from "@/lib/utils/proxy"
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";

class SimpleLemmaTokenizer extends BaseTokenizer {
  
  async tokenize(text) {
    let tokens = [];
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-simple?lang=${this.l2['iso639-3']
      }&text=${encodeURIComponent(text)}`;
    let tokenized = await proxy(url);
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else if (["PUNCT"].includes(token.pos)) {
        tokens.push(token.word);
      } else {
        tokens.push(token);
      }
    }
    return tokens;
  }
}

export default SimpleLemmaTokenizer; // Export the SimpleLemmaTokenizer class

import { PYTHON_SERVER } from "@/lib/utils/servers";
import { proxy } from "@/lib/utils/proxy";
import { isChinese } from "@/lib/utils/string";
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";

class ChineseTokenizer extends BaseTokenizer {
  async tokenize(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-chinese?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await proxy(url);
    // check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      // try again without caching
      tokenized = await proxy(url, 0);
      if (!tokenized || typeof tokenized === 'string') {
        return
      }
    }
    let tokens = [];
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else if (token.pos === 'x' && !isChinese(token.word)) {
        tokens.push(token.word);
      } else {
        tokens.push(this.normalizeToken(token));
      }
    }
    return tokens;
  }
}

export default ChineseTokenizer; // Export the ChineseTokenizer class
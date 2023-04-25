import { SERVER, PYTHON_SERVER } from "@/lib/utils/servers";
import { proxy } from "@/lib/utils/proxy";
import { isHangul } from "@/lib/utils/string";
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";

class KoreanTokenizer extends BaseTokenizer {
  async tokenizeWithOpenKoreanText(text) {
    let url = `http://py.zerotohero.ca:4567/tokenize?text=${encodeURIComponent(text)}`;
    let tokenized = await proxy(url, { timeout: 5000 });
    // check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      // try again without caching
      tokenized = await proxy(url, 0);
      if (!tokenized || typeof tokenized === 'string') {
        return this.tokenizeIntegral(text);
      }
    }
    let tokens = [];
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else if (token.pos === 'x' && !isHangul(token.text)) {
        tokens.push(token.text);
      } else {
        tokens.push(this.normalizeToken(token));
      }
    }
    return tokens;
  }
}

export default KoreanTokenizer; // Export the KoreanTokenizer class
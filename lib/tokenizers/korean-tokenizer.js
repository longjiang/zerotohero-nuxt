import { proxy } from "@/lib/utils/proxy";
import { isHangul } from "@/lib/utils/string";
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";


class KoreanTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let url = `http://py.zerotohero.ca:4567/tokenize?text=${encodeURIComponent(text)}`;
    let res = await proxy(url, { timeout: 5000 });
    let tokenized = res?.tokens;
    // Check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      // Try again without caching
      tokenized = await proxy(url, 0);
      if (!tokenized || typeof tokenized === 'string') {
        return this.tokenizeContinua(text);
      }
    }

    let tokens = [];
    let currentPosition = 0;
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else {
        // Check if there's a gap between the current position and the token's offset.
        if (token.offset > currentPosition) {
          tokens.push(" ");
        }

        if (token.pos === 'Punctuation' && !isHangul(token.text)) {
          tokens.push(token.text);
        } else {
          token.lemmas = [token.stem || token.text];
          tokens.push(this.normalizeToken(token));
        }

        // Update currentPosition to the position right after the current token.
        currentPosition = token.offset + token.text.length;
      }
    }

    // Check if there's any unprocessed text at the end.
    if (currentPosition < text.length) tokens.push(" ");

    return tokens;
  }
}

export default KoreanTokenizer; // Export the KoreanTokenizer class
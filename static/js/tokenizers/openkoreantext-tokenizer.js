// openkoreantext-tokenizer.js
if (typeof self.BaseTokenizer === 'undefined') importScripts('../js/tokenizers/base-tokenizer.js')

class OpenKoreanTextTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      // let url = `http://py.zerotohero.ca:4567/tokenize?text=${encodeURIComponent(text)}`; // Old server, no longer working
      let url = `${PYTHON_SERVER}lemmatize-korean`;
      try {
        const response = await axios.post(url, 
          { text: text },  // POSTリクエストのペイロードとしてtextを送信
          { timeout: 5000 }
        );
        tokenized = response.data;
      } catch (error) {
        console.error('OpenKoreanTextTokenizer: There was a problem with the axios operation: ', error);
      }
    }
    
    // Check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      return this.tokenizeContinua(text);
    }

    return this.normalizeTokens(tokenized, text);
  }

  normalizeTokens(tokenized, originalText = "") {
    let tokens = [];
    let currentPosition = 0;

    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else {
        const position = originalText.indexOf(token.text, currentPosition);
        if (position > currentPosition) tokens.push(" ");

        if (token.pos === 'Punctuation' && !isHangul(token.text)) {
          tokens.push(token.text);
        } else {
          token.lemmas = [];
          if (token.stem) token.lemmas = [{ lemma: token.stem, pos: token.pos }];
          tokens.push(this.normalizeToken(token));
        }
        currentPosition = position + token.text.length;
      }
    }
    return tokens;
  }
}
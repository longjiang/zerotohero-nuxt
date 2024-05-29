importScripts('../js/tokenizers/base-tokenizer.js')

class OpenKoreanTextTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      // let url = `http://py.zerotohero.ca:4567/tokenize?text=${encodeURIComponent(text)}`; // Old server, no longer working
      let url = `${PYTHON_SERVER}lemmatize-korean?text=${encodeURIComponent(text)}`;
      try {
        const response = await axios.get(url, { timeout: 5000 });
        tokenized = response.data;
      } catch (error) {
        console.error('There was a problem with the axios operation: ', error);
      }
    }
    
    // Check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      return this.tokenizeContinua(text);
    }

    let tokens = [];
    let currentPosition = 0;
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else {
        // Find token.text's position in text.
        const position = text.indexOf(token.text, currentPosition);

        // Check if there's a gap between the current position and the token's offset.
        if (position > currentPosition) {
          tokens.push(" ");
        }

        if (token.pos === 'Punctuation' && !isHangul(token.text)) {
          tokens.push(token.text);
        } else {
          token.lemmas = [];
          if (token.stem) token.lemmas = [ { lemma: token.stem, pos: token.pos } ];
          tokens.push(this.normalizeToken(token));
        }

        // Update currentPosition to the position right after the current token.
        currentPosition = position + token.text.length;
      }
    }

    // Check if there's any unprocessed text at the end.
    if (currentPosition < text.length) tokens.push(" ");

    return tokens;
  }
}
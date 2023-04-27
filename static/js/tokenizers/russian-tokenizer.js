importScripts('../js/tokenizers/base-tokenizer.js')

class RussianTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let url = `${PYTHON_SERVER}lemmatize-russian?text=${encodeURIComponent(text)}`;
    let tokenized = await proxy(url);
    let tokens = [];

    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else {
        this.normalizeToken(token);
        if (token.pos === 'PUNCT') {
          tokens.push(token.text);
        } else {
          tokens.push(token);
        }
      }
    }
    
    return this.recoverSpaces(tokens, text);
  }

  recoverSpaces(tokens, text) {
    let recoveredTokens = [];
    let currentIndex = 0;

    for (let token of tokens) {
      let tokenText = typeof token === "string" ? token : token.text;

      // Find the position of the current token in the original text
      const tokenIndex = text.indexOf(tokenText, currentIndex);

      // If there's a gap between the current token and the previous one, add a space
      if (tokenIndex > currentIndex) {
        recoveredTokens.push(" ");
      }

      // Add the current token to the recoveredTokens array
      recoveredTokens.push(token);

      // Update the currentIndex to the end of the current token
      currentIndex = tokenIndex + tokenText.length;
    }

    return recoveredTokens;
  }
}
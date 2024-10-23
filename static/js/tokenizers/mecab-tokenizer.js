importScripts('../js/tokenizers/base-tokenizer.js')

class MeCabTokenizer extends BaseTokenizer {

  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      let url = `${PYTHON_SERVER}lemmatize-japanese`;

      try {
        const response = await axios.post(
          url,
          { text: text },  // リクエストボディにデータを含める
          { timeout: 5000 }
        );
        tokenized = response.data;
      } catch (error) {
        console.error('There was a problem with the axios operation: ', error);
      }
    }
    // Check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      return this.tokenizeLocally(text);
    }

    let tokens = [];
    for (let token of tokenized) {
      if (!token) {
        // tokens.push(" ");
      } else if (["補助記号-"].includes(token.pos)) {
        tokens.push(token.text);
      } else {
        tokens.push(this.normalizeToken(token));
        // if (!isJapanese(token.text)) {
        //   tokens.push(" ");
        // }
      }
    }

    // Call addBackSpaces to handle missing spaces and newlines
    tokens = this.addBackSpaces(text, tokens);

    return tokens

  }

  // Add back missing spaces and newlines from the original text
  addBackSpaces(originalText, tokens) {
    let result = [];
    let tokenIndex = 0;
    let currentPosition = 0;

    while (currentPosition < originalText.length) {
      let currentChar = originalText[currentPosition];

      if (tokenIndex < tokens.length) {
        let currentToken = tokens[tokenIndex];
        let tokenText = typeof currentToken === "string" ? currentToken : currentToken.text;

        if (currentChar === tokenText[0]) {
          // If the current character matches the token, move to the next token
          result.push(currentToken);
          currentPosition += tokenText.length;
          tokenIndex++;
        } else if (currentChar === ' ') {
          // If it's a space in the original text, but no space in the tokenized result, add it
          result.push(' ');
          currentPosition++;
        } else if (currentChar === '\n') {
          // If it's a newline character, add it as well
          result.push('\n');
          currentPosition++;
        } else {
          // In case of a mismatch, increment the position in the original text
          currentPosition++;
        }
      } else {
        // If there are no more tokens, handle any remaining spaces or newlines
        if (currentChar === ' ') {
          result.push(' ');
        } else if (currentChar === '\n') {
          result.push('\n');
        }
        currentPosition++;
      }
    }

    return result;
  }
}

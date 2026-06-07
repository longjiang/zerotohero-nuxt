// zeyrek-tokenizer.js
if (typeof self.BaseTokenizer === 'undefined') importScripts('../js/tokenizers/base-tokenizer.js')

class ZeyrekTokenizer extends BaseTokenizer {
  
  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text); // L2 is taken care of in the base class
    if (!tokenized) { 
      let url = `${PYTHON_SERVER}lemmatize-turkish`;
      try {
        const response = await axios.post(url, 
          { text: text },  // POSTリクエストのペイロードとしてtextを送信
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
    
    return this.normalizeTokens(tokenized, text);
  }

  normalizeTokens(tokenized, originalText = "") {
    let tokens = [];

    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else {
        // Run standard structural mutations on the object (.word -> .text, fallback arrays)
        this.normalizeToken(token);

        // Filter out punctuation structural overhead if necessary, matching Pymorphy2 style
        if (token.pos === 'PUNCT' || token.pos === 'Punc') {
          tokens.push(token.text);
        } else {
          tokens.push(token);
        }
      }
    }
    
    // Leverage the inherited base class spacing algorithm to preserve exact original layout strings
    return this.recoverSpaces(tokens, originalText);
  }
  
}

importScripts('../js/tokenizers/base-tokenizer.js')

class JiebaTokenizer extends BaseTokenizer {
  async tokenize(text) {
    let tokenized = this.loadFromServerCache(text);
    if (!tokenized) {
      let url = `${PYTHON_SERVER}lemmatize-chinese`;
      try {
        const response = await axios.post(url, 
          { text: text },  // POSTリクエストのペイロードとしてtextを送信
          { timeout: 5000 }
        );
        tokenized = response.data;
      } catch (error) {
        console.error('Jieba Tokenizer: There was a problem tokenizing from the server. ', error);
      }
    }

    // check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      tokenized = await this.tokenizeLocally(text);
      return this.tokenizeLocally(text);
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
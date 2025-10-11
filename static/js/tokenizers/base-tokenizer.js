importScripts("../vendor/crypto-js/crypto-js.js");

class BaseTokenizer {
  constructor({ l2, words = [], indexKeys = ["search"], tokenizationType = "integral" }) {
    this.l2 = l2;
    this.tokenizationCache = {};
    this.serverCache = {};
    this.words = words;
    this.indexKeys = indexKeys;
    this.tokenizationType = tokenizationType;
    console.log("Base Tokenizer initialized with tokenization type:", this.tokenizationType);
  }

  static async load({ l2, words = [], indexKeys = ["search"], tokenizationType = "integral" }) {
    const instance = new this({ l2, words, indexKeys, tokenizationType });
    await instance.loadData();
    return instance;
  }

  async loadData() {
    // Optional. Used only for local tokenizers that need to load data.
  }

  async tokenizeWithCache(text) {
    // Create a md5 hash of the text
    const hash = CryptoJS.MD5(text).toString();
    if (this.tokenizationCache[hash]) {
      return this.tokenizationCache[hash];
    }

    const tokenized = await this.tokenize(text);
    this.tokenizationCache[hash] = tokenized;

    return tokenized;
  }

  loadServerCache(data) {
    for (let key in data) {
      // Initialize the serverCache object if it doesn't exist
      if (!this.serverCache[this.l2.code]) {
        this.serverCache[this.l2.code] = {};
      }
      this.serverCache[this.l2.code][key] = data[key];
      // console.log("Loading server cache for", this.l2.code, key);
    }
  }

  loadFromServerCache(text) {
    const key = CryptoJS.MD5(text).toString();
    const tokens = this.serverCache[this.l2.code]?.[key];
    // console.log("Loading from server cache for", this.l2.code, key, tokens, {text});
    return tokens
  }

  async tokenize(text) {
    return await this.tokenizeLocally(text);
  }

  async tokenizeLocally(text) {
    const tokenizationType = this.tokenizationType
    let tokenized = [];

    switch (tokenizationType) {
      // tokenizationType passed in from <TokenizedRichText>
      case "integral":
        console.log("Tokenizing locally with integral method");
        tokenized = this.tokenizeIntegral(text);
        break;
      case "agglutenative":
        console.log("Tokenizing locally with agglutenative method");
        tokenized = await this.tokenizeIntegral(text); // Using continua for agglutenative does not make sense because it may break the words into too many segments
        break;
      case "continua":
        console.log("Tokenizing locally with continua method");
        tokenized = await this.tokenizeContinua(text);
        break;
      default:
    }
    return tokenized;
  }


// Tokenizer for apostrophe‑sensitive languages (Klingon, Welsh, etc.)
tokenizeIntegral(text) {
    const apostropheSensitive = this.l2 && this.l2.apostrophe;

    // 語パターン: 語末の ' / ’ を許可
    const wordPattern = apostropheSensitive
        ? /[\p{L}\p{M}\d]+(?:['’][\p{L}\p{M}\d]+)*['’]?/u
        : /[\p{L}\p{M}\d]+/u;

    // 語・記号・空白を単一の RegExp で抽出
    const tokenPattern = new RegExp(
        `${wordPattern.source}|[^\p{L}\p{M}\d\\s]+|\\s+`,
        'gu'
    );

    // トークン化
    const rawTokens = text.match(tokenPattern) || [];

    // 語か否かでラベリング
    return rawTokens.map(t => wordPattern.test(t) ? { text: t } : t);
}




// Utility function to escape special characters in regex patterns
escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

  longest(text, filteredWords) {
    let longest = {
      text: "",
      matches: [],
    };
    for (let word of filteredWords) {
      let regex = word.head;
      for (let key of ['simplified', 'traditional', 'head', 'search', 'kana']) {
        if (word[key]) {
          regex += "|" + word[key];
        }
      }
      let match = text.match(new RegExp(regex, "i"));
      if (match) {
        if (match[0].length > longest.text.length) {
          longest.text = match[0];
          longest.matches = [word];
        }
        // Else if the length is the same and any of 'simplified', 'traditional', 'head', 'search', 'kana' of the word matches the longest.text, add it to longest.matches
        else if (match[0].length === longest.text.length) {
          for (let key of ['simplified', 'traditional', 'head', 'search', 'kana']) {
            if (word[key] && word[key].toLowerCase() === longest.text.toLowerCase()) {
              longest.matches.push(word);
              break;
            }
          }
        }
      }
    }
    return longest;
  }

  wordsContainedInText(text) {
    const textLowerCase = text.toLowerCase();
    return this.words.filter((row) => {
      for (let key of this.indexKeys) {
        if (textLowerCase.includes(row[key])) return true; // row.search, for example
      }
    });
  }

  async tokenizeContinua(text, filteredWords) {
    if (!filteredWords) {
      filteredWords = this.wordsContainedInText(text);
    }
    const longest = this.longest(text, filteredWords);
    if (this.l2 === "tha") {
      const isThai = isThai(text);
      if (!isThai) {
        return [text];
      }
    }
    if (longest.matches.length > 0) {
      let result = [];
      /*
      result = [
        '我',
        {
          text: '是'
          candidates: [{...}, {...}, {...}
        ],
        '中国人。'
      ]
      */
      for (let textFragment of text.split(longest.text)) {
        result.push(textFragment); // '我'
        result.push({
          text: longest.text,
          candidates: longest.matches,
        });
      }
      result = result.filter((item) => {
        if (typeof item === "string") {
          return item !== "";
        } else {
          return item.text !== "";
        }
      });
      result.pop(); // last item is always useless, remove it
      var tokens = [];
      for (let item of result) {
        if (typeof item === "string" && item !== text) {
          let recursiveResult = await this.tokenizeContinua(
            item,
            filteredWords
          );
          for (let token of recursiveResult) {
            tokens.push(token);
          }
        } else {
          tokens.push(item);
        }
      }
      return tokens;
    } else {
      return [text];
    }
  }

  // Any shared utility methods or properties can be added here
  normalizeToken(token) {
    if (token.word) {
      // change the 'word' key to 'text'
      token.text = token.word;
      delete token.word;
    }
    if (!token.lemmas) {
      if (token.lemma) {
        token.lemmas = [
          {
            lemma: token.lemma,
            pos: token.pos,
          },
        ];
        delete token.lemma;
        delete token.pos;
      } else {
        token.lemmas = [];
      }
    } else {
      for (let lemma of token.lemmas) {
        if (typeof lemma === "string") {
          lemma = {
            lemma,
            pos: token.pos,
          };
        }
      }
    }
    return token;
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

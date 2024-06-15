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

// Modified by ChatGPT to improve compatibility with older safari by removing regex look behind 
tokenizeIntegral(text) {
    let modifiedText = text;
    let apostrophePatterns = [];
    let tempText = text.split(/\s+/); // Split text into words by whitespace.

    // If language is "apostrophe-sensitive" like Klingon and Welsh
    if (this.l2 && this.l2.apostrophe) {
        // Manually find and replace patterns where the apostrophe is part of a word
        tempText.forEach((word, index) => {
            const match = word.match(/^[’']?[\p{L}\p{M}]+[’']?$/u);
            if (match) {
                apostrophePatterns.push(word);
                const placeholder = `APOSTROPHEWORD${index}`;
                // Replace the word in the modified text with a placeholder
                modifiedText = modifiedText.replace(new RegExp("\\b" + this.escapeRegExp(word) + "\\b", "gu"), placeholder);
            }
        });
    }

    // Continue with the usual tokenization using Unicode property escapes
    let tokens = modifiedText.match(/[\p{L}\p{M}\d]+|[^\p{L}\p{M}\d\s]+|\s+/gu);

    // If language is "apostrophe-sensitive", restore the original words with apostrophes
    if (this.l2 && this.l2.apostrophe && apostrophePatterns.length > 0) {
        tokens = tokens.map((token) => {
            const match = token.match(/APOSTROPHEWORD(\d+)/);
            return match ? apostrophePatterns[parseInt(match[1], 10)] : token;
        });
    }

    // Label the tokens
    const labeledTokens = tokens.map((tokenString) => {
        let isWord = /[\p{L}\p{M}]+/u.test(tokenString);
        if (isWord) {
            return { text: tokenString };
        } else {
            return tokenString;
        }
    });

    return labeledTokens;
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
        } else if (match[0].length === longest.text.length) {
          longest.matches.push(word);
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

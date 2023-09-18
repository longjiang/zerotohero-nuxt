class BaseTokenizer {
  constructor({ l2, words = [], indexKeys = ["search"] }) {
    this.l2 = l2;
    this.tokenizationCache = {};
    this.words = words;
    this.indexKeys = indexKeys;
  }

  static async load({ l2, words = [], indexKeys = ["search"] }) {
    const instance = new this({ l2, words, indexKeys });
    await instance.loadData();
    return instance;
  }

  async loadData() {
    // Optional. Used only for local tokenizers that need to load data.
  }

  async tokenizeWithCache(text) {
    if (this.tokenizationCache[text]) {
      return this.tokenizationCache[text];
    }

    const tokenized = await this.tokenize(text);
    this.tokenizationCache[text] = tokenized;

    return tokenized;
  }

  async tokenize(text) {
    const tokenizationType = this.tokenizationType(this.l2);
    let tokenized = [];

    switch (tokenizationType) {
      // tokenizationType passed in from <Annotate>
      case "integral":
        tokenized = this.tokenizeIntegral(text);
        break;
      case "agglutenative":
        tokenized = await this.tokenizeContinua(text);
        break;
      case "continua":
        tokenized = await this.tokenizeContinua(text);
        break;
      default:
    }
    return tokenized;
  }

  tokenizationType(l2) {
    let tokenizationType = "integral"; // default
    if (l2.continua) {
      tokenizationType = "continua";
    } else if (
      (l2.scripts && l2.scripts[0] && l2.scripts[0].script === "Arab") ||
      ["hu", "et"].includes(l2.code)
    ) {
      tokenizationType = "integral";
    } else if (["de", "gsw", "no", "hy", "vi"].includes(l2.code)) {
      tokenizationType = "agglutenative";
    } else if (l2.agglutinative && l2.wiktionary && l2.wiktionary > 2000) {
      tokenizationType = "agglutenative";
    }
    return tokenizationType;
  }

  tokenizeIntegral(text) {
    let modifiedText = text;
    let apostrophePatterns = null;

    // If language is "apostrophe-sensitive" like Klingon and Welsh
    if (this.l2 && this.l2.apostrophe) {
      // Identify and replace patterns where the apostrophe is part of a word
      apostrophePatterns = text.match(
        /[\p{L}\p{M}][’']|[’'][\p{L}\p{M}]/gu
      );
      if (apostrophePatterns) {
        apostrophePatterns.forEach((pattern, index) => {
          modifiedText = modifiedText.replace(
            pattern,
            `APOSTROPHEWORD${index}`
          );
        });
      }
    }

    // Continue with the usual tokenization
    let tokens = modifiedText.match(/[\p{L}\p{M}\d]+|[^\p{L}\p{M}\d\s]+|\s+/gu);

    // If language is "apostrophe-sensitive", restore the original words with apostrophes
    if (this.l2 && this.l2.apostrophe && apostrophePatterns) {
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

  longest(text, filteredWords) {
    let longest = {
      text: "",
      matches: [],
    };
    for (let word of filteredWords) {
      let match = text.match(new RegExp(word.head, "i"));
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

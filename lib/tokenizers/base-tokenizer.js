// base-tokenizer.js

class BaseTokenizer {
  constructor(l1, l2) {
    this.l1 = l1;
    this.l2 = l2;
    this.tokenizationCache = {};
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

  tokenize(text) {
    const tokenizationType = this.tokenizationType(this.l2);
    if (this.tokenizationCache[text]) return this.tokenizationCache[text];
    else {
      let tokenized = [];
      switch (tokenizationType) {
        // tokenizationType passed in from <Annotate>
        case "integral":
          tokenized = this.tokenizeIntegral(text);
          break;
        case "agglutenative":
        case "continua":
          tokenized = this.tokenizeContinua(text);
          break;
        default:
      }
      this.tokenizationCache[text] = tokenized;
      return tokenized;
    }
  }

  tokenizeIntegral(text) {
    const tokens = text.match(/[\p{L}\p{M}]+|[^\p{L}\p{M}\s]+|\s+/gu);
    const labeledTokens = tokens.map((tokenString) => {
      let isWord = /^[\p{L}\p{M}]+$/u.test(tokenString);
      if (isWord) {
        return { text: tokenString };
      } else {
        return tokenString;
      }
    });
    return labeledTokens;
  }
  
  tokenizeContinua(text) {
    let subdict = this.subdictFromText(text);
    let tokenized = this.tokenizeRecursively(text, subdict);
    return tokenized;
  }

  // Any shared utility methods or properties can be added here
}

export default BaseTokenizer;
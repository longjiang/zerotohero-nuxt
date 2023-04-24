// base-tokenizer.js
import { isThai } from "@/lib/utils/string" 

class BaseTokenizer {
  constructor(l1, l2) {
    this.l1 = l1;
    this.l2 = l2;
    this.tokenizationCache = {};
  }

  async tokenize(text) {
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
          tokenized = await this.tokenizeContinua(text);
          break;
        default:
      }
      this.tokenizationCache[text] = tokenized;
      return tokenized;
    }
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


  async tokenizeContinua(text, subdict) {
    if (!subdict) subdict = await this.dictionary.subdictFromText(text);
    const longest = await subdict.longest(text);
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
          for (let token of this.tokenizeContinua(item, subdict)) {
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
}

export default BaseTokenizer;
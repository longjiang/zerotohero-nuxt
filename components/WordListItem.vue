<template>
  <li :class="{ 'wordlist-item': true, matched: isMatched }">
    <span class="col1" v-if="word">
      <Star
        v-if="star === true"
        :word="word"
        :removeSymbol="removeSymbol"
        :label="false"
        style="height: 1rem; margin-right: 0.25rem"
      ></Star>
      <Speak
        v-if="showSpeak"
        :text="word.kana || word.head"
        :l2="$l2"
        class="text-secondary"
        style="height: 1rem; margin-right: 0.25rem"
      />
      <router-link
        v-if="compareWith"
        :to="compareUrl"
        :class="`btn btn-sm btn-no-bg mr-0 text-secondary`"
        style="line-height: 1rem; margin-right: 0.25rem"
      >
        <i class="fas fa-adjust"></i>
      </router-link>
    </span>
    <span v-if="word" class="col2">
      <router-link
        :to="wordUrl"
        :title="titleText"
        :class="{ 'wordlist-item-word': true, transparent: hideWord }"
        :data-level="dataLevel"
        :lang="$l2.code"
      >
        <span v-if="$l2.code === 'de' && word.gender">{{ genderArticle }}</span>
        {{ word.accented || word.head }}
      </router-link>
      <span :class="{ transparent: hidePhonetics }">
        <!-- Check if there's a pronunciation and handle different language specifics -->
        <span class="wordlist-item-pinyin">
          <WordPronunciation :word="word" />
        </span>
        <!-- Display canonical CJK representation if applicable -->
        <span
          v-if="
            ['ko', 'vi'].includes($l2.code) && word.cjk && word.cjk.canonical
          "
          class="wordlist-item-byeonggi"
        >
          {{ word.cjk.canonical }}
        </span>
        <span
          v-if="word.definitions"
          :class="{ 'wordlist-item-l1': true, transparent: hideDefinitions }"
        >
          <span class="word-type" v-if="word.pos">
            <!-- Display gender for languages like German, where gendered articles are used -->
            {{
              word.gender
                ? { m: "masculine", f: "feminine", n: "neuter" }[word.gender]
                : ""
            }}
            {{ word.pos }}
            <!-- Part of speech -->
            <!-- Display additional grammatical info from the word's heads array if available -->
            {{
              word.heads && word.heads[0] && word.heads[0][1]
                ? word.heads[0][1]
                : ""
            }}:
          </span>
          <!-- Component for listing definitions. Assumes DefinitionsList is a separate component -->
          <DefinitionsList
            class="d-inline"
            :definitions="filterDefinitions(word)"
            :translated="true"
            :singleColumn="true"
            :neverShowAsList="true"
            :showAsNumberedList="false"
          />
          <span
            v-if="word.saved?.context?.text"
            v-html="': ' + highlightMultiple(word.saved.context.text, word.saved.forms, word.level)"
            class="small"
          />
        </span>
      </span>
    </span>
  </li>
</template>

<script>
import { highlightMultiple } from "../lib/utils";
export default {
  props: {
    word: Object, // Word object containing details like pronunciation, definitions, etc.
    index: Number, // Index of the word in the list, used for unique keys
    star: Boolean, // Flag to display star component
    compareWith: Object, // Object to compare with another word
    showSpeak: Boolean, // Flag to show speak button
    hideWord: Boolean, // Flag to hide the word
    hidePhonetics: Boolean, // Flag to hide phonetics information
    hideDefinitions: Boolean, // Flag to hide definitions
    removeSymbol: Boolean, // Flag to optionally remove symbols (like star)
  },
  computed: {
    isMatched() {
      // Compute if the current word is matched with a criteria
      return (
        this.matchedWords &&
        this.matchedWords.map((word) => word.id).includes(this.word.id)
      );
    },
    compareUrl() {
      // Build the URL for comparing two words if comparison is enabled
      if (this.compareWith) {
        return `/${this.$l1.code}/${this.$l2.code}/compare/${this.$dictionaryName}/${this.compareWith.id},${this.word.id}`;
      }
      return "#";
    },
    wordUrl() {
      // Generate URL for navigating to the word's detailed view
      if (this.url) {
        return this.url(this.word, this.index);
      }
      return `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$dictionaryName}/${this.word.id}`;
    },
    titleText() {
      // Generate the title text to be shown on hover (e.g., for tooltips)
      return this.word.saved?.context?.text ? this.word.saved?.context.text : "";
    },
    dataLevel() {
      // Determine the data-level attribute based on word's details like level or HSK
      if (this.$l2.code === "zh" && this.word) {
        if (this.word.level === 'outside') {
          if (this.word.newHSK) {
            return "7-9"; // If the word is not in HSK 1-6 but is in any new HSK level, color it as 7-9
          } else {
            return "outside";
          }
        }
      }
      return this.word.level;
    },
    genderArticle() {
      // Return the article based on gender for German words
      if (this.$l2.code === "de" && this.word.gender) {
        return { n: "das", m: "der", f: "die" }[this.word.gender];
      }
      return "";
    },
  },
  methods: {
    highlightMultiple,
    filterDefinitions() {
      // Filter definitions to remove certain unwanted entries or format them
      if (!this.word.definitions) return [];
      let definitions = this.word.definitions;
      // Example: Filter out classifier entries for Chinese words
      if (this.$l2.code === "zh") {
        definitions = definitions.filter((def) => !def.startsWith("CL:"));
      }
      // Limit the number of definitions if there's a maxDefinitions prop
      if (this.maxDefinitions) {
        definitions = definitions.slice(0, this.maxDefinitions);
      }
      return definitions;
    },
    transliterateWord() {
      // Perform transliteration if applicable, e.g., Japanese Romaji
      if (this.$l2.code === "ja" && this.word.kana) {
        return this.$dictionary.transliterate(this.word.kana);
      }
      return this.word.kana || "";
    },
    emitWordSelected() {
      // Emit an event when a word is selected, passing the word object to the parent
      this.$emit("word-selected", this.word);
    },
    handleComparison() {
      // Handle logic for word comparison, possibly navigating or showing a modal
      if (!this.compareWith) return;
      this.$router.push(this.compareUrl);
    },
    highlightWord() {
      // Method to highlight the word, possibly toggling a class
      this.isHighlighted = !this.isHighlighted; // assuming `isHighlighted` is a data property
    },
    playAudio() {
      // Play the pronunciation audio if available
      if (this.word.pronunciation) {
        const audio = new Audio(this.word.pronunciationUrl); // assuming pronunciationUrl is a property of word
        audio.play();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";


.col1 {
    display: grid;
    grid-template-columns: auto auto auto; /* each sub-column only as wide as necessary */
    /* vertically aligned to top */
    align-items: start;
}

.col2 {
    
}

.wordlist-item-word {
  font-weight: bold;
}

.wordlist-item {
  a:hover {
    text-decoration: none;
  }

  &.matched {
    opacity: 0.2; // Dim matched items to indicate selection or focus
  }

  .word-type {
    opacity: 0.7; // Less emphasis on the grammatical type
  }

  .wordlist-item-pinyin,
  .wordlist-item-pinyin * {
    font-family: AndikaW, Andika, Arial, sans-serif;
  }
}

// You might need to adapt these styles depending on how you handle themes or skins in your component
.skin-light {
  .wordlist-item {
    .wordlist-item-pinyin,
    .wordlist-item-pinyin * {
      color: #779bb5;
    }

    .wordlist-item-word[data-level="outside"],
    .wordlist-item-l1 {
      color: #666 !important;
    }

    .wordlist-item-byeonggi {
      color: rgb(143, 158, 172);
    }
  }
}

.skin-dark {
  .wordlist-item {
    .wordlist-item-pinyin,
    .wordlist-item-pinyin * {
      color: rgba(255, 255, 255, 0.589);
    }

    .wordlist-item-word[data-level="outside"],
    .wordlist-item-l1 {
      color: rgba(255, 255, 255, 0.781) !important;
    }
  }
}

.word-type {
  opacity: 0.7;
}
</style>

<template>
  <div>
    <ul :class="classes" data-collapse-target>
      <li
        :class="{
          'wordlist-item': true,
          matched:
            matchedWords &&
            matchedWords.map((word) => word.id).includes(word.id),
        }"
        v-for="(word, index) in words || wordFromIds || []"
        :key="`word-list-word-${index}-${word.id}`"
      >
        <Star
          v-if="word && star === true"
          :word="word"
          :removeSymbol="removeSymbol"
          :label="false"
          class="pr-2"
        ></Star>
        <Speak
          :text="word.kana || word.head"
          :l2="$l2"
          class="text-secondary"
        />
        <router-link
          v-if="compareWith"
          :to="`/${$l1.code}/${$l2.code}/compare/${$dictionaryName}/${compareWith.id},${word.id}`"
          class="btn btn-small"
          style="margin-bottom: 0.4rem"
        >
          <i class="fas fa-adjust"></i>
        </router-link>
        <router-link
          v-if="word"
          :to="getUrl(word, index)"
          :title="word.definitions ? filterDefinitions(word).join(',') : ''"
        >
          <span
            :class="{ 'wordlist-item-word ml-1': true, transparent: hideWord }"
            :data-level="skin !== 'dark' ? getLevel(word) : undefined"
          >
            <span v-if="$l2.code === 'de' && word.gender">
              {{ { n: "das", m: "der", f: "die" }[word.gender] }}
            </span>
            {{ word.head }}
          </span>

          <span :class="{ transparent: hidePhonetics }">
            <span v-if="word.pronunciation" class="wordlist-item-pinyin">
              <span v-if="$l2.code !== 'zh'">[</span>
              <span v-else>(</span>
              <span
                v-if="$l2.code === 'vi'"
                v-html="
                  word.pronunciation.replace(
                    /\[\[(.+?)#Vietnamese\|.+?]]/g,
                    '$1'
                  )
                "
              />
              <span v-else>{{ word.pronunciation }}</span>
              <span v-if="$l2.code !== 'zh'">]</span>
              <span v-else>)</span>
            </span>
            <span v-if="word.kana" class="wordlist-item-pinyin">
              ( {{ word.kana }}, {{ transliterate(word.kana) }} )
            </span>
            <span
              v-if="
                ['ko', 'vi'].includes($l2.code) &&
                word.cjk &&
                word.cjk.canonical
              "
              class="wordlist-item-byeonggi"
            >
              {{ word.cjk.canonical }}
            </span>
          </span>
          <span
            v-if="word.definitions"
            :class="{ 'wordlist-item-l1': true, transparent: hideDefinitions }"
          >
            <span class="word-type" v-if="word.pos" style="color: #999">
              {{
                word.gender
                  ? { m: "masculine", f: "feminine", n: "neuter" }[word.gender]
                  : ""
              }}
              {{ word.pos }}
              {{
                word.heads && word.heads[0] && word.heads[0][1]
                  ? word.heads[0][1]
                  : ""
              }}:
            </span>
            {{ word.definitions ? filterDefinitions(word).join(", ") : "" }}
          </span>
          <span
            :class="{ 'wordlist-item-l1': true, transparent: hideDefinitions }"
            v-if="word.counters"
          >
            :
            <span style="font-style: normal">
              {{
                word.counters
                  .map((counter) => "一" + counter.simplified)
                  .join(word.simplified + "、") + word.simplified
              }}。
            </span>
          </span>
        </router-link>
      </li>
      <li
        class="wordlist-item"
        v-for="(text, index) in texts"
        :key="`word-list-item-${index}`"
      >
        <Star v-if="text && star === true" :text="text" class="mr-1"></Star>
        <span class="wordlist-item-word ml-1" data-level="outside">
          {{ text }}
        </span>
      </li>
    </ul>
    <ShowMoreButton
      v-if="collapse > 0"
      :length="words.length"
      :min="collapse"
    />
  </div>
</template>
<script>
import { transliterate as tr } from "transliteration";
import Helper from "@/lib/helper";

export default {
  props: {
    words: {
      type: Array,
    },
    ids: {
      type: Array,
    },
    texts: {
      type: Array,
    },
    matchedWords: {
      default: undefined,
    },
    compareWith: {
      default: false,
    },
    traditional: {
      default: false,
    },
    highlight: {
      default: false,
    },
    collapse: {
      default: 0,
    },
    star: {
      default: true,
    },
    level: {
      default: false,
    },
    url: {
      type: Function,
    },
    skin: {
      default: "light",
    },
    hideWord: {
      default: false,
    },
    hideDefinitions: {
      default: false,
    },
    hidePhonetics: {
      default: false,
    },
    maxDefinitions: undefined,
    removeSymbol: {
      default: false,
    },
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
    classes() {
      let classes = {
        wordlist: true,
        "wordlist-dark": this.skin === "dark",
        "list-unstyled": true,
        collapsed: this.collapse > 0,
      };
      classes[`collapse-${this.collapse}`] = true;
      return classes;
    },
  },
  asyncComputed: {
    async wordFromIds() {
      if (this.ids) {
        let dictionary = await this.$getDictionary();
        let words = await Promise.all(
          this.ids.map(async (id) => await dictionary.get(id))
        );
        return words;
      }
    },
  },
  methods: {
    filterDefinitions(word) {
      if (!word.definitions) return;
      let definitions = word.definitions;
      if (this.$l2.code === "zh")
        definitions = definitions.filter((def) => !def.startsWith("CL"));
      definitions = Helper.unique(definitions);
      if (this.maxDefinitions)
        definitions = definitions.slice(0, this.maxDefinitions);
      return definitions;
    },
    unique(list) {
      return Helper.unique(list);
    },
    transliterate(text) {
      let transliteration = tr(text);
      if (transliteration !== text) return tr(text);
    },
    getUrl(word, index) {
      if (this.url) return this.url(word, index);
      else
        return `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$dictionaryName}/${word.id}`;
    },
    getLevel(word) {
      if (this.$l2.code === "zh" && word) {
        if (word.newHSK && word.newHSK === "7-9") {
          return "7-9";
        } else if (word.hsk !== "outside") {
          return word.hsk;
        } else if (word.hsk === "outside" && word.weight < 750) {
          return "outside";
        } else {
          return false;
        }
      } else {
        return word.level || "outside";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.wordlist {
  margin-bottom: inherit;

  .wordlist-item {
    a {
      color: #28a745;
    }

    a:hover {
      text-decoration: none;
    }

    .wordlist-item-word {
      font-weight: bold;
      font-size: 1.4em;
    }

    .wordlist-item-l1 {
      color: #666;
    }

    .wordlist-item-byeonggi {
      color: rgb(143, 158, 172);
    }

    &.matched {
      opacity: 0.2;
    }
    .wordlist-item-pinyin,
    .wordlist-item-pinyin * {
      color: #779bb5;
      font-family: AndikaW, Andika, Arial, sans-serif;
    }
  }
  &.wordlist-dark {
    .wordlist-item-pinyin {
      color: rgba(255, 255, 255, 0.589);
    }
    .wordlist-item-l1 {
      color: rgba(255, 255, 255, 0.781);
    }
  }
}
</style>

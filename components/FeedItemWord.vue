<template>
  <div :class="`feed-item feed-item-word feed-item-${skin}`">
    <div class="word-info pt-4 pl-4 pr-4 pb-3" v-if="word" >
      <div class="head-and-pronunciation">
        <h3 class="word-head">{{ word.head }}</h3>
        <span>
          <span v-if="word.pronunciation" class="wordlist-item-pinyin">
            <span v-if="$l2.code !== 'zh'">[</span>
            <span v-else>(</span>
            <span
              v-if="$l2.code === 'vi'"
              v-html="
                word.pronunciation.replace(/\[\[(.+?)#Vietnamese\|.+?]]/g, '$1')
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
              ['ko', 'vi'].includes($l2.code) && word.cjk && word.cjk.canonical
            "
            class="wordlist-item-byeonggi"
          >
            {{ word.cjk.canonical }}
          </span>
        </span>
      </div>
      <div class="definitions-wrapper" v-if="word.definitions">
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
        <span class="definitions">
          {{ word.definitions ? filterDefinitions(word).join(", ") : "" }}
        </span>
      </div>
    </div>
    <div class="hit-thumb" v-if="hit">
      <div class="youtube-thumbnail-wrapper aspect-wrapper play-button-wrapper">
        <button class="btn btn-unstyled play-button">
          <i class="fa fa-play"></i>
        </button>
        <img
          class="youtube-thumbnail aspect"
          ref="thumbnail"
          :src="`https://img.youtube.com/vi/${this.hit.video.youtube_id}/hqdefault.jpg`"
        />
      </div>
    </div>
    <div class="hit-quote pb-4 pl-4 pr-4 pt-3 d-flex"  v-if="hit">
      <div class="text-success mr-2">
        <i class="fas fa-quote-left"></i>
      </div>
      <div
        v-html="highlightMultiple(hit.line, savedWord.forms, 'outside')"
      ></div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import YouTube from "@/lib/youtube";
import { transliterate } from "transliteration";

export default {
  props: {
    savedWord: {
      type: Object,
    },
    maxDefinitions: {
      type: Number, 
      default: 2
    },
    skin: {
      default: "light", // or 'dark'
    },
  },
  data() {
    return {
      hit: undefined,
    };
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
  },
  asyncComputed: {
    async word() {
      let dictionary = await this.$getDictionary();
      return await dictionary.get(this.savedWord.id);
    },
  },
  async mounted() {
    this.hit = await this.getVideo();
  },
  methods: {
    transliterate(...args) {
      return transliterate(...args)
    },
    highlightMultiple(...args) {
      return Helper.highlightMultiple(...args);
    },
    async getVideo() {
      try {
        let hits = await YouTube.searchSubs({
          terms: [this.savedWord.forms[0]],
          langId: this.$l2.id,
          continua: this.$l2.continua,
          limit: 1,
          tvShowFilter: "all",
          talkFilter: "all",
          apostrophe: this.$l2.apostrophe,
        });
        if (hits && hits[0]) {
          return hits[0];
        }
      } catch (err) {
        Helper.logError(err);
      }
    },
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
  },
};
</script>

<style lang="scss" scoped>
.feed-item-word {
  .word-head {
    color: #28a745;
    font-weight: bold;
    display: inline;
  }
}
</style>
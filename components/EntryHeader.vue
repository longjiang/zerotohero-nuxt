<template>
  <!-- ANCHOR img/anchors/entry.png  -->
  <div class="entry-head-wrapper" v-if="entry">
    <div>
      <div>
        <span
          v-if="entry.level && entry.level !== 'outside'"
          class="entry-level p-1 rounded ml-2 mr-2"
          style="position: relative; bottom: 0.2em; font-size: 0.8em"
          :data-bg-level="entry.level"
        >
          {{
            levels && levels[entry.level]
              ? levels[entry.level].name
              : entry.level
          }}
        </span>
        <span
          v-if="entry.newHSK"
          class="entry-level p-1 rounded font-weight-bold"
          :style="`position: relative; bottom: 0.3em; font-size: 0.8em; color: ${
            entry.newHSK === '7-9' ? '#00716B' : 'inherit'
          }`"
        >
          <i class="fa fa-arrow-right mr-2" />
          {{ $t("New HSK {num}", { num: entry.newHSK }) }}
          <span
            v-if="entry.newHSKMatches.length === 1"
            style="color: #999; font-weight: normal"
          >
            #{{ entry.newHSKMatches[0].num }}
          </span>
        </span>
      </div>
      <div
        v-if="entry.counters"
        :class="{ 'mt-1 mb-2': true, transparent: hidePhonetics && !reveal }"
      >
        <TokenizedText
          :text="
            '一' +
            entry.counters.map((counter) => counter.simplified).join('、一')
          "
        />
      </div>
      <div class="entry-word-wrapper" style="display: inline-block">
        <div class="my-2">
          <div class="entry-pinyin">
            <span
              :class="{
                'ml-2 mr-1': true,
                transparent: hidePhonetics && !reveal,
              }"
            >
              <WordPronunciation
                :word="entry"
              />
            </span>
            <Speak
              :class="{ 'ml-1 mr-2': true, transparent: hidePhonetics }"
              ref="speak"
              :text="this.$l2.code === 'ja' ? entry.kana : entry.head"
              :mp3="entry.audio"
              :wiktionary="entry.wiktionary"
            />
          </div>
        </div>
        <span :class="{ transparent: hideWord && !reveal }">
          <component
            :is="disabled ? 'span' : 'router-link'"
            :to="`/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${entry.id}`"
          >
            <template
              v-if="['hsk-cedict', 'dialect-dict'].includes($dictionaryName)"
            >
              <span
                class="entry-word simplified"
                :data-level="
                  entry.newHSK && entry.newHSK === '7-9'
                    ? '7-9'
                    : entry.level || 'outside'
                "
                v-html="entry.simplified"
                lang="zh-Hans"
              ></span>
              <span
                class="entry-word traditional"
                :data-level="entry.level || 'outside'"
                lang="zh-Hant"
                v-html="entry.traditional"
              ></span>
            </template>
            <template v-else>
              <span
                :class="{ 'entry-word': true }"
                :data-level="entry.level || 'outside'"
              >
                <span
                  v-if="$l2.code === 'de' && entry.gender"
                  style="font-size: 0.7em"
                >
                  {{ { n: "das", m: "der", f: "die" }[entry.gender] }}
                </span>
                <span
                  v-html="transform(entry.accented || entry.head)"
                  :class="{ klingon: $l2.code === 'tlh' }"
                ></span>
              </span>
            </template>
          </component>
        </span>
        <span
          v-if="
            ['ko', 'vi'].includes($l2.code) && entry.cjk && entry.cjk.canonical
          "
          class="mt-1"
        >
          <span :class="{ 'ml-2 entry-cjk': true, transparent: hidePhonetics }">
            {{ entry.cjk.canonical }}
          </span>
        </span>
        <span
          v-if="
            ['hsk-cedict', 'dialect-dict'].includes($dictionaryName) &&
            entry.simplified !== entry.traditional
          "
          class="mt-1"
        >
          <span class="ml-2 entry-cjk simplified">{{ entry.traditional }}</span>
          <span class="ml-2 entry-cjk traditional">{{ entry.simplified }}</span>
        </span>

        <span
          v-if="entry.supplementalLang"
          class="pl-1 pr-1 mt-3 rounded d-inline-block bg-warning text-white"
        >
          {{ $languages.getSmart(entry.supplementalLang).name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Klingon from "../lib/klingon";
import { languageLevels } from "../lib/utils";

export default {
  props: {
    entry: {
      type: Object,
    },
    minimal: {
      type: String,
      default: "",
    },
    hidePhonetics: {
      default: false,
    },
    hideWord: {
      default: false,
    },
    reveal: {
      default: false,
    },
    disabled: {
      default: false, // Disabling the router-link to the dictionary entry
    },
  },
  data() {
    return {
      levels: null,
    };
  },
  async mounted() {
    if (
      this.$refs.speak &&
      this.$l2Settings.autoPronounce &&
      this.hidePhonetics // Means that this is the front side of the card
    ) {
      this.$refs.speak.speak({ rate: 0.75, volume: 0.5 }); // Speed and volume
    }
    if (this.$l2) this.levels = languageLevels(this.$l2);
  },
  methods: {
    transform(text) {
      if (typeof text === "undefined") {
        text = "";
      }
      if (this.$l2.code === "tlh" && text.trim() !== "") {
        text = Klingon.latinToConScript(text);
      }
      return text;
    },
  },
};
</script>

<style lang="scss" scoped>
.entry-pinyin,
.entry-pinyin * {
  font-size: 1.1rem;
  color: #779bb5;
  font-family: AndikaW, Andika, Arial, sans-serif;
}

.entry-word {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
  margin: 0.5rem 0;
}

.entry-hanja {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .entry-word {
    font-size: 3rem;
  }
}

.entry-word img {
  width: 4.8rem;
  border: 1px solid #ccc;
}

.entry-word-wrapper a {
  color: inherit;
  text-decoration: inherit;
}

.entry-head-wrapper {
  position: relative;
}

.entry-cjk {
  font-size: 1.5rem;
}

:deep(.hide-phonetics) .word-block-pinyin {
  opacity: 0;
}
</style>

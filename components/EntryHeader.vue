<template>
  <!-- ANCHOR img/anchors/entry.png  -->
  <div class="entry-head-wrapper" v-if="entry">
    <div>
      <!-- <div class="text-center">
        <router-link v-if="prevPath" class="btn btn-small" :to="prevPath">
          <i class="fa fa-caret-left" />
        </router-link>
        <router-link v-if="nextPath" class="btn btn-small" :to="nextPath">
          <i class="fa fa-caret-right" />
        </router-link>
      </div> -->
      <div>
        <span
          v-if="
            entry.level &&
            entry.level !== 'outside' &&
            $dictionaryName === 'hsk-cedict'
          "
          class="entry-level p-1 rounded font-weight-bold"
          style="position: relative; bottom: 0.5em; font-size: 0.8em"
          :data-level="entry.level"
        >
          HSK {{ entry.level }}
        </span>
        <span
          v-if="entry.newHSK"
          class="entry-level p-1 rounded font-weight-bold"
          :style="`position: relative; bottom: 0.5em; font-size: 0.8em; color: ${
            entry.newHSK === '7-9' ? '#00716B' : 'inherit'
          }`"
        >
          <i class="fa fa-arrow-right mr-2" />
          {{ $t('New HSK {num}', {num: entry.newHSK})}}
          <span
            v-if="entry.newHSKMatches.length === 1"
            style="color: #999; font-weight: normal"
          >
            #{{ entry.newHSKMatches[0].num }}
          </span>
        </span>
        <span
          v-if="
            entry.level &&
            entry.level !== 'outside' &&
            $dictionaryName !== 'hsk-cedict'
          "
          class="entry-level p-1 rounded ml-2 mr-2"
          style="position: relative; bottom: 0.2em; font-size: 0.8em"
          :data-bg-level="entry.level"
        >
          {{ entry.level }}
        </span>
      </div>
      <Annotate
        tag="div"
        v-if="entry.counters"
        :class="{ 'mt-1 mb-2': true, 'hide-phonetics': hidePhonetics && !reveal }"
      >
        <span>
          一{{
            entry.counters.map((counter) => counter.simplified).join("、一")
          }}
        </span>
      </Annotate>
      <div class="entry-word-wrapper" style="display: inline-block">
        <div class="mb-2">
          <div class="entry-pinyin">
            
            <span :class="{ 'ml-2 mr-1': true, transparent: hidePhonetics && !reveal }">
              <span v-if="$l2.code === 'tlh'">
                {{ entry.head }} /{{ klingonIPA(entry.head) }}/
              </span>
              <template v-else>
                <span
                  v-if="$l2.code === 'vi' && entry.pronunciation"
                  v-html="
                    '[' +
                    entry.pronunciation.replace(
                      /\[\[(.+?)#Vietnamese\|.+?]]/g,
                      '$1'
                    ) +
                    ']'
                  "
                />
                <span v-else-if="entry.pronunciation && (!entry.cjk || $l2.code === 'ko')">
                  [{{ entry.pronunciation }}]
                </span>
                <span v-else-if="entry.cjk">
                  <template v-if="$l2.code === 'ja'">
                    {{ entry.cjk.phonetics }} ({{ transliterate(entry.cjk.phonetics) }})
                  </template>
                  <template v-else>
                    {{ transliterate(entry.cjk.phonetics) }}
                  </template>
                </span>
                <span v-else>
                  {{ transliterate(entry.head) }}
                </span>
              </template>
            </span>
            <Speak
              class="ml-1 mr-2"
              :text="entry.head"
              :mp3="entry.audio"
              ref="speak"
              :wiktionary="entry.wiktionary"
            />
          </div>
        </div>
        <span :class="{ transparent: hideWord && !reveal }">
          <router-link
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
              ></span>
              <span
                class="entry-word traditional"
                :data-level="entry.level || 'outside'"
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
                <span v-html="transform(entry.head)" :class="{klingon: $l2.code === 'tlh'}"></span>
              </span>
            </template>
          </router-link>
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
import Klingon from "@/lib/klingon";
import { transliterate as tr } from "transliteration";

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
      default: false
    }
  },
  data() {
    return {
      nextPath: undefined,
      prevPath: undefined,
      wordIndex: undefined,
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
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
  },
  async mounted() {
    this.prevPath = await this.prevWord();
    this.nextPath = await this.nextWord();
    if (this.$refs.speak && this.$store.state.settings.autoPronounce) {
      this.$refs.speak.speak(0.75, 0.5); // Speed and volume
    }
  },
  methods: {
    transliterate(text) {
      let transliteration = tr(text);
      if (transliteration !== text) return tr(text);
    },
    klingonIPA(text) {
      return Klingon.latinToIPA(text);
    },
    fixKlingonTypos(text) {
      return Klingon.fixTypos(text);
    },
    transform(text) {
      if (typeof text === "undefined") {
        text = "";
      }
      if (this.$l2.code === "tlh" && text.trim() !== "") {
        text = Klingon.latinToConScript(text);
      }
      return text;
    },
    async nextWord() {
      if (this.entry.newHSKMatches) {
        let match = this.entry.newHSKMatches.find(
          (match) => match.level === "7-9"
        );
        if (match) {
          let newEntry = await (
            await this.$getDictionary()
          ).getByNewHSK("7-9", Math.min(Number(match.num) + 1), 5635);
          if (newEntry)
            return `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$dictionaryName}/${newEntry.id}`;
        }
      }
    },
    async prevWord() {
      if (this.entry.newHSKMatches) {
        let match = this.entry.newHSKMatches.find(
          (match) => match.level === "7-9"
        );
        if (match) {
          let newEntry = await (
            await this.$getDictionary()
          ).getByNewHSK("7-9", Math.max(0, Number(match.num) - 1));
          if (newEntry)
            return `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$dictionaryName}/${newEntry.id}`;
        }
      }
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

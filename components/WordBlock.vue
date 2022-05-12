<template>
  <v-popover
    :open="popup && open"
    :open-group="'id' + _uid"
    :id="id"
    placement="top"
    trigger="manual"
    class="word-block-popover"
    style="display: inline-block"
  >
    <span
      :class="{
        'word-block': true,
        'with-popup': popup,
        sticky,
        common:
          this.words &&
          this.words.length > 0 &&
          this.words[0].weight &&
          this.words[0].weight > 750,
        seen: seen,
        saved: saved,
      }"
      v-bind="attributes"
      v-on="popup ? { click: wordBlockClick } : {}"
      @mouseenter="wordBlockMouseEnter"
      @mouseleave="wordBlockMouseLeave"
      v-observe-visibility="visibilityChanged"
    >
      <template v-if="token && token.candidates && token.candidates.length > 0">
        <span
          class="word-block-definition"
          v-if="l2Settings.showDefinition"
          v-html="token.candidates[0].definitions[0]"
        ></span>
        <span
          class="word-block-pinyin"
          v-if="
            l2Settings.showPinyin &&
            phonetics &&
            transliteration &&
            transliteration !== token.text
          "
        >
          {{ savedTransliteration || transliteration }}
        </span>
        <span
          v-if="!l2Settings.useTraditional && token.candidates[0].simplified"
          :class="`word-block-text word-block-simplified ${
            hard ? 'word-block-hard' : ''
          } ${pos ? 'pos-' + pos : ''}`"
        >
          {{ token.candidates[0].simplified }}
        </span>
        <span
          v-else-if="
            l2Settings.useTraditional && token.candidates[0].traditional
          "
          :class="`word-block-text word-block-traditional  ${
            hard ? 'word-block-hard' : ''
          } ${pos ? 'pos-' + pos : ''}`"
        >
          {{ token.candidates[0].traditional }}
        </span>
        <span v-else class="word-block-text-byeonggi-wrapper">
          <span
            :class="`word-block-text d-inline-block ${
              $l2.code === 'tlh' ? 'klingon' : ''
            } ${hard ? 'word-block-hard' : ''}  ${pos ? 'pos-' + pos : ''}`"
          >
            {{ transform(token.text, $l2.code === "vi") }}
          </span>
          <span
            v-if="l2Settings.showByeonggi && hanja"
            class="word-block-text-byeonggi d-inline-block"
            v-html="hanja"
          />
        </span>
      </template>
      <template v-else>
        <span
          class="word-block-pinyin"
          v-if="
            l2Settings.showPinyin &&
            phonetics &&
            transliteration &&
            transliteration !== text &&
            $l2.code !== 'tlh'
          "
        >
          {{ savedTransliteration || transliteration }}
        </span>
        <span class="word-block-pinyin" v-if="$l2.code === 'tlh'">
          {{ fixKlingonTypos(text) }}
        </span>
        <span
          :class="`word-block-text ${$l2.code === 'tlh' ? 'klingon' : ''} ${
            pos ? 'pos-' + pos : ''
          }`"
          v-html="transform(text)"
        />
      </template>
    </span>
    <template slot="popover">
      <div @mouseenter="tooltipMouseEnter" @mouseleave="tooltipMouseLeave">
        <div
          class="tooltip-images"
          :key="`tooltip-images-${text}`"
          v-if="loadingImages"
        >
          <img
            v-lazy-load
            alt
            class="image-wall-image"
            v-for="(image, index) in images"
            :key="`web-images-${text}-${index}`"
            :src="`${Config.imageProxy}?${image.src}`"
          />
        </div>
        <button class="word-block-tool-tip-close" @click.stop="closePopup">
          <i class="fa fa-times"></i>
        </button>
        <div
          v-for="word in words"
          :key="`word-block-word-${word.id}`"
          :class="classes"
        >
          <div v-if="word">
            <div
              v-for="(match, index) in word.matches"
              style="color: #999"
              :key="`match-${index}`"
            >
              <b>{{ match.field }} {{ match.number }}</b>
              {{ match.table !== "declension" ? match.table : "" }}
              of
            </div>
            <div
              v-if="word.morphology"
              style="color: #999"
              :key="`word-block-word-morphology-${word.id}`"
            >
              {{ word.morphology }} of
            </div>
            <div class="word-pronunciation">
              <Star
                :word="word"
                :text="text"
                class="mr-1"
                style="font-size: 1.2rem"
              ></Star>
              <span
                v-if="$l2.code === 'vi' && word.pronunciation"
                v-html="
                  '[' +
                  word.pronunciation.replace(
                    /\[\[(.+?)#Vietnamese\|.+?]]/g,
                    '$1'
                  ) +
                  ']'
                "
              />
              <span v-else-if="word.pronunciation">
                <template v-if="$l2 === 'zh'">
                  {{ word.pronunciation }}
                </template>
                <template v-else>[{{ word.pronunciation }}]</template>
              </span>
              <span v-else-if="word.pinyin">
                {{ word.pinyin }}
              </span>
              <span v-else-if="word.kana && word.kana !== word.head">
                {{ word.kana }}
              </span>
              <span
                v-else-if="
                  $hasFeature('transliteration') &&
                  !['tlh', 'fa'].includes($l2.code)
                "
              >
                {{ tr(word.head) }}
              </span>
              <span v-if="$l2.code === 'tlh'">
                {{ word.head }} /{{ klingonIPA(word.head) }}/
              </span>
              <span v-if="$l2.code === 'fa'">
                {{ farsiRomanizations[word.head] }}
              </span>
              <span v-if="word.jyutping && word.pinyin">
                / {{ word.pinyin }}
              </span>
              <Speak
                :text="word.kana || word.head"
                :mp3="word.audio"
                :wiktionary="word.wiktionary"
                class="ml-1"
                ref="speak"
              />
            </div>
            <b
              :data-level="word.level || 'outside'"
              style="font-size: 1.5rem"
              :class="{
                klingon: $l2.code === 'tlh',
              }"
            >
              <span v-if="$l2.code === 'de' && word.gender">
                {{ { n: "das", m: "der", f: "die" }[word.gender] }}
              </span>
              {{ transform(word.head) }}
            </b>
            <span
              v-if="word.traditional && word.traditional !== word.simplified"
              class="ml-1"
              style="font-size: 1.2em; color: #999"
            >
              {{ word.traditional }}
            </span>
            <span
              v-if="
                ['ko', 'vi'].includes($l2.code) &&
                word.cjk &&
                word.cjk.canonical
              "
              class="ml-1"
              style="font-size: 1.2em; color: #999"
            >
              [{{ word.cjk.canonical }}]
            </span>
            <span
              v-if="word.level && word.level !== 'outside'"
              :data-bg-level="word.level"
              class="pl-1 pr-1 ml-1 rounded d-inline-block"
              style="font-size: 0.8em; position: relative; bottom: 0.1rem"
            >
              {{ $dictionaryName === "hsk-cedict" ? "HSK " : ""
              }}{{ word.level }}
            </span>
            <span
              v-if="word.newHSK"
              class="ml-1"
              :style="`position: relative; bottom: 0.2em; font-size: 0.8em; color: ${
                word.newHSK === '7-9' ? '#00716B' : 'inherit'
              }`"
            >
              <i class="fa fa-arrow-right mr-1" />
              新 HSK {{ word.newHSK }}
            </span>
            <span v-if="word.unit" style="font-size: 0.8em" class="ml-1">
              Unit {{ word.unit }}
            </span>
            <router-link
              :to="`/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${word.id}`"
              class="ml-1 link-unstyled"
              style="color: #999"
            >
              <i class="fas fa-book"></i>
            </router-link>
          </div>
          <div>
            <span
              class="word-type"
              v-if="word.type !== 'other'"
              style="color: #999"
            >
              {{ word.verbs ? abbreviate(word.verbs.aspect) : "" }}
              {{ abbreviate(word.type) }}
            </span>
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
              }}
              <span class="word-counters" v-if="word.counters">
                (
                <Annotate tag="span" :buttons="false" :popup="false">
                  <span>
                    {{
                      word.counters
                        .map((counter) => "一" + counter.simplified)
                        .join(word.simplified + "、") + word.simplified
                    }}
                  </span>
                </Annotate>
                )
              </span>
            </span>
            <span
              v-if="word.supplementalLang"
              class="
                pl-1
                pr-1
                ml-1
                rounded
                d-inline-block
                bg-warning
                text-white
              "
              style="font-size: 0.8em; position: relative; bottom: 0.1rem"
            >
              {{ $languages.getSmart(word.supplementalLang).name }}
            </span>
            <ol class="word-translation" v-if="word.definitions">
              <li
                v-for="(def, index) in unique(word.definitions)
                  .filter((def) => def.trim() !== '')
                  .map((definition) =>
                    definition ? definition.replace(/\[.*\] /g, '') : ''
                  )"
                :key="`wordblock-def-${index}`"
                class="word-translation-item"
              >
                <span>{{ def }}</span>
              </li>
            </ol>
          </div>
        </div>
        <EntryExternal
          v-if="text || token"
          :term="text ? text : token.candidates[0].head"
          :sticky="false"
          class="mt-2"
        />
        <div v-if="loading === true"><Loader :sticky="true" :message="`Looking up “${this.text}” in the dictionary...`" /></div>
        <div
          v-if="words && words.length === 0 && loading === false"
          class="mt-3"
        >
          <span style="color: #999" v-if="$hasFeature('transliteration')">
            {{ tr(text) }}
            <Speak :text="text" class="ml-1" />
          </span>
          <div
            data-level="outside"
            style="font-size: 1.5rem; font-weight: bold"
          >
            {{ text }}
          </div>
          <span style="color: #999">
            Sorry, no definition found for “{{ text }}”.
          </span>
        </div>
      </div>
    </template>
  </v-popover>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import WordPhotos from "@/lib/word-photos";
import Klingon from "@/lib/klingon";
import tr from '@sindresorhus/transliterate';
import { mapState } from "vuex";

export default {
  props: {
    token: {
      type: Object,
    },
    explore: {
      default: false,
    },
    phonetics: {
      default: true,
    },
    sticky: {
      default: false, // whether or not to show each word's level color by default (without hovering)
    },
    seen: {
      default: false, // whether this word has already been annotated ('seen') before
    },
    popup: {
      default: true,
    },
  },
  data() {
    return {
      savedTransliteration: undefined,
      id: `wordblock-${Helper.uniqueId()}`,
      open: false,
      loading: true,
      text: this.$slots.default ? this.$slots.default[0].text : undefined,
      saved: false,
      images: [],
      words: [],
      classes: {
        "tooltip-entry": true,
      },
      checkSaved: true,
      wordblockHover: false,
      tooltipHover: false,
      highlightHardWords: true,
      Config,
      transliteration: undefined,
      farsiRomanizations: {},
      lastLookupWasQuick: false,
      loadingImages: false,
    };
  },
  computed: {
    ...mapState("settings", ["l2Settings"]),
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
    pos() {
      let pos;
      if (this.token && this.token.pos) {
        pos = this.token.pos.replace(/\s/g, "-");
      }
      if (!pos && this.words && this.words[0]) {
        pos = this.words[0].pos;
      }
      if (pos) return pos.replace(/\s/g, "-");
    },
    hanja() {
      if (["ko", "vi"].includes(this.$l2.code)) {
        let hanja = "";
        if (this.saved) hanja = this.saved.hanja;
        else {
          let head = this.token.candidates[0].head;
          let bannedEndings = "이히하고가기는은도의";
          let bannedWords = ['지난', '진자']
          if (!bannedWords.includes(head) && !bannedEndings.includes(head.charAt(head.length - 1))) {
            let hanjas = this.token.candidates.map((c) => c.hanja);
            if (this.$l2.code !== "vi") hanjas = Helper.unique(hanjas); // Vietnamese Han Tu is wiktionary CSV file has incorrect homophones
            if (hanjas.length === 1 && hanjas[0] && !hanjas[0].includes(",")) {
              hanja = hanjas[0];
            } else if (this.$l2.code === "vi") {
              if (hanjas[0] && hanjas[0].length > 1) {
                hanja = hanjas[0];
              }
            }
          }
        }
        return hanja ? hanja.split(/[,\-]/)[0] : "";
      }
    },
    bestCandidate() {
      if (this.token && this.token.candidates && this.token.candidates[0]) {
        let saved = this.token.candidates.find((c) => c.saved);
        if (saved) {
          return saved;
        } else return this.token.candidates[0];
      }
    },
    attributes() {
      let attributes = {};
      if (this.words && this.words.length > 0) {
        if (this.popup) {
          attributes["data-hover-level"] = "outside";
        }
        if (this.words[0].rank) attributes["data-rank"] = this.words[0].rank;
        if (this.words[0].weight)
          attributes["data-weight"] = this.words[0].weight;
      }
      return attributes;
    },
    hard() {
      if (this.highlightHardWords) {
        if (
          this.$l2.code === "zh" &&
          this.token &&
          this.token.candidates &&
          this.token.candidates.length > 0
        ) {
          if (this.token.candidates[0].head.length < 4) return false; // Only highlight chengyu
          // if (
          //   this.token.candidates[0].newHSK &&
          //   this.token.candidates[0].newHSK === "7-9"
          // ) {
          //   return "7-9";
          // } else if (
          //   this.token.candidates[0].hsk === "outside" &&
          //   !this.token.candidates[0].newHSK &&
          //   this.token.candidates[0].weight < 750
          // ) {
          //   return "outside";
          // } else {
          //   return false;
          // }
        } else if (
          this.$l2.code === "en" &&
          this.token &&
          this.token.candidates &&
          this.token.candidates.length > 0
        ) {
          if (this.token.candidates[0].level === "C2") {
            return "C2";
          } else {
            return false;
          }
        }
      }
    },
  },
  mounted() {
    if (this.sticky) {
      this.lookup();
    }
    this.update();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")) {
        this.update();
      }
    });
  },
  beforeDestroy() {
    this.words = []
    console.log('Destorying', this.text)
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  watch: {
    async wordblockHover() {
      if ((this.words && this.words.length === 0) || this.lastLookupWasQuick) {
        this.lookup();
      }
      await Helper.timeout(300);
      this.updateOpen();
    },
    async tooltipHover() {
      await Helper.timeout(123);
      this.updateOpen();
    },
  },
  methods: {
    async visibilityChanged(isVisible) {
      await Helper.timeout(123);
      if (isVisible && (!this.words || this.words.length === 0)) {
        if (this.$l2.code !== "fa") this.lookup(true);
      }
    },
    async getFarsiRomanization(text) {
      if (this.$l2.code === "fa") {
        let dictionary = await this.$getDictionary();
        let roman = await (await dictionary).romanizePersian(text);
        return roman || tr(text);
      }
    },
    async getTransliteration() {
      if (this.$hasFeature("transliteration")) {
        if (
          this.token &&
          this.token.candidates &&
          this.token.candidates.length > 0
        ) {
          if (this.token.candidates[0].kana) {
            return this.token.candidates[0].kana;
          } else if (this.token.candidates[0].pronunciation) {
            return this.token.candidates[0].pronunciation.split(",")[0];
          } else if (this.token.candidates[0].pinyin) {
            return this.token.candidates[0].pinyin;
          }
        }
        if (this.$l2.code === "fa") {
          this.text = this.text.replace(/\u064a/g, "\u06cc"); // Arabic YEH to Farsi YEH
          let roman = await this.getFarsiRomanization(this.text);
          return roman.replace(/\^/g, "");
        }
        if (!["ja", "zh", "nan", "hak"].includes(this.$l2.code)) {
          return tr(this.text);
        }
      }
    },
    klingonIPA(text) {
      return Klingon.latinToIPA(text);
    },
    fixKlingonTypos(text) {
      return Klingon.fixTypos(text);
    },
    transform(text, removeSpacing = false) {
      if (typeof text === "undefined") {
        text = "";
      }
      if (this.$l2.code === "ru" && text.length > 9) text = this.segment(text);
      if (this.$l2.code === "tlh" && text.trim() !== "") {
        text = Klingon.latinToConScript(text);
      }
      if (removeSpacing) {
        text = text.replace(/ /gi, "");
      }
      return text;
    },
    wordBlockMouseEnter(event) {
      this.wordblockHover = true;
    },
    async wordBlockMouseLeave(event) {
      this.wordblockHover = false;
    },
    tooltipMouseEnter(event) {
      this.tooltipHover = true;
    },
    tooltipMouseLeave(event) {
      this.tooltipHover = false;
    },
    wordBlockClick(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (
        this.explore &&
        this.token &&
        this.token.candidates &&
        this.token.candidates.length > 0
      ) {
        this.$router.push({
          path: `/${this.$l1.code}/${this.$l2.code}/explore/related/${this.token.candidates[0].id}`,
        });
      } else {
        if (!Helper.isMobile()) this.togglePopup();
      }
    },
    tr(text) {
      return tr(text);
    },
    segment(text) {
      return text
        .replace(
          /([́ёеуюйыаоэяицкнгшщзхъфвпрлджчсмтьб])([цкнгшщзхъфвпрлджчсмтб])/gi,
          "$1·$2"
        )
        .replace(
          /·([цкнгшщзхъфвпрлджчсмтб])([цкнгшщзхъфвпрлджчсмтб])/gi,
          "$1·$2"
        )
        .replace(/·([цкнгшщзхъфвпрлджчсмтб])ь/gi, "$1ь")
        .replace(/·([цкнгшщзхъфвпрлджчсмтб])·/gi, "·$1")
        .replace(/^(.)·/, "$1")
        .replace(/·(.)$/, "$1");
      //([ёеуюйыаоэяи])
    },
    async update() {
      if (this.$l1) this.classes[`l1-${this.$l1.code}`] = true;
      if (this.$l2) this.classes[`l2-${this.$l2.code}`] = true;
      if (this.$l2.han) this.classes["l2-zh"] = true;
      if (this.checkSaved) {
        let savedCandidate = undefined;
        let savedWord = false;
        if (
          this.token &&
          this.token.candidates &&
          this.token.candidates.length > 0
        ) {
          for (let candidate of this.token.candidates) {
            savedWord = this.$store.getters["savedWords/has"]({
              l2: this.$l2.code,
              id: candidate.id,
            });
            if (savedWord) {
              savedCandidate = candidate;
              break;
            }
          }
        } else {
          if (
            this.$slots.default &&
            this.$slots.default &&
            this.$slots.default[0] &&
            this.$slots.default[0].text
          ) {
            savedWord = this.$store.getters["savedWords/has"]({
              l2: this.$l2.code,
              text: this.$slots.default[0].text.toLowerCase(),
            });
          }
        }
        if (
          savedWord &&
          savedWord.id &&
          ["ja", "zh", "nan", "hak", "en", "ko", "vi"].includes(this.$l2.code)
        ) {
          let word =
            savedCandidate ||
            (await (await this.$getDictionary()).get(savedWord.id));
          let text =
            this.text ||
            (this.token && this.token.candidates.length > 0
              ? this.token.candidates[0].head
              : undefined);
          if (word && word.head && word.head === text) {
            this.savedTransliteration =
              word.jyutping ||
              word.pinyin ||
              word.kana ||
              word.pronunciation ||
              this.transliteration;
          }
          this.saved = word ? word : false;
        } else {
          this.saved = savedWord ? savedWord : false;
        }
      }
      if (!this.transliteration)
        this.transliteration = await this.getTransliteration();
    },
    matchCase(text) {
      if (this.text.match(/^[\wА-ЯЁ]/)) {
        if (this.text.match(/^.[\wА-ЯЁ]/)) {
          return text.toUpperCase();
        } else {
          return Helper.ucFirst(text);
        }
      } else {
        return text;
      }
    },
    async loadImages() {
      this.loadingImages = true;
      if (this.images.length === 0) {
        this.images = (
          await WordPhotos.getGoogleImages({
            term: this.token ? this.token.text : this.text,
            lang: this.$l2.code,
          })
        ).slice(0, 5);
      }
    },
    togglePopup() {
      if (this.popup) {
        if (this.open) this.closePopup();
        else this.openPopup();
      }
    },
    updateOpen() {
      // alert(`w: ${this.wordblockHover}, t: ${this.tooltipHover}`);
      if (this.wordblockHover || this.tooltipHover) {
        this.openPopup();
      } else {
        this.closePopup();
      }
    },
    async openPopup() {
      if (this.open) return;
      if (this.popup && (await this.$getDictionary())) {
        if (this.loading === true) {
          if (
            (this.words && this.words.length === 0) ||
            this.lastLookupWasQuick
          ) {
            this.lookup();
          }
        }
        if (
          this.words &&
          this.words.find(
            (w) => w.pos && ["proper noun", "noun", "Noun"].includes(w.pos)
          )
        )
          this.loadImages();
        this.open = true;
        await Helper.timeout(123);
        if (this.open) {
          if (this.$refs.speak && this.$refs.speak[0]) {
            this.$refs.speak[0].speak(0.75, 0.5); // Speed and volume
          }
        }
      }
      this.$nuxt.$emit("popupOpened");
    },
    async closePopup() {
      this.open = false;
      this.$nuxt.$emit("popupClosed");
    },
    async lookup(quick = false) {
      this.lastLookupWasQuick = quick;
      let words = [];
      if (
        this.token &&
        this.token.candidates &&
        this.token.candidates.length > 0
      ) {
        words = this.token.candidates;
      } else if (this.text) {
        if (!this.text && this.token) this.text = this.token.candidates[0].head;
        words = await (
          await this.$getDictionary()
        ).lookupFuzzy(this.text, 20, quick);
        if (words) {
          for (let word of words) {
            if (this.$l2.code === "fa" && !quick) {
              this.farsiRomanizations[word.head] =
                await this.getFarsiRomanization(word.head);
            }
            // Russian
            if (word && word.matches) {
              for (let match of word.matches) {
                match.form = await (
                  await this.$getDictionary()
                ).accent(match.form);
                match.field = await (
                  await this.$getDictionary()
                ).stylize(match.field);
                match.number = await (
                  await this.$getDictionary()
                ).stylize(match.number);
                match.table = await (
                  await this.$getDictionary()
                ).stylize(match.table);
              }
            }
          }
        }
      }
      words = words
        ? words.sort((a, b) => {
            let asaved = this.$store.getters["savedWords/has"]({
              id: a.id,
              l2: this.$l2.code,
            });

            let bsaved = this.$store.getters["savedWords/has"]({
              id: b.id,
              l2: this.$l2.code,
            });
            return asaved === bsaved ? 0 : asaved ? -1 : 1;
          })
        : [];
      this.words = Helper.uniqueByValue(words, "id");
      this.loading = false;
    },
    unique(a) {
      return a.filter((item, i, ar) => ar.indexOf(item) === i);
    },
    abbreviate(type) {
      let abb = {
        noun: "n.",
        adjective: "adj.",
        verb: "v.",
        pronoun: "pron.",
        perfective: "perf.",
        imperfective: "imperf.",
      };
      return abb[type] || type;
    },
    speak(text) {
      if (this.$hasFeature("speech")) {
        if (!speechSynthesis.speaking) {
          this.utterance = new SpeechSynthesisUtterance(text);
          this.utterance.lang = this.$l2.code;
          speechSynthesis.speak(this.utterance);
        }
      }
    },
  },
};
</script>

<style lang="scss">
.main-dark {
  .word-block,
  .word-block-unknown {
    color: #ccc;
    &.animate {
      animation-name: shine;
      animation-iteration-count: 1;
      animation-duration: 2s;
      animation-timing-function: ease-in-out;
    }
    &.saved.animate {
      animation-name: shinesaved;
    }
  }
}

@keyframes shine {
  0% {
    color: #ccc;
  }
  10% {
    color: #54ff7c;
  }
  100% {
    color: #ccc;
  }
}

@keyframes shinesaved {
  0% {
    color: #28a745;
  }
  10% {
    color: #54ff7c;
  }
  100% {
    color: #28a745;
  }
}

.word-block.with-popup {
  cursor: pointer;

  &.saved {
    font-weight: bold;
  }

  &:hover {
    background-color: rgba(250, 248, 195, 0.5);
    border-radius: 0.25rem;
  }
}

.widget-dark .word-block.with-popup:hover,
.main-dark .word-block.with-popup:hover {
  background-color: #00000066;
}

.word-block-text-byeonggi-wrapper {
  font-size: 0.1em;

  .word-block-text {
    font-size: 10em;
  }

  .word-block-text-byeonggi {
    color: rgba(143, 158, 172, 0.8);
    font-size: 6em;
  }
}

.add-pinyin {
  .word-block {
    display: inline-block;
    text-align: center;
    margin: 0;
    position: relative;
    text-indent: 0;

    span {
      display: block;
      line-height: 1.3;
      text-indent: 0;
    }

    /* Hide by default */
    .word-block-pinyin,
    .word-block-simplified,
    .word-block-traditional,
    .word-block-definition,
    .word-block-text-byeonggi {
      display: none;
    }
  }
}

.tooltip-inner {
  .word-block-pinyin,
  .word-block-simplified,
  .word-block-traditional {
    display: block !important;
  }
}

/* Shown on demand */

.show-pinyin .word-block .word-block-pinyin,
.show-simplified .word-block .word-block-simplified,
.show-traditional .word-block .word-block-traditional,
.show-definition .word-block .word-block-definition {
  display: block;
}

.show-pinyin .word-block .word-block-hard {
  // text-decoration: underline;
  background-color: rgba(255, 226, 129, 0.137);
}

.show-byeonggi .word-block .word-block-text-byeonggi {
  display: inline;
}

.show-definition .word-block {
  position: relative;
}

/* Line style */

.word-block-pinyin {
  font-size: 0.7em;
  margin: 0 0.2rem;
  opacity: 0.7;
}

[dir="rtl"] .annotate-template {
  font-size: 1.33em;
  .word-block-pinyin {
    font-size: 0.66rem;
  }
}

.word-block.saved {
  .word-block-pinyin {
    opacity: 1;
    font-weight: normal;
  }
}

.word-block-definition {
  display: none;
  color: #aaa;
  font-size: 0.7em;
  font-style: italic;
  margin-top: 0.5em;
  max-width: 6rem;
  margin: 0 0.5em 0.2em 0.5em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.word-block-simplified,
.word-block-traditional,
.word-block-text {
  &.pos-verb,
  &.pos-Verb,
  &.pos-動詞 {
    border-bottom: 1px solid rgba(204, 204, 204, 0.5);
  }
}

.show-pinyin-for-saved {
  .word-block:hover:not(.saved) {
    .word-block-pinyin {
      display: inherit;
      position: absolute;
      top: -1.25em;
      left: 50%;
      margin-left: -5em;
      width: 10em;
    }
  }

  .word-block.saved {
    margin-left: 0.1rem;
    margin-right: 0.1rem;

    .word-block-pinyin {
      display: block;
    }
  }
}

.word-translation {
  padding-left: 1rem;
  margin-bottom: 0;
}

.word-translation-item {
  font-style: italic;
}

.word-translation-item::marker {
  margin-right: 0;
}

.tooltip {
  display: block !important;
  $color: white;
  $height: 20rem;
  $width: 20rem;
  border: none;
  max-height: $height;
  max-width: $width;
  border-radius: 1rem;

  &[x-placement^="top"] {
    margin-bottom: 1rem;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="right"] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[aria-hidden="true"] {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0.15s;
  }

  &[aria-hidden="false"] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }

  .word-block-tool-tip-close {
    border-radius: 100%;
    background: #28a745;
    color: white;
    border: none;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    height: 1.5rem;
    width: 1.5rem;
    padding: 0;
    z-index: 10;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: $color;
  }

  .tooltip-inner {
    border-radius: 1rem;
    text-align: left;
    overflow-y: scroll;
    overflow-x: hidden;
    background: $color;
    color: black;
    padding: 1rem;
    box-shadow: 0 5px 20px rgba(black, 0.2);
    max-width: $width;
    max-height: $height;

    .tooltip-images {
      margin-bottom: 0.5rem;
      width: $width;
      overflow-x: scroll;
      display: flex;
      height: 4rem;

      img {
        flex: 1;
        height: 4rem;
        width: auto;
        margin: 0 0.2rem;
      }
    }

    .tooltip-entry {
      color: #666;
    }

    .tooltip-entry + .tooltip-entry {
      margin-top: 1rem;
      border-top: 1px solid #ccc;
      padding-top: 1rem;
    }

    .word-pronunciation,
    .word-pronunciation span {
      color: #779bb5;
      font-family: AndikaW, Andika, Arial, sans-serif;
    }
  }
}
</style>

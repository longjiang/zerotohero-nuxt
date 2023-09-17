<template>
  <TabbedSections v-bind="{ sections }">
    <template #media>
      <Widget
        skin="dark"
        :withPadding="false"
        v-if="entry && showSearchSubs && selectedSearchTerms"
      >
        <template #title>
          <ChooseSearchTerms
            @selectedSearchTerms="selectedSearchTerms = $event"
            @selectedExcludeTerms="selectedExcludeTerms = $event"
            @wholePhraseOnly="wholePhraseOnly = $event"
            :initialSelectedTerms="selectedSearchTerms"
            :allSearchTerms="allSearchTerms"
            :allExcludeTerms="allExcludeTerms"
          />
          — {{ $t("Search in:") }}
          <span v-if="tvShow">
            {{ $t("the TV Show “{title}”", { title: tvShow.title }) }}
          </span>
          <LazyShowFilter v-else @showFilter="reloadSearchSubs" />
        </template>
        <template #body>
          <LazySearchSubsComp
            v-if="selectedSearchTerms && renderSearchSubs"
            ref="searchSubs"
            skin="dark"
            :level="entry.newHSK && entry.newHSK === '7-9' ? '7-9' : entry.hsk"
            :key="`subs-search-${
              entry.id
            }-${wholePhraseOnly}-${selectedSearchTerms.join('-')}`"
            :terms="selectedSearchTerms"
            :excludeTerms="selectedExcludeTerms"
            :tvShow="tvShow"
            :exact="wholePhraseOnly"
            :context="context"
          />
        </template>
      </Widget>
      <EntryYouTube :text="entry.head" v-if="$adminMode" class />
      <Widget v-if="showImages">
        <template #title>
          {{ $t("Images of “{text}” on the Web", { text: entry.head }) }}
        </template>
        <template #body>
          <WebImages
            :text="entry.head"
            :entry="entry"
            limit="10"
            ref="images"
            :preloaded="images"
            @loaded="webImagesLoaded"
          />
          <i18n
            path="See more images of of “{0}” on {1}"
            tag="div"
            class="mt-2"
          >
            <span>{{ entry.head }}</span>
            <a
              :href="`https://www.google.com/search?q=${entry.head}`"
              class="text-secondary"
            >
              <u>Google</u>
            </a>
          </i18n>
        </template>
      </Widget>
    </template>

    <template #chatGPT>
      <Widget>
        <template #title>
          {{ $t("Let ChatGPT explain “{text}”", { text: entry.head }) }}
        </template>
        <template #body>
          <ChatGPT
            :initialMessages="[
              $t(
                'Please explain the {l2} word “{word}”{pronunciation}, give its morphological breakdown, and some examples with {l1} translations, and a sample dialogue with {l1} translations.',
                {
                  l2: $t($l2.name),
                  l1: $t($l1.name),
                  word: entry.head,
                  pronunciation: pronunciation ? ` (${pronunciation})` : '',
                }
              ),
              $t(
                'Please explain how the {l2} word “{word}”{pronunciation} differs from other similar words in {l2}.',
                {
                  l2: $t($l2.name),
                  l1: $t($l1.name),
                  word: entry.head,
                  pronunciation: pronunciation ? ` (${pronunciation})` : '',
                }
              ),
              $t(
                'Please make a {l2} story that illustrates the use of the {l2} word “{word}”{pronunciation}, with a {l1} translation after each paragraph.',
                {
                  l2: $t($l2.name),
                  l1: $t($l1.name),
                  word: entry.head,
                  pronunciation: pronunciation ? ` (${pronunciation})` : '',
                }
              ),
            ]"
          />
        </template>
      </Widget>
    </template>

    <template #inflections>
      <EntryForms class :word="entry" />
    </template>
    <template #collocations>
      <Collocations
        :word="entry"
        @collocationsReady="collocationsReady = true"
        :level="entry.newHSK && entry.newHSK === '7-9' ? '7-9' : entry.level"
      />
    </template>
    <template #phrases>
      <Widget class="phrases mt-2" v-if="entry.phrases">
        <template #title>
          {{ $t("Phrases that include “{word}”", { word: entry.head }) }}
        </template>
        <template #body><WordList :words="entry.phrases" /></template>
      </Widget>
    </template>

    <template #examples>
      <Concordance
        @concordanceReady="concordanceReady = true"
        :word="entry"
        :level="entry.level"
      />
    </template>

    <template #mistakes>
      <Mistakes
        :class="{ '': true, hidden: !mistakesReady }"
        @mistakesReady="mistakesReady = true"
        v-if="$l2.code === 'zh'"
        :text="entry.simplified"
        :key="`mistakes-${entry.id}`"
      ></Mistakes>
    </template>

    <template #characters>
      <div v-if="$l2.code !== 'zh'">
        <EntryCharacters
          v-if="characters"
          :key="`${entry.id}-characters`"
          :text="entry.cjk.canonical"
        ></EntryCharacters>
      </div>
      <div v-else>
        <EntryCharacters
          class="simplified"
          :text="entry.simplified"
          :pinyin="entry.pinyin"
          :key="`${entry.id}-characters-simplified`"
        ></EntryCharacters>
        <EntryCharacters
          class="traditional"
          :text="entry.traditional"
          :pinyin="entry.pinyin"
          :key="`${entry.id}-characters-traditional`"
        ></EntryCharacters>
      </div>
    </template>
    <template #related>
      <EntryDisambiguation
        v-if="['zh', 'yue'].includes($l2.code)"
        :entry="entry"
      ></EntryDisambiguation>
      <EntryRelated
        @relatedReady="relatedReady = true"
        :entry="entry"
        :key="`related-${entry.id}`"
      />
      <div class="row">
        <div class="col-sm-6" v-if="$l2.code !== 'zh'">
          <Chinese
            v-if="characters !== 'NULL'"
            class
            :text="characters"
            :key="`${entry.id}-chinese`"
          />
        </div>
        <div class="col-sm-6" v-if="$l2.code !== 'ja'">
          <Japanese
            v-if="characters"
            class
            :text="characters"
            :key="`${entry.id}-japanese`"
          />
        </div>
        <div class="col-sm-6" v-if="$l2.code !== 'ko'">
          <Korean
            v-if="characters"
            class
            :text="characters"
            :key="`${entry.id}-korean`"
          />
        </div>
      </div>
    </template>
  </TabbedSections>
</template>
<script>
import Vue from "vue";
import { unique, mutuallyExclusive } from "@/lib/utils";

export default {
  props: {
    entry: {
      type: Object,
    },
    showImages: {
      default: true,
    },
    images: {
      type: Array,
      default: () => [],
    },
    showSearchSubs: {
      default: true,
    },
    tvShow: {
      default: undefined,
    },
    exact: {
      default: false, // Whether to search for the exact phrase
    },
    exactPhrase: {
      type: String, // The phrase to search for exactly, set from the phrasebook-phrase page
    },
  },
  data() {
    return {
      selectedSearchTerms: undefined,
      selectedExcludeTerms: undefined,
      allSearchTerms: undefined,
      allExcludeTerms: undefined,
      character: {},
      unsplashSrcs: [],
      unsplashSearchTerm: "",
      searchSubsImage: undefined,
      webImage: undefined,
      searchSubsExample: "",
      collocationsReady: false,
      mistakesReady: false,
      relatedReady: false,
      concordanceReady: false,
      searchSubsReady: false,
      renderSearchSubs: true,
      searchTermsWatcherActivated: false,
      wholePhraseOnly: this.exact ? true : false,
    };
  },
  computed: {
    context() {
      return this.entry?.saved?.context;
    },
    sections() {
      return [
        {
          name: "media",
          title: "Media",
          visible:
            this.entry && this.showSearchSubs && this.selectedSearchTerms,
        },
        {
          name: "chatGPT",
          title: "ChatGPT",
          visible: true,
        },
        {
          name: "phrases",
          title: "Phrases",
          visible: this.entry?.phrases?.length > 0,
        },
        {
          name: "collocations",
          title: "Collocations",
          visible: true,
        },
        {
          name: "examples",
          title: "Examples",
          visible: true,
        },
        {
          name: "mistakes",
          title: "Mistakes",
          visible: this.$l2.code === "zh",
        },
        {
          name: "inflections",
          title: "Inflections",
          visible: true,
        },
        {
          name: "related",
          title: "Related",
          visible: true,
        },
        {
          name: "characters",
          title: "Characters",
          visible: this.characters,
        },
      ];
    },
    characters() {
      let canonical = this.entry?.cjk?.canonical;
      let characters = "";
      if (canonical)
        characters = canonical.replace(
          /[^\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FEF\uF900-\uFA6D\uFA70-\uFAD9]+/gi,
          ""
        );
      return characters;
    },
    portrait() {
      let landscape =
        typeof window !== "undefined" && window.innerWidth < window.innerHeight;
      return landscape;
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    pronunciation() {
      return this.entry.kana || this.entry.pinyin || this.entry.pronunciation;
    },
  },
  async mounted() {
    let allSearchTerms = await this.getSearchTerms();
    this.allExcludeTerms = await this.getExcludeTerms(allSearchTerms);
    if (this.context?.form) {
      allSearchTerms = unique([this.context.form, ...allSearchTerms]);
    }
    this.allSearchTerms = allSearchTerms;
    this.selectedSearchTerms = mutuallyExclusive(this.allSearchTerms).slice(
      0,
      3
    );
    this.selectedExcludeTerms = this.allExcludeTerms;
    this.searchTermsWatcherActivated = true;
    let dictionary = await this.$getDictionary();
    if (dictionary.findPhrases) {
      let phrases = await dictionary.findPhrases(this.entry);
      Vue.set(this.entry, "phrases", phrases);
    }
  },
  watch: {
    selectedSearchTerms() {
      if (this.searchTermsWatcherActivated) this.reloadSearchSubs();
    },
  },
  methods: {
    simplifyExcludeTerms(excludeTerms) {
      excludeTerms = excludeTerms.map((t) =>
        t
          .replace(
            new RegExp(`.*?((${this.selectedSearchTerms?.join("|")}).).*`),
            "$1"
          )
          .replace(
            new RegExp(`.*?(.(${this.selectedSearchTerms?.join("|")})).*`),
            "$1"
          )
          .trim()
      );
      return excludeTerms;
    },
    async getExcludeTerms(allSearchTerms) {
      let excludeTerms = [];
      let dictionary = await this.$getDictionary();
      if (dictionary && allSearchTerms?.length > 0) {
        for (let term of allSearchTerms) {
          let t = await dictionary.getWordsThatContain(term);
          t = this.simplifyExcludeTerms(t);
          excludeTerms = excludeTerms.concat(t);
        }
        excludeTerms = unique(excludeTerms);
        return excludeTerms.filter(
          (s) =>
            s !== "" &&
            !allSearchTerms
              .filter((t) => t)
              .map((t) => t.toLowerCase())
              .includes(s.toLowerCase())
        );
      } else {
        return [];
      }
    },
    reloadSearchSubs() {
      this.renderSearchSubs = false;
      this.$nextTick(() => {
        this.renderSearchSubs = true;
      });
    },
    getEntryProperties(entry) {
      const properties = [
        "simplified",
        "traditional",
        "kana",
        "head",
        "hangul",
      ];
      const validValues = [];

      for (const prop of properties) {
        if (entry[prop] !== undefined) {
          validValues.push(entry[prop]);
        }
      }

      return validValues;
    },
    async getInflectedSearchTerms() {
      // General handling for other dictionaries.
      const dictionary = await this.$getDictionary();
      let forms = (await dictionary.inflect(this.entry.head)) || [];

      // If there are multiple lemma forms, include only the first one.
      if (forms.filter((f) => f.table === "lemma").length > 1) {
        const firstLemma = forms.find((f) => f.table === "lemma");
        forms = forms.filter((f) => f.table !== "lemma" || f === firstLemma);
      }

      // Filter and map forms.
      let terms = forms
        .map((form) => form.form)
        .filter((s) => s && s.length > 1);

      // Handling OpenRussian dictionary.
      if (this.$dictionaryName === "openrussian") {
        terms = terms.map((t) => t.replace(/'/gi, ""));
      }

      return terms;
    },
    async getSearchTerms() {
      let terms = [];

      terms = terms.concat(this.getEntryProperties(this.entry));

      let inflectedTerms = await this.getInflectedSearchTerms();

      terms = terms.concat(inflectedTerms);

      // Deduplicate and sort terms.
      terms = unique([this.entry.head, ...terms]);
      const optimalLength = this.entry.head.length - 1;
      terms.sort(
        (a, b) =>
          Math.abs(a.length - optimalLength) -
          Math.abs(b.length - optimalLength)
      );

      return terms;
    },
    webImagesLoaded(images) {
      if (images.length > 0) {
        this.webImage = images[0].src;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.widget {
  margin-bottom: 2rem;
}
</style>

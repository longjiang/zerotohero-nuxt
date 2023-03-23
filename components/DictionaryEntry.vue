<template>
  <TabbedSections v-bind="{ sections }">
    <template #media>
      <Widget skin="dark" :withPadding="false" v-if="entry && showSearchSubs && selectedSearchTerms">
        <template #title>
          <ChooseSearchTerms
            v-model="selectedSearchTerms"
            :initialSelectedTerms="selectedSearchTerms"
            :allSearchTerms="allSearchTerms"
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
            :key="`subs-search-${entry.id}`"
            :terms="selectedSearchTerms"
            :tvShow="tvShow"
            :exact="exact"
            :context="entry?.saved?.context"
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
            :initialMessage="
              $t(
                'Please explain the {l2} word “{word}” ({pronunciation}), give its morphological breakdown, and some examples with {l1} translations, and a sample dialogue with {l1} translations.',
                {
                  l2: $t($l2.name),
                  l1: $t($l1.name),
                  word: entry.head,
                  pronunciation:
                    entry.kana || entry.pinyin || entry.pronunciation,
                }
              )
            "
          />
        </template>
      </Widget>
    </template>

    <template #inflections>
      <EntryForms v-if="hasForms" class :word="entry" />
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
        <template #title>{{ $t('Phrases that include “{word}”', {word: entry.head }) }}</template>
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
          v-if="entry.cjk && entry.cjk.canonical"
          :key="`${entry.id}-characters`"
          class
          :text="entry.cjk.canonical"
          :pinyin="entry.cjk.phonetics ? entry.cjk.phonetics : undefined"
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
            v-if="
              entry.cjk && entry.cjk.canonical && entry.cjk.canonical !== 'NULL'
            "
            class
            :text="entry.cjk.canonical"
            :key="`${entry.id}-chinese`"
          />
        </div>
        <div class="col-sm-6" v-if="$l2.code !== 'ja'">
          <Japanese
            v-if="
              entry.cjk && entry.cjk.canonical && entry.cjk.canonical !== 'NULL'
            "
            class
            :text="entry.cjk.canonical"
            :key="`${entry.id}-japanese`"
          />
        </div>
        <div class="col-sm-6" v-if="$l2.code !== 'ko'">
          <Korean
            v-if="
              entry.cjk && entry.cjk.canonical && entry.cjk.canonical !== 'NULL'
            "
            class
            :text="entry.cjk.canonical"
            :key="`${entry.id}-korean`"
          />
        </div>
      </div>
    </template>
  </TabbedSections>
</template>
<script>
import Vue from "vue";
import Helper from "@/lib/helper";

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
      default: false,
    },
    exactPhrase: {
      type: String,
    },
  },
  data() {
    return {
      characters: [],
      selectedSearchTerms: undefined,
      allSearchTerms: undefined,
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
    };
  },
  computed: {
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
          visible: this.hasForms,
        },
        {
          name: "related",
          title: "Related",
          visible: true,
        },
        {
          name: "characters",
          title: "Characters",
          visible: this.entry.cjk && this.entry.cjk.canonical,
        },
      ];
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
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
    hasForms() {
      return [
        "wiktionary",
        "kengdic",
        "edict",
        "openrussian",
        "kdic-jc",
      ].includes(this.$dictionaryName);
    },
  },
  async mounted() {
    this.allSearchTerms = await this.getSearchTerms();
    this.selectedSearchTerms = this.allSearchTerms.slice(0, 3);
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
    reloadSearchSubs() {
      this.renderSearchSubs = false;
      this.$nextTick(() => {
        this.renderSearchSubs = true;
      });
    },
    async getSearchTerms() {
      if (this.$dictionaryName === "hsk-cedict") {
        return Helper.unique([this.entry.simplified, this.entry.traditional]);
      }
      if (this.exact && this.exactPhrase) return [this.exactPhrase];
      let terms;
      if (this.$dictionaryName === "edict") {
        terms = [this.entry.head];
        terms.push(this.entry.kana);
        terms = Helper.unique(terms);
      }
      let forms =
        (await (await this.$getDictionary()).wordForms(this.entry)) || [];
      let entryIsLemma = !forms.find((f) => f.table === "lemma");
      if (!entryIsLemma) {
        forms = [forms[0]];
      }
      terms = forms
        .map((form) => form.form)
        .filter((s) => typeof s !== "undefined" && s.length > 1);

      if (this.$dictionaryName === "openrussian") {
        terms = terms.map((t) => t.replace(/'/gi, ""));
      }
      terms = [this.entry.head].concat(terms);
      terms = Helper.unique(terms);
      let optimalLength = this.entry.head.length - 1;
      terms = terms.sort(
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
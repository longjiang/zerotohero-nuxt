<template>
  <div>
    <div class="text-center">
      <!-- <Loader class=" " /> -->
    </div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12 text-center">
          <div>
            <div>
              <EntryHeader
                v-if="showHeader"
                class="p-4"
                :entry="entry"
                :key="`header-${entry.id}`"
                ref="entryHeader"
              ></EntryHeader>
              <DefinitionsList
                :key="`def-list-${entry.id}`"
                v-if="entry.definitions && showDefinitions"
                class="mt-3"
                :definitions="entry.definitions"
              ></DefinitionsList>
            </div>
            <EntryExample
              v-if="showExample"
              :entry="entry"
              class=""
              :key="`${entry.id}-example`"
            ></EntryExample>
          </div>
        </div>
      </div>
    </div>

    <div :class="{ container: !portrait, 'container-fluid': portrait }">
      <div class="row">
        <div :class="{ 'col-sm-12': true, 'p-0': portrait }">
          <div
            :class="{ 'widget widget-dark': true }"
            id="search-subs"
            v-if="entry && showSearchSubs && searchTerms"
          >
            <div class="widget-title">
              “{{ entry.head }}” in
              {{ tvShow ? `the TV Show "${tvShow.title}"` : "TV Shows" }}
            </div>
            <div class="widget-body">
              <LazySearchSubsComp
                v-if="searchTerms"
                ref="searchSubs"
                skin="dark"
                :level="
                  entry.newHSK && entry.newHSK === '7-9' ? '7-9' : entry.hsk
                "
                :key="`subs-search-${entry.id}`"
                :terms="searchTerms"
                :tvShow="tvShow"
                :exact="exact"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <EntryExternal
            v-if="showExternal"
            :term="entry.head"
            :traditional="entry.traditional"
            :level="entry.level"
            class="mt-4 mb-4 text-center"
          />
        </div>
      </div>
      <div class="row d-flex" style="flex-wrap: wrap">
        <!-- <EntryDifficulty :entry="entry" style="flex: 1" class="m-3" /> -->
        <EntryDisambiguation
          v-if="['zh', 'yue'].includes($l2.code)"
          :entry="entry"
          class="ml-3 mr-3"
          style="flex: 1; min-width: 20rem"
        ></EntryDisambiguation>
      </div>
      <div class="row" v-if="showImages">
        <div class="col-sm-12">
          <div class="web-images widget">
            <div class="widget-title">
              {{ $t("Images of “{text}” on the Web", { text: entry.head }) }}
            </div>
            <div class="widget-body jumbotron-fluid p-4">
              <WebImages
                :text="entry.head"
                :entry="entry"
                limit="10"
                ref="images"
                :preloaded="images"
                @loaded="webImagesLoaded"
              />
              <p class="">
                See more images of of “{{ entry.head }}” on
                <a
                  :href="`https://www.google.com/search?q=${entry.head.replace(
                    / /g,
                    '+'
                  )}&tbm=isch&sout=1#spf=1567955197854`"
                >
                  <img
                    src="/img/logo-google-images.png"
                    alt="Google Images"
                    class="logo-small ml-2"
                  />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container pb-4">
      <div class="row">
        <div class="col-12">
          <EntryCourseAd
            v-if="$l2.code === 'zh'"
            :entry="entry"
            class="focus-exclude"
            :key="`${entry.id}-course-ad`"
          ></EntryCourseAd>
        </div>
      </div>
    </div>
    
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <EntryForms
            v-if="
              ['wiktionary', 'kengdic', 'edict', 'openrussian'].includes(
                $dictionaryName
              )
            "
            class=""
            :word="entry"
          />
          <EntryYouTube :text="entry.head" v-if="$adminMode" class="" />
          <Collocations
            :class="{ '': true, hidden: !collocationsReady }"
            :word="entry"
            @collocationsReady="collocationsReady = true"
            :level="
              entry.newHSK && entry.newHSK === '7-9' ? '7-9' : entry.level
            "
          />
          <Mistakes
            :class="{ '': true, hidden: !mistakesReady }"
            @mistakesReady="mistakesReady = true"
            v-if="$l2.code === 'zh'"
            :text="entry.simplified"
            :key="`mistakes-${entry.id}`"
          ></Mistakes>
          <EntryRelated
            :class="{ '': true, hidden: !relatedReady }"
            @relatedReady="relatedReady = true"
            :entry="entry"
            :key="`related-${entry.id}`"
          />
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <Concordance
            :class="{ ' ': true, hidden: !concordanceReady }"
            @concordanceReady="concordanceReady = true"
            :word="entry"
            :level="entry.level"
          />
        </div>
      </div>
      <div class="row" v-if="['ja', 'ko'].includes($l2.code) || $l2.han">
        <div class="col-sm-12" v-if="$l2.code !== 'zh'">
          <EntryCharacters
            v-if="entry.cjk && entry.cjk.canonical"
            :key="`${entry.id}-characters`"
            class=""
            :text="entry.cjk.canonical"
            :pinyin="entry.cjk.phonetics ? entry.cjk.phonetics : undefined"
          ></EntryCharacters>
        </div>
        <div class="col-sm-12" v-else>
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
        <div class="col-sm-6" v-if="$l2.code !== 'zh'">
          <Chinese
            v-if="
              entry.cjk && entry.cjk.canonical && entry.cjk.canonical !== 'NULL'
            "
            class=""
            :text="entry.cjk.canonical"
            :key="`${entry.id}-chinese`"
          />
        </div>
        <div class="col-sm-6" v-if="$l2.code !== 'ja'">
          <Japanese
            v-if="
              entry.cjk && entry.cjk.canonical && entry.cjk.canonical !== 'NULL'
            "
            class=""
            :text="entry.cjk.canonical"
            :key="`${entry.id}-japanese`"
          />
        </div>
        <div class="col-sm-6" v-if="$l2.code !== 'ko'">
          <Korean
            v-if="
              entry.cjk && entry.cjk.canonical && entry.cjk.canonical !== 'NULL'
            "
            class=""
            :text="entry.cjk.canonical"
            :key="`${entry.id}-korean`"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Helper from "@/lib/helper";

export default {
  props: {
    entry: {
      type: Object,
    },
    showHeader: {
      default: true,
    },
    showDefinitions: {
      default: true,
    },
    showExternal: {
      default: true,
    },
    showExample: {
      default: true,
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
      type: String
    }
  },
  data() {
    return {
      characters: [],
      searchTerms: undefined,
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
  },
  async mounted() {
    this.searchTerms = await this.getSearchTerms();
  },
  methods: {
    async getSearchTerms() {
      if (this.$dictionaryName === "hsk-cedict") {
        return [this.entry.simplified, this.entry.traditional];
      }
      if (this.exact && this.exactPhrase) return [this.exactPhrase];      
      let terms = [this.entry.head];
      if (this.$dictionaryName === "edict") {
        terms.push(this.entry.kana);
        terms = Helper.unique(terms);
      }
      else {
        let forms =
          (await (await this.$getDictionary()).wordForms(this.entry)) || [];
        terms = terms.concat(
          forms.map((form) => form.form).filter((s) => s.length > 1)
        );

        if (this.$dictionaryName === "openrussian") {
          terms = terms.map((t) => t.replace(/'/gi, ""));
        }
        terms = Helper.unique(terms)
          .sort((a, b) => a.length - b.length)
          .slice(0, 5);
      }
      return terms;
    },
    searchSubsLoaded(hits) {
      if (hits.length > 0) {
        this.searchSubsReady = true;
        this.searchSubsImage = `https://img.youtube.com/vi/${hits[0].video.youtube_id}/hqdefault.jpg`;
        this.searchSubsExample =
          hits[0].lineIndex > 0
            ? hits[0].video.subs_l2[hits[0].lineIndex - 1].line
            : "" + " " + hits[0].video.subs_l2[hits[0].lineIndex].line;
      }
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
  margin-top: 2rem;
  margin-bottom: 2rem;
}
</style>
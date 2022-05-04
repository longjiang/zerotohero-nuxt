<template>
  <div class="dictionary-entry">
    <div class="text-center">
      <EntryHeader v-if="showHeader" class="p-4" :entry="entry" :key="`header-${entry.id}`" ref="entryHeader">
      </EntryHeader>
      <DefinitionsList :key="`def-list-${entry.id}`" v-if="entry.definitions && showDefinitions" class="mt-3"
        :definitions="entry.definitions"></DefinitionsList>
      <EntryExample v-if="showExample" :entry="entry" class="" :key="`${entry.id}-example`"></EntryExample>
    </div>
    <div class="section-nav-wrapper">
      <div class="section-nav">
        <div v-for="(section, index) in sections.filter((s) => s.visible)" :key="`section-nav-item-${index}`" :class="{
          'section-nav-item': true,
          'section-nav-item-current': currentSection === index,
          'd-none': !section.visible,
        }" @click="goToSection(index)">
          {{ section.title }}
        </div>
      </div>
    </div>
    <div class="dictionary-entry-sections">
      <div class="dictionary-entry-section" v-if="sections[currentSection].title === 'TV Shows'">
        <div :class="{ 'widget widget-dark': true }" id="search-subs" v-if="entry && showSearchSubs && searchTerms">
          <div class="widget-title">
            “{{ searchTerms.join(", ") }}” in
            <span v-if="tvShow">the TV Show “{{ tvShow.title }}”</span>
            <LazyShowFilter v-else @showFilter="reloadSearchSubs" />
          </div>
          <div class="widget-body">
            <LazySearchSubsComp v-if="searchTerms && renderSearchSubs" ref="searchSubs" skin="dark" :level="
              entry.newHSK && entry.newHSK === '7-9' ? '7-9' : entry.hsk
            " :key="`subs-search-${entry.id}`" :terms="searchTerms" :tvShow="tvShow" :exact="exact" />
          </div>
        </div>
        <EntryExternal v-if="showExternal" :term="entry.head" :traditional="entry.traditional" :level="entry.level"
          class="mt-4 mb-4 text-center" />
        <EntryYouTube :text="entry.head" v-if="$adminMode" class="" />
      </div>

      <div class="dictionary-entry-section" v-if="sections[currentSection].title === 'Images' && showImages">
        <div class="web-images widget">
          <div class="widget-title">
            {{ $t("Images of “{text}” on the Web", { text: entry.head }) }}
          </div>
          <div class="widget-body jumbotron-fluid p-4">
            <WebImages :text="entry.head" :entry="entry" limit="10" ref="images" :preloaded="images"
              @loaded="webImagesLoaded" />
            <p class="">
              See more images of of “{{ entry.head }}” on
              <a :href="`https://www.google.com/search?q=${entry.head.replace(
                / /g,
                '+'
              )}&tbm=isch&sout=1#spf=1567955197854`">
                <img src="/img/logo-google-images.png" alt="Google Images" class="logo-small ml-2" />
              </a>
            </p>
          </div>
        </div>
      </div>

      <div class="dictionary-entry-section" v-if="sections[currentSection].title === 'Collocations'">
        <EntryForms v-if="hasForms" class="" :word="entry" />
        <Collocations :word="entry" @collocationsReady="collocationsReady = true"
          :level="entry.newHSK && entry.newHSK === '7-9' ? '7-9' : entry.level" />
      </div>
      <div class="dictionary-entry-section" v-if="sections[currentSection].title === 'Examples'">
        <Mistakes :class="{ '': true, hidden: !mistakesReady }" @mistakesReady="mistakesReady = true"
          v-if="$l2.code === 'zh'" :text="entry.simplified" :key="`mistakes-${entry.id}`"></Mistakes>
        <Concordance @concordanceReady="concordanceReady = true" :word="entry" :level="entry.level" />
      </div>
      <div class="dictionary-entry-section" v-if="
        (['ja', 'ko'].includes($l2.code) || $l2.han) &&
        sections[currentSection].title === 'Characters'
      ">
        <div v-if="$l2.code !== 'zh'">
          <EntryCharacters v-if="entry.cjk && entry.cjk.canonical" :key="`${entry.id}-characters`" class=""
            :text="entry.cjk.canonical" :pinyin="entry.cjk.phonetics ? entry.cjk.phonetics : undefined">
          </EntryCharacters>
        </div>
        <div v-else>
          <EntryCharacters class="simplified" :text="entry.simplified" :pinyin="entry.pinyin"
            :key="`${entry.id}-characters-simplified`"></EntryCharacters>
          <EntryCharacters class="traditional" :text="entry.traditional" :pinyin="entry.pinyin"
            :key="`${entry.id}-characters-traditional`"></EntryCharacters>
        </div>
      </div>
      <div class="dictionary-entry-section" v-if="sections[currentSection].title === 'Related'">
        <!-- <EntryDifficulty :entry="entry" style="flex: 1" class="m-3" /> -->
        <EntryDisambiguation v-if="['zh', 'yue'].includes($l2.code)" :entry="entry"></EntryDisambiguation>
        <EntryRelated @relatedReady="relatedReady = true" :entry="entry" :key="`related-${entry.id}`" />
        <div class="row">
          <div class="col-sm-6" v-if="$l2.code !== 'zh'">
            <Chinese v-if="
              entry.cjk &&
              entry.cjk.canonical &&
              entry.cjk.canonical !== 'NULL'
            " class="" :text="entry.cjk.canonical" :key="`${entry.id}-chinese`" />
          </div>
          <div class="col-sm-6" v-if="$l2.code !== 'ja'">
            <Japanese v-if="
              entry.cjk &&
              entry.cjk.canonical &&
              entry.cjk.canonical !== 'NULL'
            " class="" :text="entry.cjk.canonical" :key="`${entry.id}-japanese`" />
          </div>
          <div class="col-sm-6" v-if="$l2.code !== 'ko'">
            <Korean v-if="
              entry.cjk &&
              entry.cjk.canonical &&
              entry.cjk.canonical !== 'NULL'
            " class="" :text="entry.cjk.canonical" :key="`${entry.id}-korean`" />
          </div>
        </div>
      </div>
    </div>
    <!-- <Sale class="mb-5" style="border-radius: 1rem !important" v-if="$l2.code === 'zh'" /> -->
    <EntryCourseAd v-if="$l2.code === 'zh'" :entry="entry" class="focus-exclude" :key="`${entry.id}-course-ad`">
    </EntryCourseAd>
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
      type: String,
    },
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
      renderSearchSubs: true,
      currentSection: 0,
    };
  },
  computed: {
    sections() {
      return [
        {
          title: "TV Shows",
          visible: this.entry && this.showSearchSubs && this.searchTerms,
        },
        {
          title: "Images",
          visible: this.showImages,
        },
        {
          title: "Collocations",
          visible: true,
        },
        {
          title: "Examples",
          visible: true,
        },
        {
          title: "Related",
          visible: true,
        },
        {
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
      return ["wiktionary", "kengdic", "edict", "openrussian"].includes(
        this.$dictionaryName
      );
    },
  },
  async mounted() {
    this.searchTerms = await this.getSearchTerms();
  },
  methods: {
    reloadSearchSubs() {
      this.renderSearchSubs = false;
      this.$nextTick(() => {
        this.renderSearchSubs = true;
      });
    },
    goToSection(index) {
      this.currentSection = index;
    },
    beforeCarouselChange(oldIndex, newIndex) {
      this.currentSection = newIndex;
    },
    async getSearchTerms() {
      if (this.$dictionaryName === "hsk-cedict") {
        return [this.entry.simplified, this.entry.traditional];
      }
      if (this.exact && this.exactPhrase) return [this.exactPhrase];
      let terms;
      if (this.$dictionaryName === "edict") {
        terms = [this.entry.head];
        terms.push(this.entry.kana);
        terms = Helper.unique(terms);
      } else {
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
        terms = Helper.unique(terms)
        let optimalLength = this.entry.head.length - 1
        terms = terms.sort((a, b) => Math.abs(a.length - optimalLength) - Math.abs(b.length - optimalLength)).slice(0, 3);
        terms = Helper.mutuallyExclusive(terms);
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
  margin-bottom: 2rem;
}

.dictionary-entry {
  .dictionary-entry-section {
    overflow: visible;
    padding: 1rem 0;
  }

  .section-nav-wrapper {
    position: sticky;
    top: 0;
    z-index: 1;
    background: white;

    .section-nav {
      white-space: nowrap;
      padding: 0.5rem 0 0.75rem 0;
      text-align: center;
      overflow: scroll;
      overflow-y: hidden;
      max-width: 100%;

      .section-nav-item {
        display: inline-block;
        padding: 0.5rem 0;
        margin: 0 0.7rem;
        cursor: pointer;
        font-weight: bold;

        &:hover,
        &.section-nav-item-current {
          background-image: linear-gradient(#fd4f1c44, #fd4f1c44);
          background-position: 50% 100%;
          background-size: 70% 0.35rem;
          background-repeat: no-repeat;
        }
      }
    }
  }
}
</style>
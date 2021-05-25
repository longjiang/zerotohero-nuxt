<template>
  <div>
    <div class="text-center">
      <!-- <Loader class="mt-5" /> -->
    </div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12 text-center">
          <div>
            <div class="p-4">
              <EntryHeader
                :entry="entry"
                :key="`header-${entry.id}`"
                ref="entryHeader"
                @prevWord="prevWord()"
                @nextWord="nextWord()"
              ></EntryHeader>
              <DefinitionsList
                :key="`def-list-${entry.id}`"
                v-if="entry.definitions"
                class="mt-4"
                :definitions="entry.definitions"
              ></DefinitionsList>
            </div>
            <EntryExample
              :entry="entry"
              class="mb-4"
              :key="`${entry.id}-example`"
            ></EntryExample>
            <EntryExternal
              :term="entry.bare"
              :traditional="entry.traditional"
              :level="entry.level"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row d-flex" style="flex-wrap: wrap">
        <!-- <EntryDifficulty :entry="entry" style="flex: 1" class="m-3" /> -->
        <EntryDisambiguation
          v-if="['zh', 'yue'].includes($l2.code)"
          :entry="entry"
          class="m-3"
          style="flex: 1; min-width: 20rem"
        ></EntryDisambiguation>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <WebImages
            v-if="showImages"
            class="mt-5"
            :text="entry.bare"
            :entry="entry"
            limit="10"
            ref="images"
            :preloaded="images"
            @loaded="webImagesLoaded"
          />
          <EntryForms v-if="$l2.code === 'ru'" class="mt-5" :word="entry" />
          <Collocations
            v-if="$l2.code !== 'ja'"
            :class="{ 'mt-5 mb-5': true, hidden: !collocationsReady }"
            :word="entry"
            @collocationsReady="collocationsReady = true"
            :level="
              entry.newHSK && entry.newHSK === '7-9' ? '7-9' : entry.level
            "
          />
          <div
            :class="{ 'widget mt-5': true, hidden: !searchSubsReady }"
            id="search-subs"
            v-if="entry && showSearchSubs"
          >
            <div class="widget-title">“{{ entry.bare }}” in TV Shows</div>
            <div class="widget-body">
              <SearchSubsComp
                ref="searchSubs"
                :level="
                  entry.newHSK && entry.newHSK === '7-9' ? '7-9' : entry.hsk
                "
                :key="`subs-search-${entry.id}`"
                :terms="
                  $l2.code === 'zh'
                    ? entry.simplified === entry.traditional
                      ? [entry.simplified]
                      : [entry.simplified, entry.traditional]
                    : entry.forms && entry.forms.length > 0
                    ? entry.forms
                    : [entry.bare]
                "
                @loaded="searchSubsLoaded"
              />
            </div>
          </div>
          <Mistakes
            :class="{ 'mt-5 mb-5': true, hidden: !mistakesReady }"
            @mistakesReady="mistakesReady = true"
            v-if="$l2.code === 'zh'"
            :text="entry.simplified"
            :key="`mistakes-${entry.id}`"
          ></Mistakes>
          <EntryRelated
            :class="{ 'mt-5': true, hidden: !relatedReady }"
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
            :class="{ 'mt-5 mb-5': true, hidden: !concordanceReady }"
            @concordanceReady="concordanceReady = true"
            :word="entry"
            :level="entry.level"
          />
        </div>
      </div>
      <div class="row mt-5" v-if="['zh', 'ja', 'ko'].includes($l2.code)">
        <div class="col-sm-12" v-if="$l2.code !== 'zh'">
          <EntryCharacters
            v-if="entry.cjk && entry.cjk.canonical"
            :key="`${entry.id}-characters`"
            class="mb-4"
            :text="entry.cjk.canonical"
            :pinyin="entry.cjk.phonetics ? entry.cjk.phonetics : undefined"
          ></EntryCharacters>
        </div>
        <div class="col-sm-12" v-else>
          <EntryCharacters
            class="mb-4 simplified"
            :text="entry.simplified"
            :pinyin="entry.pinyin"
            :key="`${entry.id}-characters-simplified`"
          ></EntryCharacters>
          <EntryCharacters
            class="mb-4 traditional"
            :text="entry.traditional"
            :pinyin="entry.pinyin"
            :key="`${entry.id}-characters-traditional`"
          ></EntryCharacters>
        </div>
        <div class="col-sm-6" v-if="$l2.code !== 'zh'">
          <Chinese
            v-if="
              delayed &&
              entry.cjk &&
              entry.cjk.canonical &&
              entry.cjk.canonical !== 'NULL'
            "
            class="mt-5 mb-5"
            :text="entry.cjk.canonical"
            :key="`${entry.id}-chinese`"
          />
        </div>
        <div class="col-sm-6" v-if="$l2.code !== 'ja'">
          <Japanese
            v-if="
              delayed &&
              entry.cjk &&
              entry.cjk.canonical &&
              entry.cjk.canonical !== 'NULL'
            "
            class="mt-5 mb-5"
            :text="entry.cjk.canonical"
            :key="`${entry.id}-japanese`"
          />
        </div>
        <div class="col-sm-6" v-if="$l2.code !== 'ko'">
          <Korean
            v-if="
              delayed &&
              entry.cjk &&
              entry.cjk.canonical &&
              entry.cjk.canonical !== 'NULL'
            "
            class="mt-5 mb-5"
            :text="entry.cjk.canonical"
            :key="`${entry.id}-korean`"
          />
        </div>
      </div>
    </div>
    <EntryCourseAd
      v-if="$l2.code === 'zh'"
      :entry="entry"
      class="focus-exclude"
      :key="`${entry.id}-course-ad`"
    ></EntryCourseAd>
  </div>
</template>
<script>
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
      default: [],
    },
    showSearchSubs: {
      default: true,
    },
  },
  data() {
    return {
      characters: [],
      character: {},
      unsplashSrcs: [],
      unsplashSearchTerm: "",
      searchSubsImage: undefined,
      webImage: undefined,
      searchSubsExample: "",
      delayed: false,
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
  },
  methods: {
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

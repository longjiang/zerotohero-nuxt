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
          <div class="web-images widget mt-5">
            <div class="widget-title">
              {{ $t("Images of “{text}” on the Web", { text: entry.bare }) }}
            </div>
            <div class="widget-body jumbotron-fluid p-4">
              <WebImages
                v-if="showImages"
                :text="entry.bare"
                :entry="entry"
                limit="10"
                ref="images"
                :preloaded="images"
                @loaded="webImagesLoaded"
              />
              <p class="mt-4">
                See more images of of “{{ entry.bare }}” on
                <a
                  :href="`https://www.google.com/search?q=${entry.bare.replace(
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
          <EntryForms v-if="$l2.code === 'ru'" class="mt-5" :word="entry" />
          <Collocations
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
                :terms="searchTerms"
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
import Helper from '@/lib/helper'

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
    searchTerms() {
      if (this.$l2.code === "ja") {
        let unique = Helper.unique([this.entry.bare, this.entry.kana]);
        return unique
      } else if (this.$l2.code === "zh") {
        return Helper.unique([this.entry.simplified, this.entry.traditional]);
      } else if (this.entry.forms && this.entry.forms.length > 0) {
        return this.entry.forms;
      } else {
        return [this.entry.bare];
      }
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

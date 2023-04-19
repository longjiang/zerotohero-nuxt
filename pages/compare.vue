<router>
  {
    path: '/:l1/:l2/compare/:method/:args',
  }
</router>
<template>
  <div class="main" v-cloak>
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="container pt-4 pb-4 focus">
      <div class="row">
        <div class="col-12">
          <SearchCompare :searchEntry="a" :compareEntry="b" :compare="true" />
        </div>
      </div>
      <div class="row mt-4 mb-3">
        <div class="col-6">
          <div class="text-center">
            <Loader v-if="!a" class="mt-5" />
          </div>
          <LazyEntryHeader
            v-if="a"
            :entry="a"
            class="text-center"
            :key="`${a.id}-header`"
            @prevWord="prevWord()"
            @nextWord="nextWord()"
          />
        </div>
        <div class="col-6">
          <div class="text-center">
            <Loader v-if="!b" class="mt-5" />
          </div>
          <LazyEntryHeader
            v-if="b"
            :entry="b"
            class="text-center"
            :key="`${b.id}-header`"
          />
        </div>
      </div>

      <div class="row">
        <div class="col-sm-12">
          <LazyCompareDefs
            v-if="a && b"
            :a="a"
            :b="b"
            :key="`${a.id}-${b.id}-defs`"
          />
        </div>
      </div>
    </div>
    <div class="jumbotron-fluid focus" v-if="a && b && a.example && b.example">
      <div class="container">
        <div class="row">
          <div class="col-sm-6 mb-5">
            <LazyEntryExample
              :key="`${a.id}-example`"
              :entry="a"
              id="compare-example-a"
            />
          </div>
          <div class="col-sm-6 mb-5">
            <LazyEntryExample
              :key="`${b.id}-example`"
              :entry="b"
              id="compare-example-b"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <Widget
            v-if="a && b"
            :key="`${a.id}-subs`"
            skin="dark"
            :withPadding="false"
            id="compare-search-subs"
          >
            <template #title>
              “{{ a.head }}” and “{{ b.head }}” in
              <LazyShowFilter @showFilter="reloadSearchSubs" />
            </template>
            <template #body>
              <LazyCompareSearchSubs
                skin="dark"
                v-if="renderSearchSubs"
                :key="`compare-search-subs-${a.id}-${b.id}`"
                :levelA="
                  a.newHSK && a.newHSK === '7-9'
                    ? '7-9'
                    : a.hsk || a.level || 'outside'
                "
                :termsA="
                  ['zh', 'yue'].includes($l2.code)
                    ? a.simplified === a.traditional
                      ? [a.simplified]
                      : [a.simplified, a.traditional]
                    : [a.head]
                "
                :levelB="
                  b.newHSK && b.newHSK === '7-9'
                    ? '7-9'
                    : b.hsk || a.level || 'outside'
                "
                :termsB="
                  ['zh', 'yue'].includes($l2.code)
                    ? b.simplified === b.traditional
                      ? [b.simplified]
                      : [b.simplified, b.traditional]
                    : [b.head]
                "
              />
            </template>
          </Widget>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row mt-5">
        <div class="col-sm-6">
          <LazyWebImages
            v-if="a"
            :text="a.head"
            limit="10"
            :preloaded="aImages"
            :key="`${a.id}-images`"
          />
        </div>
        <div class="col-sm-6">
          <LazyWebImages
            v-if="b"
            :text="b.head"
            limit="10"
            :preloaded="bImages"
            :key="`${b.id}-images`"
          />
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <LazyCompareCollocations
            class="mt-5 focus"
            v-if="a && b"
            :term="a.head"
            :compareTerm="b.head"
            :level="a.level"
            :compareLevel="b.level"
          />
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-sm-12 mt-5" v-if="a">
          <LazyEntryRelated :key="`${a.id}-related`" :entry="a" />
        </div>
        <div class="col-sm-12 mt-5" v-if="b">
          <LazyEntryRelated :key="`${a.id}-related`" :entry="b" />
        </div>
      </div>
    </div>

    <!-- <EntryCharacters :entry="entry"></EntryCharacters> -->
    <div class="container pt-5 pb-5 focus">
      <div class="row">
        <div class="col-sm-6">
          <LazyConcordance
            v-if="a"
            :text="a.head"
            :level="a.hsk"
            :key="`${a.id}-concordance`"
          />
        </div>
        <div class="col-sm-6">
          <LazyConcordance
            v-if="b"
            :text="b.head"
            :level="b.hsk"
            :key="`${b.id}-concordance`"
          />
        </div>
      </div>
    </div>

    <LazyEntryCourseAd
      v-if="$l2 === 'zh' && a && b"
      :entry="b.hsk > a.hsk ? b : a"
      :key="`${a.id}-${b.id}-ad`"
    />
  </div>
</template>

<script>
import WordPhotos from "@/lib/word-photos";

export default {
  data() {
    return {
      a: undefined,
      b: undefined,
      aKey: 0,
      bKey: 100,
      aImages: [],
      bImages: [],
      renderSearchSubs: true,
    };
  },
  computed: {
    title() {
      if (this.a && this.b) {
        return `“${this.a.head}” vs “${this.b.head}” - ${
          this.$l2 ? this.$l2.name : ""
        } Words Compared | Language Player`;
      }
      return `${
        this.$l2 ? this.$l2.name : ""
      } Words Compared | Language Player`;
    },
    description() {
      if (this.a && this.b) {
        return `See how the two ${this.$l2 ? this.$l2.name : ""} words “${
          this.a.head
        }” and “${
          this.b.head
        }” are used differently in common collocations and on TV shows.`;
      }
      return `Compare two  ${
        this.$l2 ? this.$l2.name : ""
      } words and see how they are used differently in common collocations and on TV shows.`;
    },
    image() {
      if (this.aImages.length > 0 || this.bImages.length > 0) {
        return this.bImages.length > 0
          ? this.bImages[0].src
          : this.aImages[0].src;
      } else {
        return "/img/zth-share-image.jpg";
      }
    },
  },
  async mounted() {
    let method = this.$route.params.method;
    let args = this.$route.params.args.split(",");
    let aId = args[0];
    let bId = args[1];
    if (args.length === 6) {
      // When we use hsk-cedict for chinese
      aId = [args[0], args[1], args[2]].join(",");
      bId = [args[3], args[4], args[5]].join(",");
    }
    if (method && args) {
      if (method === "hsk") {
        this.a = await (await this.$getDictionary()).getByHSKId(aId);
        this.b = await (await this.$getDictionary()).getByHSKId(bId);
      } else if (method === "bare") {
        let resultsA = await (await this.$getDictionary()).lookupbare(aId);
        this.a = resultsA[0];
        let resultsB = await (await this.$getDictionary()).lookupbare(bId);
        this.b = resultsB[0];
      } else if (method === "simplified") {
        let resultsA = await (
          await this.$getDictionary()
        ).lookupSimplified(args[0]);
        this.a = resultsA[0];
        let resultsB = await (
          await this.$getDictionary()
        ).lookupSimplified(args[1]);
        this.b = resultsB[0];
      } else if (method === "traditional") {
        let resultsA = await (
          await this.$getDictionary()
        ).lookupTraditional(args[0]);
        this.a = resultsA[0];
        let resultsB = await (
          await this.$getDictionary()
        ).lookupTraditional(args[1]);
        this.b = resultsB[0];
      } else {
        this.a = await (await this.$getDictionary()).get(aId);
        this.b = await (await this.$getDictionary()).get(bId);
      }
    }
    this.aImages = await WordPhotos.getGoogleImages({
      term: this.a.head,
      lang: this.$l2.code,
    });
    this.bImages = await WordPhotos.getGoogleImages({
      term: this.b.head,
      lang: this.$l2.code,
    });
  },
  methods: {
    reloadSearchSubs() {
      this.renderSearchSubs = false;
      this.$nextTick(() => {
        this.renderSearchSubs = true;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
:deep(.entry-word) {
  font-size: 2.5rem !important;
}
:deep(.image-wall) {
  img {
    height: 4rem;
  }
}
</style>

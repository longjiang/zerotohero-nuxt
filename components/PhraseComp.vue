<template>
  <div class="phrase">
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="text-center" v-if="term && showHeader">
            <Saved
              :item="phraseItem()"
              store="savedPhrases"
              icon="bookmark"
              class="mr-2"
            />
            <Speak :text="term" />
          </div>
          <h2 class="text-center mb-5 font-weight-normal" v-if="term && showHeader">
            <div class="d-inline-block">
              <Annotate
                :phonetics="true"
                :buttons="true"
              >
                <span>{{ term }}</span>
              </Annotate>
            </div>
          </h2>
          <div class="text-center" v-if="term">
            <EntryExternal :term="term" v-if="showExternal" />
          </div>
        </div>
      </div>
    </div>

    <div :class="{ container: !portrait, 'container-fluid': portrait }">
      <div class="row">
        <div :class="{ 'col-sm-12': true, 'p-0': portrait }">
          <div
            class="widget widget-dark"
            id="search-subs"
            v-if="term"
            :key="`subs-search-${term}`"
            :style="portrait ? 'border-radius: 0' : ''"
          >
            <div class="widget-title">
              “{{ term }}” in
              {{ tvShow ? `the TV Show "${tvShow.title}"` : "TV Shows" }}
            </div>
            <div class="widget-body">
              <LazySearchSubsComp
                v-if="term"
                ref="searchSubs"
                level="outside"
                skin="dark"
                :key="`${term}-search-subs`"
                :terms="[term]"
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
          <div class="focus">
            <WebImages
              v-if="term"
              :text="term"
              limit="10"
              :key="`${term}-images`"
            />
            <client-only>
              <EntryYouTube :text="term" v-if="$adminMode" />
            </client-only>
            <Collocations v-if="term" :text="term" :key="`${term}-col`" />
          </div>
          <div :key="term" class="focus">
            <Concordance
              v-if="term"
              :text="term"
              :key="`${term}-concordance`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordPhotos from "@/lib/word-photos";

export default {
  props: {
    term: {
      default: undefined,
    },
    tvShow: {
      default: undefined,
    },
    exact: {
      default: false,
    },
    showExternal: {
      default: false,
    },
    showHeader: {
      default: true,
    },
  },
  data() {
    return {
      images: [],
    };
  },
  async fetch() {
    if (this.term)
      this.images = await WordPhotos.getGoogleImages({
        term: this.term,
        lang: this.$l2.code,
      });
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    portrait() {
      let landscape =
        typeof window !== "undefined" && window.innerWidth < window.innerHeight;
      return landscape;
    },
    title() {
      if (this.term) {
        return `Learn the ${this.$l2 ? this.$l2.name : ""} Phrase “${
          this.term
        }” | ${this.$l2 ? this.$l2.name : ""} Zero to Hero Dictionary`;
      }
      return `Lookup ${this.$l2 ? this.$l2.name : ""} Phrases | ${
        this.$l2 ? this.$l2.name : ""
      } Zero to Hero`;
    },
    description() {
      if (this.term) {
        return `See how “${this.term}” is used in TV shows, how it forms collocations, and other examples.`;
      }
      return `Look up ${this.$l2 ? this.$l2.name : ""} phrases. See how ${
        this.$l2 ? this.$l2.name : ""
      } words are used in TV shows, how they form collocations, and other examples.`;
    },
    image() {
      if (this.images.length > 0) {
        return this.images[0].src;
      } else {
        return "/img/zth-share-image.jpg";
      }
    },
  },
  methods: {
    phraseItem() {
      if (typeof this.term !== "undefined") {
        let phraseItem = {
          l2: this.$l2.code,
          phrase: this.term,
        };
        return phraseItem;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .widget {
  margin-bottom: 3rem;
}
</style>

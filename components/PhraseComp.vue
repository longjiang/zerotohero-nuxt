<template>
  <div class="phrase">
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="text-center mb-5" v-if="term">
            <EntryExternal :term="term" />
          </div>
        </div>
      </div>
    </div>

    <div :class="{ container: !portrait, 'container-fluid': portrait }">
      <div class="row">
        <div :class="{ 'col-sm-12': true, 'p-0': portrait }">
          <div
            class="widget"
            id="search-subs"
            v-if="term"
            :key="`subs-search-${term}`"
            :style="portrait ? 'border-radius: 0' : ''"
          >
            <div class="widget-title">“{{ term }}” in {{ tvShow ? `the TV Show "${tvShow.title}"` : 'TV Shows' }}</div>
            <div class="widget-body">
              <SearchSubsComp
                v-if="term"
                ref="searchSubs"
                level="outside"
                :key="`${term}-search-subs`"
                :terms="[term]"
                :tvShow="tvShow"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="focus mt-5">
            <WebImages
              v-if="term"
              :text="term"
              limit="10"
              class="mt-5"
              :key="`${term}-images`"
            />
            <Collocations
              v-if="term"
              :text="term"
              class="mt-5"
              :key="`${term}-col`"
            />
          </div>
          <div :key="term" class="focus">
            <Concordance
              v-if="term"
              :text="term"
              class="mt-5"
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
      default: ''
    },
    tvShow: {
      default: undefined
    }
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
  methods: {},
};
</script>

<style></style>

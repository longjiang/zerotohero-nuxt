<template>
  <div class="phrase main">
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="container main pt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <div class="search-compare-wrapper">
            <LazySearchCompare
              placeholder="Enter a word or phrase"
              type="dictionary"
              :term="term"
              :compareTerm="compareTerm"
              :random="false"
              :compare="true"
              :key="`${term}-${compareTerm}-search`"
              style="width: 100%"
              :urlFunc="
                (text) => `/${$l1.code}/${$l2.code}/phrase/search/${text}`
              "
            />
          </div>
        </div>
      </div>
    </div>
    <TabbedSections v-bind="{ sections }" class="dictionary-main">
      <template #subtitles>
        <Widget
          v-if="term && compareTerm"
          :key="`${term}-subs`"
          skin="dark"
          :withPadding="false"
          id="compare-search-subs"
        >
          <template #title>
            “{{ term }}” and “{{ compareTerm }}” in
            <LazyShowFilter @showFilter="reloadSearchSubs" />
          </template>
          <template #body>
            <LazyCompareSearchSubs
              v-if="renderSearchSubs"
              skin="dark"
              ref="searchSubs"
              level="outside"
              :key="`${term}-${compareTerm}-compare-search-subs`"
              :termsA="[term]"
              :termsB="[compareTerm]"
            />
          </template>
        </Widget>
        <div class="container">
          <div class="row mt-5">
            <div class="col-sm-6">
              <LazyWebImages
                v-if="term"
                :text="term"
                limit="10"
                :key="`${term}-images`"
              />
            </div>
            <div class="col-sm-6">
              <LazyWebImages
                v-if="compareTerm"
                :text="compareTerm"
                limit="10"
                :key="`${compareTerm}-images`"
              />
            </div>
          </div>
        </div>
      </template>

      <template #chatGPT>
        <Widget>
          <template #title>
            {{ $t("Let ChatGPT explain “{text}”", { text: `${term} vs ${compareTerm}` }) }}
          </template>
          <template #body>
            <ChatGPT
              :maxTokens="50"
              :initialMessages="[
                $t(
                  'What\'s the difference between these {l2} expressions: “{a}”{ap} and “{b}”{bp}?',
                  {
                    l2: $t($l2.name),
                    l1: $t($l1.name),
                    a: term,
                    b: compareTerm,
                    ap: '',
                    bp: '',
                  }
                ),
              ]"
            />
          </template>
        </Widget>
      </template>
      <template #collocations>
        <CompareCollocations
          v-if="term && compareTerm"
          :term="term"
          :compareTerm="compareTerm"
          :key="`${term}-${compareTerm}-col`"
        />
      </template>
      <template #examples>
        <div class="container">
          <div class="row">
            <div class="col-md-6">
              <Concordance
                v-if="term"
                :text="term"
                :key="`${term}-concordance`"
              />
            </div>
            <div class="col-md-6">
              <Concordance
                v-if="compareTerm"
                :text="compareTerm"
                :key="`${compareTerm}-concordance`"
              />
            </div>
          </div>
        </div>
      </template>
      <template #related>
        <div class="container">
          <div class="row">
            <div class="col-md-6 my-3" v-if="term">
              <LazyEntryRelated :key="`${term}-related`" :text="term" :columns="1" />
            </div>
            <div class="col-md-6  my-3" v-if="compareTerm">
              <LazyEntryRelated :key="`${compareTerm}-related`" :text="compareTerm" :columns="1" />
            </div>
          </div>
        </div>
      </template>
    </TabbedSections>
  </div>
</template>

<script>
// /:l1/:l2/phrase/compare/:term/:compareTerm
import Concordance from "@/components/Concordance";
import CompareCollocations from "@/components/CompareCollocations";
import SearchCompare from "@/components/SearchCompare";
import WebImages from "@/components/WebImages";
import CompareSearchSubs from "@/components/CompareSearchSubs";
import WordPhotos from "../../../../lib/word-photos";

export default {
  components: {
    SearchCompare,
    CompareCollocations,
    WebImages,
    Concordance,
    CompareSearchSubs,
  },
  props: {
    method: {
      type: String,
    },
    term: "",
    compareTerm: "",
  },
  data() {
    return {
      aImages: [],
      bImages: [],
      renderSearchSubs: true,
    };
  },
  async created() {
    this.aImages = await WordPhotos.getGoogleImages({
      term: this.term,
      lang: this.$l2.code,
    });
    this.bImages = await WordPhotos.getGoogleImages({
      term: this.compareTerm,
      lang: this.$l2.code,
    });
  },
  computed: {

    sections() {
      return [
        {
          name: "subtitles",
          title: "Subtitles",
          visible: this.term && this.compareTerm,
        },
        {
          name: "chatGPT",
          title: "ChatGPT",
          visible: true,
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
          name: "related",
          title: "Related",
          visible: true,
        },
      ];
    },
    title() {
      if (this.term && this.compareTerm) {
        return `“${this.term}” vs “${this.compareTerm}” - ${
          this.$l2 ? this.$l2.name : ""
        } Phrases Compared | Language Player`;
      }
      return `${
        this.$l2 ? this.$l2.name : ""
      } Phrases Compared | Language Player`;
    },
    description() {
      if (this.a && this.b) {
        return `See how the two ${this.$l2 ? this.$l2.name : ""} phrases “${
          this.term
        }” and “${
          this.compareTerm
        }” are used differently in common collocations and on TV shows.`;
      }
      return `Compare two  ${
        this.$l2 ? this.$l2.name : ""
      } phrases and see how they are used differently in common collocations and on TV shows.`;
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
  methods: {
    reloadSearchSubs() {
      this.renderSearchSubs = false;
      this.$nextTick(() => {
        this.renderSearchSubs = true;
      });
    },
    keydown(e) {
      if (
        !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
        !e.metaKey
      ) {
        // home
        if (e.keyCode == 36) {
          document
            .getElementById("main")
            .scrollIntoView({ behavior: "smooth" });
          // this.$refs.searchCompare.focusOnSearch()
          e.preventDefault();
          return false;
        }
        // end
        if (e.keyCode == 35) {
          document
            .getElementById("search-subs")
            .scrollIntoView({ behavior: "smooth" });
          e.preventDefault();
          return false;
        }
      }
    },
  },
};
</script>

<style></style>

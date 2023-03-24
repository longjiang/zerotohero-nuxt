<template>
  <article class="phrase">
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="text-center" v-if="term">
            <EntryExternal :term="term" v-if="showExternal" />
          </div>
        </div>
      </div>
    </div>

    <TabbedSections v-bind="{ sections }">
      <template #media>
        <Widget
          skin="dark"
          id="search-subs"
          v-if="term"
          :key="`subs-search-${term}`"
        >
          <template #title>
            “{{ term }}” in
            <span v-if="tvShow">the TV Show “{{ tvShow.title }}”</span>
            <LazyShowFilter v-else @showFilter="reloadSearchSubs" />
          </template>
          <template #body>
            <LazySearchSubsComp
              v-if="term && renderSearchSubs"
              ref="searchSubs"
              level="outside"
              skin="dark"
              :key="`${term}-search-subs`"
              :terms="[term]"
              :tvShow="tvShow"
              :exact="exact"
            />
          </template>
        </Widget>

        <WebImages
          v-if="showImages && term"
          :text="term"
          limit="10"
          :key="`${term}-images`"
        />
        <client-only>
          <EntryYouTube :text="term" v-if="$adminMode" />
        </client-only>
      </template>
      <template #chatGPT>
        <Widget>
          <template #title>
            {{ $t("Let ChatGPT explain “{text}”", { text: term }) }}
          </template>
          <template #body>
            <ChatGPT
              :initialMessages="[
                $t(
                  'Please explain the {l2} word “{word}” ({pronunciation}), give its morphological breakdown, and some examples with {l1} translations, and a sample dialogue with {l1} translations.',
                  {
                    l2: $t($l2.name),
                    l1: $t($l1.name),
                    word: term,
                    pronunciation: '',
                  }
                ),
              ]"
            />
          </template>
        </Widget>
      </template>
      <template #phrases>
        <Widget class="phrases mt-2" v-if="phrases.length > 0">
          <template #title>
            {{ $t("Phrases that include “{word}”", { word: term }) }}
          </template>
          <template #body><WordList :words="phrases.slice(0, 200)" /></template>
        </Widget>
      </template>
      <template #collocations>
        <Collocations
          v-if="showCollocations && term"
          :text="term"
          :key="`${term}-col`"
        />
      </template>
      <template #examples>
        <Concordance
          v-if="showExamples && term"
          :text="term"
          :key="`${term}-concordance`"
        />
      </template>
      <template #mistakes>
        <Mistakes
          :class="{ '': true, hidden: !mistakesReady }"
          @mistakesReady="mistakesReady = true"
          v-if="$l2.code === 'zh'"
          :text="term"
          :key="`mistakes-${term}`"
        ></Mistakes>
      </template>
      <template #related>
        <EntryRelated
          @relatedReady="relatedReady = true"
          :term="term"
          :key="`related-${term}`"
        />
        <div class="row">
          <div class="col-sm-6" v-if="$l2.code !== 'zh'">
            <Chinese :text="characters" :key="`${term}-chinese`" />
          </div>
          <div class="col-sm-6" v-if="$l2.code !== 'ja'">
            <Japanese :text="characters" :key="`${term}-japanese`" />
          </div>
          <div class="col-sm-6" v-if="$l2.code !== 'ko'">
            <Korean :text="characters" :key="`${term}-korean`" />
          </div>
        </div>
      </template>
      <template #characters>
        <div v-if="$l2.code !== 'zh'">
          <EntryCharacters
            :key="`${term}-characters`"
            :text="term"
          ></EntryCharacters>
        </div>
      </template>
    </TabbedSections>

    <!-- <Sale v-if="$l2.code === 'zh'" class="mb-5" /> -->
  </article>
</template>

<script>
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
    showImages: {
      default: true,
    },
    showCollocations: {
      default: true,
    },
    showExamples: {
      default: true,
    },
    showExternal: {
      default: false,
    },
  },
  data() {
    return {
      images: [],
      renderSearchSubs: true,
      mistakesReady: false,
      relatedReady: false,
      phrases: [],
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    characters() {
      return this.term.replace(
        /[^\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FEF\uF900-\uFA6D\uFA70-\uFAD9]+/gi,
        ""
      );
    },
    sections() {
      return [
        {
          name: "media",
          title: "Media",
          visible: this.term,
        },
        {
          name: "chatGPT",
          title: "ChatGPT",
          visible: true,
        },
        {
          name: "phrases",
          title: "Phrases",
          visible: this.phrases.length > 0,
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
          name: "related",
          title: "Related",
          visible: true,
        },
        {
          name: "characters",
          title: "Characters",
          visible:
            this.$l2.han ||
            (["ja", "ko", "vi"].includes(this.$l2.code) && this.characters),
        },
      ];
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
        }” | Language Player ${this.$l2 ? this.$l2.name : ""} Dictionary`;
      }
      return `Lookup ${
        this.$l2 ? this.$l2.name : ""
      } Phrases | Language Player`;
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
  async mounted() {
    let dictionary = await this.$getDictionary();
    if (this.term && dictionary.lookupFuzzy) {
      let phrases = await dictionary.lookupFuzzy(this.term);
      this.phrases = phrases || [];
    }
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
:deep(.widget) {
  margin-bottom: 3rem;
}
</style>
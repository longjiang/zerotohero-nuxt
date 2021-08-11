<router>
  {
    path: '/:l1/:l2/phrasebook/:bookId/:phraseId/:phrase?',
    props: true
  }
</router>
<template>
  <container-query :query="query" v-model="params">
    <div :class="{ 'bg-white': !wide }">
      <SocialHead :title="title" :description="description" :image="image" />
      <div :class="{ container: !wide }">
        <div :class="{ row: !wide, 'content-panes': wide }">
          <div
            :class="{
              'p-4 content-pane-left': wide,
              'col-sm-12 pt-4': !wide,
            }"
          >
            <div class="text-center" v-if="phrasebook && phraseId">
              <router-link
                class="link-unstyled mb-4 d-block"
                :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}#${phraseId}`"
              >
                <h5>{{ phrasebook.title }}</h5>
              </router-link>
              <Paginator
                class="mb-4"
                :items="phrasebook.phrases"
                :findCurrent="findCurrent"
                :url="url"
              />
            </div>
            <div>
              <div class="text-center">
                <span v-if="phraseObj && phraseObj.pronunciation" class="mr-1">
                  {{ phraseObj.pronunciation }}
                </span>
                <Speak
                  :text="phraseObj.phrase"
                  v-if="phraseObj && phraseObj.phrase"
                />
              </div>
              <h2 class="text-center mb-0 font-weight-normal">
                <div class="d-inline-block">
                  <Annotate
                    :phonetics="!phraseObj.pronunciation"
                    :buttons="true"
                    v-if="phraseObj && phraseObj.phrase"
                    @textChanged="textChanged"
                  >
                    <span>{{ phraseObj.phrase }}</span>
                  </Annotate>
                </div>
              </h2>
              <p
                class="text-center mt-1"
                v-if="phraseObj && phraseObj[$l1.code]"
              >
                {{ phraseObj[$l1.code] }}
              </p>
              <hr v-if="word" />
              <div
                class="text-center mt-3 mb-3"
                v-if="words && words.length > 1"
              >
                <b-dropdown
                  size="sm"
                  :items="words"
                  text="Disambiguation"
                  menu-class="disambiguation-dropdown"
                >
                  <b-dropdown-item
                    v-for="w in words"
                    :key="`phrase-word-disambiguation-${w.id}`"
                    @click="word = w"
                  >
                    <b>{{ w.head }}</b>
                    <em>{{ w.definitions[0] }}</em>
                  </b-dropdown-item>
                </b-dropdown>
              </div>
              <div v-if="word" class="text-center">
                <LazyEntryHeader :entry="word" />
                <DefinitionsList
                  :key="`def-list-${word.id}`"
                  v-if="word.definitions"
                  class="mt-3"
                  :definitions="word.definitions"
                ></DefinitionsList>
              </div>
            </div>
          </div>
          <div :class="{ 'content-pane-right pl-3 pr-3': wide }">
            <div>
              <LazyDictionaryEntry
                v-if="word && phrasebook"
                :entry="word"
                :tvShow="phrasebook.tv_show"
                :exact="phrasebook.exact"
                :showHeader="false"
                :showDefinitions="false"
                :showExample="false"
              />
              <LazyPhraseComp
                v-else-if="phraseObj && phraseObj.phrase && phrasebook"
                :term="phraseObj.phrase.toLowerCase()"
                :tvShow="phrasebook.tv_show"
                :exact="phrasebook.exact"
                :showExternal="false"
                class="mt-4 mb-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import Helper from "@/lib/helper";
import WordPhotos from "@/lib/word-photos";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
  props: {
    bookId: {
      type: String,
    },
    phraseId: {
      type: String,
    },
    phrase: {
      type: String,
    },
  },
  data() {
    return {
      phrasebook: undefined,
      phraseObj: undefined,
      words: undefined,
      word: undefined,
      images: [],
      params: {},
      query: {
        wide: {
          minWidth: 991,
        },
      },
    };
  },
  async fetch() {
    this.getPhrasebookFromStore();
    if (this.phrase)
      this.images = await WordPhotos.getGoogleImages({
        term: this.phrase,
        lang: this.$l2.code,
      });
  },
  mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("phrasebooks")) {
        this.getPhrasebookFromStore();
      }
    });
  },
  created() {
    if (typeof window !== "undefined")
      window.addEventListener("resize", this.onResize);
  },
  destroyed() {
    if (typeof window !== "undefined")
      window.removeEventListener("resize", this.onResize);
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
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
    title() {
      if (this.phrase) {
        return `Learn the ${this.$l2 ? this.$l2.name : ""} Phrase “${
          this.phrase
        }” | ${this.$l2 ? this.$l2.name : ""} Zero to Hero Dictionary`;
      }
      return `Lookup ${this.$l2 ? this.$l2.name : ""} Phrases | ${
        this.$l2 ? this.$l2.name : ""
      } Zero to Hero`;
    },
    description() {
      if (this.phrase) {
        return `See how “${this.phrase}” is used in TV shows, how it forms collocations, and other examples.`;
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
    wide() {
      return this.params.wide && ["lg", "xl", "xxl"].includes(this.$mq);
    },
  },
  methods: {
    async getPhrasebookFromStore() {
      let phrasebooks =
        this.$store.state.phrasebooks.phrasebooks[this.$l2.code];
      if (!phrasebooks) return;
      let phrasebook = phrasebooks.find((pb) => pb.id === Number(this.bookId));
      if (!phrasebook) return;

      this.phrasebook = phrasebook;
      let phrase = this.phrasebook.phrases.find(
        (p) => p.id === Number(this.phraseId)
      );
      phrase.phrase = this.stripPunctuations(phrase.phrase);
      this.phraseObj = phrase;
      if (
        process.server &&
        Helper.dictionaryTooLargeAndWillCauseServerCrash(this.$l2["iso639-3"])
      )
        return;
      else await this.matchPhraseToDictionaryEntries();
    },
    async matchPhraseToDictionaryEntries() {
      this.words = await (
        await this.$getDictionary()
      ).lookupMultiple(this.phraseObj.phrase, true);
      if (this.words && this.words.length > 0) {
        for (let word of this.words) {
          if (!word.pronunciation)
            word.pronunciation = this.phraseObj.pronunciation;
        }
        this.word = this.words[0];
      }
    },
    stripPunctuations(text) {
      text = text.replace(/[.!?。！？…؟♪\*]/g, "").trim();
      text = text.replace(/\/[^\s]+/, "").trim();
      text = text.replace(/[（(].*[)）]/g, "").trim();
      return text;
    },
    findCurrent(phraseObj) {
      return phraseObj.id === Number(this.phraseId);
    },
    url(phraseObj) {
      return `/${this.$l1.code}/${this.$l2.code}/phrasebook/${
        this.phrasebook.id
      }/${phraseObj.id}/${encodeURIComponent(phraseObj.phrase)}`;
    },
    textChanged(newText) {
      this.phraseObj.phrase = newText;
    },
  },
};
</script>

<style lang="scss" scoped>
.zerotohero-wide {
  .content-pane-left {
    ::v-deep .entry-word {
      font-size: 2rem;
    }
    ::v-deep .entry-cjk {
      font-size: 1.2rem;
    }
    ::v-deep .definitions-many {
      columns: 1;
      margin-top: 1rem;
    }
    ::v-deep .disambiguation-dropdown {
      max-width: 12rem;
      overflow: hidden;
      left: 0;
      position: fixed;
      .dropdown-item {
        white-space: normal;
        padding: 0.2rem 1rem;
      }
    }
  }
}
</style>

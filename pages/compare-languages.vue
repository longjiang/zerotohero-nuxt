<router>
  {
    path: '/compare-languages/:bookId?/:en?/:wiktionary?',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div>
    <SocialHead
      title="Compare Languages on a Map | Zero to Hero Languages"
      description="See on a map how people say words like 'yes', 'no', 'thanks' on a map!"
      image="/img/thumbnail-compare-languages.jpg"
    />
    <div class="container-fluid">
      <div
        class="row bg-dark text-white pt-2 pb-2 text-left"
        style="overflow: visible; height: 56px"
      >
        <div class="col-sm-12 d-flex" style="overflow: visible">
          <div
            class="d-flex align-items-center"
            style="width: 100%; justify-content: space-between"
          >
            <router-link to="/" class="link-unstyled">
              <i class="fa fa-chevron-left mr-2"></i>
              <span class="home-text">Home</span>
            </router-link>
            <Loader
              :sticky="true"
              message="Loading common phrases"
              v-if="updating"
            />
            <div v-if="updating">
              &nbsp;
              <!-- spacer dummy -->
            </div>
            <div style="flex: 1; margin: 0 1rem; position: relative">
              <span class="title-languages" v-if="langs">
                {{ langs.length }} languages
              </span>
              <b-input-group class="input-group-ghost-dark">
                <b-form-input
                  v-model="enData"
                  :lazy="true"
                  @compositionend.prevent.stop="() => false"
                  placeholder="Try searching ‘lemon’"
                  class="input-ghost-dark"
                />
              </b-input-group>
            </div>
            <div class="paginator" v-if="phrases">
              <b-button
                :class="{
                  'paginator-previous': true,
                  transparent: currentIndex < 1,
                }"
                variant="ghost-dark"
                size="sm"
                title="Previous phrase"
                @click="currentIndex = Math.max(0, currentIndex - 1)"
              >
                <i class="fas fa-chevron-left"></i>
              </b-button>
              <span class="paginator-index ml-2 mr-2">
                {{ currentIndex + 1 }} of {{ phrases.length }}
              </span>
              <b-button
                :class="{
                  'paginator-next': true,
                  transparent: currentIndex > phrases.length - 2,
                }"
                variant="ghost-dark"
                size="sm"
                title="Next phrase"
                @click="
                  currentIndex = Math.min(phrases.length - 1, currentIndex + 1)
                "
              >
                <i class="fas fa-chevron-right"></i>
              </b-button>
              <b-button
                :class="{
                  'show-list-button': true,
                }"
                variant="ghost-dark"
                size="sm"
                title="Show or hide the list"
                @click="showList = !showList"
              >
                <i class="fas fa-list"></i>
              </b-button>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12" style="height: calc(100vh - 56px); padding: 0">
          <div class="loader-wrapper" v-if="loadingMap">
            <Loader :sticky="true" message="Loading map..." />
          </div>
          <client-only>
            <LanguageMap
              v-if="phrasesInAllLangs"
              style="height: 100%"
              ref="languageMap"
              :phrases="phrasesInAllLangs"
              @ready="onReady"
            />
          </client-only>
        </div>
      </div>
      <div
        :class="{
          'similar-phrases-panel': true,
          'd-none': !showList,
        }"
      >
        <div class="text-center mb-3">
          <b-button-group size="sm">
            <b-button
              @click="listType = 'all-phrases'"
              :variant="
                listType === 'all-phrases' ? 'secondary' : 'outline-secondary'
              "
            >
              All Phrases
            </b-button>
            <b-button
              @click="listType = 'this-phrase'"
              :variant="
                listType === 'this-phrase' ? 'secondary' : 'outline-secondary'
              "
            >
              This Phrase
            </b-button>
          </b-button-group>
        </div>
        <div
          :class="{
            'd-none': listType !== 'all-phrases',
            'all-phrases-list': true,
          }"
          v-if="phrases"
        >
          <div
            v-for="(phrase, index) in phrases"
            :key="`all-phrases-list-item-${index}`"
            @click="currentIndex = index"
            :class="{
              'all-phrases-list-item': true,
              'all-phrases-list-item-current': index === currentIndex,
            }"
          >
            <span class="all-phrases-list-item-index">{{ index + 1 }}</span>
            <span class="all-phrases-list-item-phrase">
              {{ phrase.phrase }}
            </span>
          </div>
        </div>
        <div :class="{ 'd-none': listType !== 'this-phrase' }">
          <SimilarPhrases
            class="text-center"
            v-if="phrases || en"
            :phrase="
              typeof phrases !== 'undefined'
                ? phrases[currentIndex].phrase
                : undefined
            "
            :translation="
              typeof phrases !== 'undefined'
                ? phrases[currentIndex].en
                : en
                ? en
                : undefined
            "
            :wiktionary="wiktionary === 'with-wiktionary' ? true : false"
            :key="`similar-phrases-${currentIndex}`"
            :autoLoad="true"
            @youInOtherLangs="onYouInOtherLangs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import axios from "axios";
import Papa from "papaparse";
import Helper from "@/lib/helper";

export default {
  /**
   * Include the LanguageMap this way to avoid nuxt complaining 'window is not defined'
   * https://stackoverflow.com/questions/59347414/why-is-my-client-only-component-in-nuxt-complaining-that-window-is-not-define
   */
  components: {
    LanguageMap: () => {
      if (process.client) {
        return import("../components/LanguageMap.vue");
      }
    },
  },
  props: {
    bookId: {
      default: "283", // Phrasebook id or 'adhoc'. Default to 283 (most common phrases)
    },
    en: {
      type: String,
    },
    wiktionary: {
      default: undefined, // or 'with-wiktionary'
    },
  },
  data() {
    return {
      phrasebook: undefined,
      phrases: undefined,
      currentIndex: 0,
      enData: undefined,
      updating: false,
      loadingMap: true,
      phrasesInAllLangs: undefined,
      showList: false,
      listType: "all-phrases", // or 'this-phrase'
    };
  },
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    langs() {
      if (this.phrasesInAllLangs) {
        return Helper.unique(
          this.phrasesInAllLangs.filter((p) => p.l2).map((p) => p.l2.code)
        );
      }
    },
  },
  watch: {
    currentIndex() {
      if (typeof window !== "undefined") {
        if ("URLSearchParams" in window) {
          var searchParams = new URLSearchParams(window.location.search);
          searchParams.set("i", this.currentIndex);
          window.history.replaceState("", "", `?${searchParams.toString()}`);
          this.$nuxt.$emit(
            "history",
            window.location.pathname + window.location.search
          );
        }
      }
      this.enData = this.phrases[this.currentIndex].phrase;
      this.showList = false;
    },
  },
  async mounted() {
    if (this.bookId !== "adhoc") this.loadPhraseObj();
    else this.enData = this.en;
  },
  methods: {
    onReady() {
      this.loadingMap = false;
    },
    onYouInOtherLangs(youInOtherLangs) {
      this.phrasesInAllLangs = youInOtherLangs;
    },
    async loadPhraseObj() {
      this.currentIndex = this.$route.query.i ? Number(this.$route.query.i) : 0;
      this.updating = true;
      let res = await axios.get(
        `${Config.wiki}items/phrasebook/${this.bookId}`
      );
      if (res && res.data) {
        let phrasebook = res.data.data;
        phrasebook.phrases = Papa.parse(phrasebook.phrases, {
          header: true,
        }).data.map((p, id) => {
          p.id = id;
          return p;
        });
        this.phrasebook = phrasebook;
        this.phrases = phrasebook.phrases;
        this.enData = this.phrases[0].en;
      }
      this.updating = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.similar-phrases-panel {
  background: white;
  position: fixed;
  top: calc(49px + 1rem);
  width: 20rem;
  max-width: calc(100vw - 2rem);
  height: calc(100vh - 49px - 2rem);
  right: 1rem;
  z-index: 9999;
  border-radius: 0.25rem;
  box-shadow: 0 0 5px 10px rgba(0, 0, 0, 0.2);
  overflow-y: scroll;
  padding: 1rem;
  .all-phrases-list {
    .all-phrases-list-item {
      cursor: pointer;
      padding: 0.25rem 1rem;
      border-radius: 0.25rem;
      &:hover,
      &.all-phrases-list-item-current {
        background-color: #eee;
      }
      .all-phrases-list-item-index {
        width: 2rem;
        display: inline-block;
        color: #ccc;
      }
      .all-phrases-list-item-phrase {
        font-weight: bold;
        color: #c59f94;
        font-size: 1.5em;
        font-style: italic;
      }
    }
  }
}
.title-languages {
  position: absolute;
  right: 1rem;
  top: 0.5rem;
  opacity: 0.5;
}
.title {
  line-height: 1.2;
  position: relative;
  bottom: 0.1rem;
  .title-phrase {
    font-weight: bold;
    font-size: 1.3em;
    font-style: italic;
    margin-right: 0.25rem;
  }
}
@media (max-width: 480px) {
  .title-languages {
    display: none;
  }
  .home-text {
    display: none;
  }
  .paginator-index {
    display: none;
  }
}
.loader-wrapper {
  background: rgba(0, 0, 0, 0.66);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
<router>
  {
    path: '/:l1/:l2/phrasebook/:bookId',
    props: true
  }
</router>
<template>
  <div class="container main mt-5 mb-5">
    <SocialHead :title="title" :description="description" :image="image" />

    <div class="row mb-3">
      <div class="col-sm-12" v-if="phrasebook">
        <h4 class="text-center">{{ phrasebook.title }}</h4>
        <div class="mt-2 text-center">
          ({{ phrasebook.phrases.length }} phrases)
        </div>
        <div v-html="phrasebook.description" class="mt-1 text-center" />
        <div class="text-center mt-3">
          <b-input-group prepend="Start from #">
            <b-form-input v-model.lazy="startRow"></b-form-input>
            <b-input-group-append>
              <b-button variant="primary">OK</b-button>
            </b-input-group-append>
            <a
              :href="csvHref"
              :download="`${phrasebook.title}.csv`"
              v-if="csvHref"
              class="btn btn-secondary ml-1"
            >
              <i class="fa fa-download"></i>
              CSV
            </a>
          </b-input-group>
        </div>
      </div>
    </div>
    <div class="row" v-if="phrasebook">
      <router-link
        v-for="(phraseObj, phraseIndex) in phrasebook.phrases.slice(
          Number(startRow) - 1,
          Number(startRow) + 1 + Number(numRowsVisible)
        )"
        :key="`phrasebook-phrase-${phraseObj.id}`"
        :id="`phrasebook-phrase-${phraseIndex}`"
        class="link-unstyled col-sm-12 col-md-6 col-lg-4 mb-3 mt-3"
        :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/${
          phraseObj.id
        }/${encodeURIComponent(phraseObj.phrase)}`"
        v-observe-visibility="
          phraseIndex === numRowsVisible - 1 ? visibilityChanged : false
        "
      >
        <div
          :class="{
            'rounded p-4 phrasebook-card': true,
            'text-right': $l2.direction === 'rtl',
            'phrasebook-card-current': initId && phraseIndex === initId,
          }"
        >
          <div
            :class="`${$l2.direction === 'rtl' ? 'float-left' : 'float-right'}`"
            style="color: #ccc"
          >
            #{{ phraseObj.id + 1 }}
          </div>
          <div>
            <span v-if="phraseObj && phraseObj.pronunciation">
              {{ phraseObj.pronunciation }}
            </span>
          </div>
          <Annotate :phonetics="false">
            <h4
              :data-level="
                phraseObj && phraseObj.level ? phraseObj.level : 'outside'
              "
              class="mb-0"
              v-html="phraseObj.phrase"
            />
          </Annotate>

          <div class="mb-0" v-if="phraseObj && phraseObj[$l1.code]">
            {{ phraseObj[$l1.code] }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import axios from "axios";
import Papa from "papaparse";
import WordPhotos from "@/lib/word-photos";
import Helper from "@/lib/helper";

export default {
  props: {
    bookId: {
      type: String,
    },
  },
  data() {
    return {
      phrasebook: undefined,
      numRowsVisible: 24,
      images: [],
      initId: undefined,
      csvHref: undefined,
      startRow: 1,
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
    title() {
      if (this.phrasebook) {
        return `${this.phrasebook.title} | ${
          this.$l2 ? this.$l2.name : ""
        } Zero to Hero`;
      }
      return `${this.$l2 ? this.$l2.name : ""} Phrasebook | ${
        this.$l2 ? this.$l2.name : ""
      } Zero to Hero`;
    },
    description() {
      if (this.phrasebook) {
        return `Learn ${this.phrasebook.phrases.length} ${this.$l2.name} phrases from the phrasebook “${this.phrasebook.title}”. See how each phrase is used in TV shows, movies, music, etc.`;
      }
      return `See how each phrase is used in TV shows, movies, music, etc.`;
    },
    image() {
      if (this.images.length > 0) {
        return this.images[0].src;
      } else {
        return "/img/zth-share-image.jpg";
      }
    },
  },
  async fetch() {
    let phrasebook = this.getPhrasebookFromStore();
    if (!phrasebook) {
      phrasebook = await this.loadPhrasebook(this.bookId);
    }
    this.phrasebook = phrasebook;
    if (this.phrasebook) {
      this.images = await WordPhotos.getGoogleImages({
        term: this.phrasebook.phrases[0].phrase,
        lang: this.$l2.code,
      });
      this.goToLastSeenPhrase();
    }
  },
  mounted() {
    if (this.phrasebook) {
      this.genCSV();
      this.goToLastSeenPhrase();
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("phrasebooks")) {
        this.phrasebook = this.getPhrasebookFromStore();
        this.genCSV();
        this.goToLastSeenPhrase();
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    makeTextFile(text) {
      var data = new Blob([text], { type: "text/plain" });

      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
      }

      var textFile = window.URL.createObjectURL(data);

      // returns a URL you can use as a href
      return textFile;
    },
    genCSV() {
      let csv = Papa.unparse(this.phrasebook.phrases);
      this.csvHref = this.makeTextFile(csv);
    },
    async goToLastSeenPhrase() {
      if (this.$route.hash) {
        let initId = Number(this.$route.hash.replace("#", ""));
        if (this.phrasebook.phrases[initId]) this.initId = initId;
        this.numRowsVisible = this.numRowsVisible + initId;
        await Helper.timeout(1000);
        this.scrollTo(initId);
      }
    },
    scrollTo(index) {
      let el = document.getElementById(`phrasebook-phrase-${index}`);
      if (el) {
        let offsetTop = Helper.documentOffsetTop(el);
        let elHeight = Helper.elementHeight(el);
        let viewportHeight =
          window.innerHeight || document.documentElement.clientHeight;
        let middle = offsetTop - viewportHeight / 2 + elHeight / 2;
        window.scrollTo({
          top: middle,
          left: 0,
          behavior: "smooth",
        });
      }
    },
    async loadPhrasebook(bookId) {
      let url = `${Config.wiki}items/phrasebook/${bookId}?fields=*,tv_show.*`;
      let response = await axios.get(url);
      if (response.data && response.data.data) {
        let phrasebook = response.data.data;
        phrasebook.phrases = Papa.parse(phrasebook.phrases, {
          header: true,
        }).data.map((p, id) => {
          p.id = id;
          return p;
        });
        return phrasebook;
      }
    },
    getPhrasebookFromStore() {
      let phrasebooks =
        this.$store.state.phrasebooks.phrasebooks[this.$l2.code];
      if (!phrasebooks) return;
      let phrasebook = phrasebooks.find((pb) => pb.id === Number(this.bookId));
      return phrasebook;
    },
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 24;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.phrasebook-phrase-images {
  height: 3rem;
  white-space: nowrap;
  overflow: hidden;
  ::v-deep .image-wall-image {
    height: 3rem;
    width: auto;
    object-fit: cover;
  }
}
.phrasebook-card {
  background-color: white;
  box-shadow: 0 5px 20px #5517041c !important;
  height: 100%;
}
.phrasebook-card-current {
  box-shadow: 0 0 40px rgba(255, 95, 32, 0.301) !important;
  transform: scale(1.2);
  position: relative;
  z-index: 2;
  padding: 3rem !important;
  // background-color: rgb(250, 244, 241);
}
</style>

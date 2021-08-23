<router>
  {
    path: '/:l1/:l2/phrasebook/:bookId',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <SocialHead :title="title" :description="description" :image="image" />
      <PhrasebookComp v-if="phrasebook" :phrasebook="phrasebook" :initId="initId" />
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
      images: [],
      initId: undefined
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
    if (this.phrasebook && this.phrasebook.phrases[0]) {
      this.images = await WordPhotos.getGoogleImages({
        term: this.phrasebook.phrases[0].phrase,
        lang: this.$l2.code,
      });
      this.goToLastSeenPhrase();
    }
  },
  mounted() {
    if (this.phrasebook) {
      this.goToLastSeenPhrase();
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("phrasebooks")) {
        this.phrasebook = this.getPhrasebookFromStore();
        this.goToLastSeenPhrase();
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    async goToLastSeenPhrase() {
      if (this.phrasebook && this.$route.hash) {
        let initId = Number(this.$route.hash.replace("#", ""));
        console.log('going to', initId)
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
  },
};
</script>

<style lang="scss" scoped>
</style>

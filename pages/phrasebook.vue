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
      <!-- <Sale v-if="$l2.code === 'zh'" class="mb-5" /> -->
      <div class="text-center pt-5 pb-5" v-if="loading">
        <Loader :sticky="true" message="Loading phrasebook..." />
      </div>
      <PhrasebookComp
        v-if="phrasebook && phrasebook.phrases"
        :phrasebook="phrasebook"
        :initId="initId"
      />
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";

export default {
  props: {
    bookId: {
      type: String,
    },
  },
  data() {
    return {
      initId: undefined,
      phrasebook: undefined,
      images: [],
      loading: false,
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
      this.mounted; // So that this component shows up on first load (updates $adminMode)
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
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
      if (this.phrasebook && this.phrasebook.phrases) {
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
  mounted() {
    if (typeof window !== "undefined") {
      if (window.location.hash) {
        let initId = window.location.hash.replace("#", "");
        if (initId) this.initId = initId;
      }
    }
    let phrasebook = this.getPhrasebookFromStore();
    if (phrasebook) {
      if (!phrasebook.phrases) {
        this.loadPhrases();
      } else {
        this.phrasebook = phrasebook;
      }
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("phrasebooks")) {
        if (mutation.type === "phrasebooks/LOAD_PHRASEBOOKS") {
          let phrasebook = this.getPhrasebookFromStore();
          if (phrasebook) {
            if (!phrasebook.phrases) {
              this.loadPhrases();
            } else {
              this.phrasebook = phrasebook;
            }
          }
        }
        if (mutation.type === "phrasebooks/LOAD_PHRASES") {
          let phrasebook = this.getPhrasebookFromStore();
          if (phrasebook && phrasebook.phrases) {
            this.phrasebook = phrasebook;
          }
          this.loading = false;
        }
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    loadPhrases() {
      this.loading = true;
      this.$store.dispatch("phrasebooks/loadPhrases", {
        l2: this.$l2,
        bookId: Number(this.bookId),
        adminMode: this.$adminMode,
      });
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

<router>
  {
    path: '/:l1/:l2/saved-phrases/:initId?',
    props: true
  }
</router>
<template>
  <div class="main">
    <b-modal
      id="confirm-remove-all"
      :title="$t('Remove All Saved Phrases')"
      hide-footer
    >
      <p class="my-4">
        {{ $t("Are you sure you want to remove all saved phrases?") }}
      </p>
      <div class="text-right">
        <b-button
          variant="secondary"
          @click="$bvModal.hide('confirm-remove-all')"
          >{{ $t("Cancel") }}</b-button
        >
        <b-button variant="danger" @click="confirmRemoveAll">{{
          $t("Remove All")
        }}</b-button>
      </div>
    </b-modal>
    <div class="container pb-5">
      <SocialHead :title="title" :description="description" :image="image" />
      <client-only>
        <div
          class="text-center mb-4"
          v-if="phrasebook && phrasebook.phrases.length > 0"
        >
          <b-button
            variant="danger"
            @click="$bvModal.show('confirm-remove-all')"
          >
            <i class="fa fa-trash mr-1"></i>
            {{ $t("Remove All Saved Phrases") }}
          </b-button>
        </div>
        <PhrasebookComp
          v-if="phrasebook"
          :phrasebook="phrasebook"
          :initId="initId"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import WordPhotos from "@/lib/word-photos";
import { mapState } from "vuex";

export default {
  props: {
    bookId: {
      type: String,
    },
    initId: {
      default: undefined,
    },
  },
  data() {
    return {
      phrasebook: undefined,
      images: [],
    };
  },
  computed: {
    ...mapState("savedPhrases", ["savedPhrases"]),
    title() {
      if (this.phrasebook) {
        return `${this.$t(this.phrasebook.title, {
          l2: this.$t(this.$l2.name),
        })}} | Language Player`;
      }
      return `${this.$l2 ? this.$l2.name : ""} Phrasebook | Language Player`;
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
  async mounted() {
    let phrasebook = {
      title: "Saved {l2} Phrases",
      phrases: this.savedPhrases[this.$l2.code] || [],
      l2: this.$l2,
      id: "saved",
    };
    this.phrasebook = phrasebook;
    if (
      this.phrasebook &&
      this.phrasebook.phrases &&
      this.phrasebook.phrases[0]
    ) {
      this.images = await WordPhotos.getGoogleImages({
        term: this.phrasebook.phrases[0].phrase,
        lang: this.$l2.code,
      });
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedPhrases")) {
        this.phrasebook.phrases = this.savedPhrases[this.$l2.code] || [];
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    if (this.unsubscribe) this.unsubscribe();
  },
  methods: {
    confirmRemoveAll() {
      this.removeAll();
      this.$bvModal.hide('confirm-remove-all');
    },
    removeAll() {
      this.$store.dispatch("savedPhrases/removeAll", {
        l2: this.$l2.code,
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
  },
};
</script>

<style lang="scss" scoped></style>

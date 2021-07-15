<router>
  {
    path: '/:l1/:l2/phrasebooks',
    props: true
  }
</router>
<template>
  <div class="main container" id="main">
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="row">
      <div class="col-sm-12">
        <h3 class="text-center mt-5 mb-5">{{ $l2.name }} Phrasebooks</h3>
        <div class="mb-5">
          <div
            :class="{
              'loader text-center': true,
              'd-none': phrasebooks,
            }"
            style="flex: 1"
          >
            <div class="heartbeat-loader"></div>
          </div>

          <ul
            class="list-unstyled p-0 mb-5 booklist"
            v-if="phrasebooks && phrasebooks.length > 0"
          >
            <li
              v-for="(phrasebook, phrasebookIndex) in phrasebooks"
              class="text-center mb-5 booklist-item"
              :key="`phrasebook-${phrasebookIndex}`"
            >
              <router-link
                class="link-unstyled"
                :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/`"
              >
                <div class="phrasebook-cover shadowed  mb-4">
                  <WebImages
                    class="phrasebook-cover-image"
                    :text="
                      phrasebook.title.replace(/top|phrases/gi, '') + ' drama photo'
                    "
                    :link="false"
                    :hover="false"
                    limit="1"
                  />
                  <img
                    :src="`/img/book-thumb-${phrasebook.id % 10}.jpg`"
                    class="book-thumb"
                    data-not-lazy
                  />
                </div>
                <h5 class="mt-3">{{ phrasebook.title }}</h5>
                <div style="color: #999">({{ phrasebook.phrases.length }} phrases)</div>

                <b-button
                  v-if="$adminMode"
                  class="btn btn-small bg-danger text-white mt-2 ml-0"
                  @click.stop.prevent="remove(phrasebook)"
                >
                  <i class="fa fa-trash"></i>
                </b-button>
              </router-link>
            </li>
          </ul>
          <div
            class="text-center"
            v-if="phrasebooks && phrasebooks.length === 0"
          >
            Sorry, we could not find any phrasebooks for {{ $l2.name }} 😭.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordPhotos from '@/lib/word-photos'

export default {
  data() {
    return {
      phrasebooks: undefined,
      images: []
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
    title() {
      return `${this.$l2.name} Phrasebooks with Videos | ${this.$l2.name} Zero to Hero`
    },
    description() {
      return `Learn ${this.$l2.name} phrases with multimedia phrasebooks! See how each phrase is used in TV shows, movies, music, etc.`;
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
    this.phrasebooks = this.getPhrasebooksFromStore();
    this.images = await WordPhotos.getGoogleImages({
      term: `${this.$l2.name} drama photo`,
      lang: this.$l2.code,
    });
  },
  mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("phrasebooks")) {
        this.phrasebooks = this.getPhrasebooksFromStore();
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    getPhrasebooksFromStore() {
      let phrasebooks =
        this.$store.state.phrasebooks.phrasebooks[this.$l2.code];
      return phrasebooks;
    },
    async remove(phrasebook) {
      this.$store.dispatch("phrasebooks/remove", {
        l2: this.$l2,
        phrasebook,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.phrasebook-cover {
  position: relative;
  width: 109px;
  height: 160px;
  overflow: hidden;
  margin: 0 auto;
}
.phrasebook-cover-image {
  position: absolute;
  z-index: 2;
  top: 1.5rem;
  left: 1.9rem;
  width: 4.5rem;
  overflow: hidden;
  ::v-deep .image-wall-image {
    width: 4.5rem;
    height: 3rem;
    flex: 1 !important;
  }
}
</style>
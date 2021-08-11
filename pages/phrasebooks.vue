<router>
  {
    path: '/:l1/:l2/phrasebooks',
    props: true
  }
</router>
<template>
  <div class="main">
    <container-query :query="query" v-model="params">
      <div class="container" id="main">
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
              <div
                class="text-center"
                v-if="phrasebooks && phrasebooks.length === 0"
              >
                Sorry, we could not find any phrasebooks for {{ $l2.name }} 😭.
              </div>
            </div>
          </div>
        </div>
        <div class="row pb-5" v-if="phrasebooks && phrasebooks.length > 0">
          <div
            v-for="(phrasebook, phrasebookIndex) in phrasebooks"
            :class="{
              'col-12': params.xs,
              'col-6': params.sm,
              'col-4': params.md,
              'col-3': params.lg,
            }"
            :key="`phrasebook-${phrasebookIndex}`"
            style="padding-bottom: 2rem"
          >
            <div class="media rounded shadow phrasebook">
              <router-link
                :class="`link-unstyled bg-gradient-${phrasebook.title.length
                  .toString()
                  .split('')
                  .pop()}`"
                :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/`"
                style="
                  width: 100%;
                  display: block;
                  padding: 1rem 0 0.5rem 2rem;
                  color: rgba(255, 255, 255, 0.4);
                  font-size: 5em;
                  overflow: hidden;
                "
              >
                <i class="fas fa-book"></i>
              </router-link>
              <div class="media-body">
                <router-link
                  class="link-unstyled"
                  :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/`"
                >
                  <h5 class="mt-3">{{ phrasebook.title }}</h5>
                </router-link>
                <div style="color: #999">
                  ({{ phrasebook.phrases.length }} phrases)
                </div>

                <b-button
                  v-if="$adminMode"
                  class="btn btn-small bg-danger text-white mt-2 ml-0"
                  @click.stop.prevent="remove(phrasebook)"
                >
                  <i class="fa fa-trash"></i>
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </container-query>
  </div>
</template>

<script>
import WordPhotos from "@/lib/word-photos";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      phrasebooks: undefined,
      images: [],

      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 540,
        },
        sm: {
          minWidth: 540,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
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
      return `${this.$l2.name} Phrasebooks with Videos | ${this.$l2.name} Zero to Hero`;
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
.phrasebook {
  height: 100%;
}
.phrasebook-cover-image {
  display: block;
  ::v-deep .image-wall-image {
    flex: 1 !important;
    width: 100%;
    margin-right: 0;
    margin: 0;
    max-width: 100%;
  }
}
.bg-gradient-0 {
  background-color: #faaca8;
  background-image: linear-gradient(45deg, #faaca8 0%, #ddd6f3 100%);
}

.bg-gradient-1 {
  background-color: #4158d0;
  background-image: linear-gradient(
    43deg,
    #4158d0 0%,
    #c850c0 46%,
    #ffcc70 100%
  );
}
.bg-gradient-2 {
  background-color: #0093e9;
  background-image: linear-gradient(43deg, #0093e9 0%, #80d0c7 100%);
}
.bg-gradient-3 {
  background-color: #0093e9;
  background-image: linear-gradient(43deg, #0093e9 0%, #80d0c7 100%);
}
.bg-gradient-4 {
  background-color: #0093e9;
  background-image: linear-gradient(43deg, #0093e9 0%, #80d0c7 100%);
}
.bg-gradient-5 {
  background-color: #0093e9;
  background-image: linear-gradient(43deg, #0093e9 0%, #80d0c7 100%);
}
.bg-gradient-6 {
  background-color: #ffe53b;
  background-image: linear-gradient(43deg, #ffe53b 0%, #ff2525 74%);
}
.bg-gradient-7 {
  background-color: #fbda61;
  background-image: linear-gradient(43deg, #fbda61 0%, #ff5acd 100%);
}
.bg-gradient-8 {
  background-color: #fbda61;
  background-image: linear-gradient(43deg, #fbda61 0%, #ff5acd 100%);
}
.bg-gradient-9 {
  background-color: #faaca8;
  background-image: linear-gradient(45deg, #faaca8 0%, #ddd6f3 100%);
}
</style>
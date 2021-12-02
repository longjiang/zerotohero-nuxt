<router>
  {
    path: '/:l1/:l2/phrasebooks',
    props: true
  }
</router>
<template>
  <div class="main">
    <container-query :query="query" v-model="params">
      <div class="container pb-5" id="main">
        <SocialHead :title="title" :description="description" :image="image" />
        <div class="row">
          <div class="col-sm-12">
            <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->
            <h3 class="text-center mt-5 mb-5">{{ $l2.name }} Phrasebooks</h3>
            <div class="mb-5">
              <div
                :class="{
                  'loader text-center': true,
                  'd-none': phrasebooks,
                }"
                style="flex: 1"
              >
                <Loader :sticky="true" message="Loading phrasebooks..." />
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
        <div class="row" v-if="phrasebooks && phrasebooks.length > 0">
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
            <PhrasebookCard :phrasebook="phrasebook" />
          </div>
        </div>
        <div class="row pt-4">
          <div class="col-12">
            <LazyIdenticalLanguages routeName="phrasebooks" />
          </div>
        </div>
      </div>
    </container-query>
  </div>
</template>

<script>
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      phrasebooks: undefined,
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
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
      if (this.images && this.images.length > 0) {
        return this.images[0].src;
      } else {
        return "/img/zth-share-image.jpg";
      }
    },
  },
  async fetch() {
    this.phrasebooks = this.getPhrasebooksFromStore();
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
  },
};
</script>

<style scoped lang="scss">
.phrasebook:hover {
  transform: scale(1.1) rotate(2deg);
  transition: 200ms all ease-in-out;
}
</style>
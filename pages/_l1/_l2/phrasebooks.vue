<template>
  <div class="main">
    <container-query :query="query" v-model="params">
      <div class="container pb-5" id="main">
        <SocialHead :title="title" :description="description" :image="image" />
        <div class="row">
          <div class="col-sm-12">
            <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->

            <div class="mb-5">
              <div
                :class="{
                  'loader text-center': true,
                  'd-none': phrasebooks,
                }"
                style="flex: 1"
              >
                <Loader :sticky="true" message="Loading word books..." />
              </div>
              <div
                class="text-center"
                v-if="phrasebooks && phrasebooks.length === 0"
              >
                {{ $t('Sorry, we could not find any phrasebooks for {l2}.', {l2: $t($l2.name)})}} 😭
              </div>
            </div>
          </div>
        </div>
        <h6 v-if="featuredPhrasebooks && featuredPhrasebooks.length > 0">{{ $t('Featured Word Lists') }}</h6>
        <hr v-if="featuredPhrasebooks && featuredPhrasebooks.length > 0" />
        <div
          class="row"
          v-if="featuredPhrasebooks && featuredPhrasebooks.length > 0"
        >
          <div
            v-for="(phrasebook, phrasebookIndex) in featuredPhrasebooks"
            :class="{
              'col-6': params.xs,
              'col-4': params.sm,
              'col-3': params.md,
              'col-2': params.lg,
            }"
            :key="`phrasebook-${phrasebookIndex}`"
            style="padding-bottom: 2rem"
          >
            <PhrasebookCard :phrasebook="phrasebook" />
          </div>
        </div>
        <div class="mt-4"></div>
        <h6 v-if="notFeaturedPhrasebooks && notFeaturedPhrasebooks.length > 0">{{ $t('All Word Lists') }}</h6>
        <hr v-if="notFeaturedPhrasebooks && notFeaturedPhrasebooks.length > 0"/>
        <div class="row" v-if="notFeaturedPhrasebooks && notFeaturedPhrasebooks.length > 0">
          <div
            v-for="(phrasebook, phrasebookIndex) in notFeaturedPhrasebooks"
            :class="{
              'col-6': params.xs,
              'col-4': params.sm,
              'col-3': params.md,
              'col-2': params.lg,
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
    notFeaturedPhrasebooks() {
      if (this.phrasebooks) return this.phrasebooks.filter(p => !this.featuredPhrasebooks || !this.featuredPhrasebooks.includes(p))
    },
    title() {
      return `${this.$l2.name} Phrasebooks with Videos | Language Player`;
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
    featuredPhrasebooks() {
      if (this.phrasebooks) {
        let first = this.phrasebooks.filter((pb) => {
          let title = pb.title.toLowerCase();
          if (title.includes(`${this.$l2.name} Phrases`.toLowerCase()))
            return true;
        });
        let second = this.phrasebooks.filter((pb) => {
          let title = pb.title.toLowerCase();
          if (title.includes(`${this.$l2.name} Drama Phrases`.toLowerCase()))
            return true;
          if (title.includes(`${this.$l2.name} TV Phrases`.toLowerCase()))
            return true;
          if (title.includes(`Anime`.toLowerCase()))
            return true;
        });
        let third = this.phrasebooks.filter((pb) => {
          let title = pb.title.toLowerCase();
          if (title.includes(`${this.$l2.name} News Phrases`.toLowerCase()))
            return true;
        });
        let fourth = this.phrasebooks.filter((pb) => {
          let title = pb.title.toLowerCase();
          if (title.includes(`${this.$l2.name} Song Phrases`.toLowerCase()))
            return true;
          if (title.includes(`${this.$l2.name} Music Phrases`.toLowerCase()))
            return true;
        });
        return [...first, ...second, ...third, ...fourth];
      }
    },
  },
  async created() {
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
  transform: scale(1.1);
  transition: 200ms all ease-in-out;
}
</style>
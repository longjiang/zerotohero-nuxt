<router>
  {
    path: '/:l1/:l2/phrasebook/:bookId',
    props: true
  }
</router>
<template>
  <div class="container main mt-5 mb-5">
    <div class="row">
      <div class="col-sm-12" v-if="phrasebook">
        <h4 class="text-center">{{ phrasebook.title }}</h4>
        <div v-html="phrasebook.description" class="mt-5 mb-5 text-center" />
      </div>
    </div>
    <div class="row" v-if="phrasebook">
      <router-link
        v-for="(phraseObj, phraseIndex) in phrasebook.phrases"
        :key="`phrasebook-phrase-${phraseIndex}`"
        class="link-unstyled col-sm-12 col-md-6 col-lg-4"
        :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/${
          phraseObj.id
        }/${encodeURIComponent(phraseObj.phrase)}`"
      >
        <div
          :class="{
            'rounded p-4 mt-3 mb-3 shadow': true,
            'text-right': $l2.direction === 'rtl',
          }"
        >
          <div>
            <span v-if="phraseObj && phraseObj.pronunciation">
              {{ phraseObj.pronunciation }}
            </span>
          </div>
          <h4
            :data-level="
              phraseObj && phraseObj.level ? phraseObj.level : 'outside'
            "
            class="mb-2"
          >
            {{ phraseObj.phrase }}
          </h4>
          <div class="mb-0" v-if="phraseObj && phraseObj[$l1.code]">
            {{ phraseObj[$l1.code] }}
          </div>
          <WebImages
            class="phrasebook-phrase-images mt-3"
            :text="phraseObj.phrase"
            :link="false"
            :hover="false"
            limit="3"
          />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    bookId: {
      type: String,
    },
  },
  data() {
    return {
      phrasebook: undefined,
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
  },
  async fetch() {
    this.phrasebook = this.getPhrasebookFromStore();
  },
  mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("phrasebooks")) {
        this.phrasebook = this.getPhrasebookFromStore();
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
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

<style lang="scss">
.phrasebook-phrase-images {
  height: 3rem;
  white-space: nowrap;
  overflow: hidden;
  .image-wall-image {
    height: 3rem;
    width: auto;
  }
}
</style>

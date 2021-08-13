<template>
  <div class="media rounded shadow phrasebook">
    <router-link
      :class="`phrasebook-thumb link-unstyled bg-gradient-${phrasebook.title.length
        .toString()
        .split('')
        .pop()}`"
      :to="to"
    >
      <i class="fas fa-book"></i>
    </router-link>
    <div class="media-body">
      <router-link class="link-unstyled" :to="to">
        <h5>{{ phrasebook.title }}</h5>
      </router-link>
      <div style="color: #999" v-if="phrasebook.phrases">
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
</template>

<script>
export default {
  props: {
    phrasebook: {
      type: Object,
    },
    l1: undefined,
    l2: undefined,
  },
  computed: {
    to() {
      let to;
      if (this.phrasebook.index)
        to = {
          name: "phrasebook-phrase",
          params: {
            bookId: String(this.phrasebook.id),
            phraseId: String(this.phrasebook.index),
          },
        };
      else
        to = {
          name: "phrasebook",
          params: { bookId: String(this.phrasebook.id) },
        };
      if (typeof this.l1 !== "undefined") {
        to.params.l1 = this.l1.code;
      }
      if (typeof this.l2 !== "undefined") {
        to.params.l2 = this.l2.code;
      }
      return to;
    },
    $l1() {
      if (typeof this.l1 !== "undefined") {
        return this.l1;
      } else if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
      else return this.$languages.getSmart("en");
    },
    $l2() {
      if (typeof this.l2 !== "undefined") {
        return this.l2;
      } else if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
};
</script>

<style lang="scss" scoped>
.phrasebook {
  height: 100%;
  .phrasebook-thumb {
    width: 100%;
    display: block;
    padding: 0.5rem 0 0.5rem 1rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 2em;
    overflow: hidden;
  }
  .media-body {
    background: white;
  }
}
</style>
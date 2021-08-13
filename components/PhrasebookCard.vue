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
    <div class="media-body" style="position: relative;">
      <router-link class="link-unstyled" :to="to">
        <h5>{{ phrasebook.title }}</h5>
      </router-link>
      <div style="color: #999" v-if="phrasebook.phrases">
        ({{ phrasebook.phrases.length }} phrases)
      </div>
      <client-only>
        <b-progress
          class="phrasebook-card-progress"
          v-if="progress"
          :value="progress"
          :max="1"
        ></b-progress>
      </client-only>
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
import { mapState } from "vuex";

export default {
  props: {
    phrasebook: {
      type: Object,
    },
    l1: undefined,
    l2: undefined,
    showProgress: {
      default: true,
    },
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
    historyId() {
      return `${this.$l2.code}-phrasebook-${this.phrasebook.id}`;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    ...mapState("history", ["history"]),
    progress() {
      if (this.showProgress && this.history) {
        let historyItem = this.history.find((i) => i.id === this.historyId);
        if (historyItem) {
          return historyItem.phrasebook.progress;
        }
      }
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
  .phrasebook-card-progress {
    height: 0.3rem;
    border-radius: 0.15rem;
    position: absolute;
    z-index: 9;
    width: calc(100% - 1rem);
    left: 0.5rem;
    bottom: 0.5rem;
    background-color: hsla(0deg 0% 50% / 30%);
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    ::v-deep .progress-bar {
      background-color: #fd4f1c;
    }
  }
}
</style>
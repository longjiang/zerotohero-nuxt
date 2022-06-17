<template>
  <div :class="`media rounded shadow phrasebook phrasebook-${size}`">
    <router-link
      :class="`phrasebook-thumb link-unstyled bg-gradient-${(
        phrasebook.title || ''
      ).length
        .toString()
        .split('')
        .pop()}`"
      :to="to"
    >
      <i class="fas fa-book-open phrasebook-icon"></i>
    </router-link>
    <div class="media-body" style="position: relative">
      <router-link class="link-unstyled" :to="to">
        <h5 class="phrasebook-title">{{ phrasebook.title }}</h5>
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
        class="admin-remove-button"
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
    size: {
      default: "md", // or 'lg
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
      else {
        to = {
          name: "phrasebook",
          params: { bookId: String(this.phrasebook.id) },
        };
        if (this.progress) {
          to.hash = "#" + this.historyItem.phrasebook.index;
        }
      }
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
        if (this.historyItem && this.historyItem.phrasebook) {
          return this.historyItem.phrasebook.progress;
        }
      }
    },
    historyItem() {
      if (this.history) {
        let historyItem = this.history.find((i) => i.id === this.historyId);
        return historyItem;
      }
    },
  },
  methods: {
    async remove(phrasebook) {
      this.$store.dispatch("phrasebooks/remove", {
        l2: this.$l2,
        phrasebook,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.phrasebook {
  height: 100%;
  display: flex;
  flex-direction: column;
  .phrasebook-thumb {
    width: 100%;
    padding-top: 50%;
    padding-left: 1.5rem;
    display: block;
    color: rgba(255, 255, 255, 0.4);
    overflow: hidden;
    position: relative;
    .phrasebook-icon {
      font-size: 2em;
      position: absolute;
      top: calc(50% - 0.5em);
      left: calc(50% - 0.5em);
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }
  }
  .media-body {
    background: white;
    position: relative;
    width: 100%;
    flex: 1;
    .phrasebook-title {
      color: #444;
      text-align: center;
      font-size: 1.1rem;
    }
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
  &.phrasebook-lg {
    .phrasebook-thumb {
      padding-top: 56.25%;
      text-align: center;
      .phrasebook-icon {
        left: calc(50% - 0.5em);
        padding-left: 1.5rem;
        font-size: 4em;
        padding-left: 0;
      }
    }
  }
  &:hover {
    .phrasebook-icon {
      color: rgba(255, 255, 255, 0.5);
      transition: 200ms all ease-in-out;
    }
  }
}
</style>
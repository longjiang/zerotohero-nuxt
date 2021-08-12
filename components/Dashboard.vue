<template>
  <container-query :query="query" v-model="params">
    <div>
      <div v-if="savedWords">
        <div
          :class="{
            'mt-4': true,
            'text-center': l2,
            'dashboard-saved-words-list': !l2,
            'mb-4': videosFiltered && videosFiltered.length > 0,
          }"
        >
          <router-link
            :to="`/${savedWordsLang.l2.code === 'lzh' ? 'zh' : 'en'}/${
              savedWordsLang.l2.code
            }/saved-words`"
            class="link-unstyled d-block"
            v-for="(savedWordsLang, index) in savedWordsSorted"
            :key="`dashboard-saved-words-${index}`"
          >
            <i class="fa fa-star mr-1" style="opacity: 0.5"></i>
            <span
              style="
                min-width: 1.7rem;
                display: inline-block;
                text-align: center;
              "
            >
              {{ savedWordsLang.words.length }}
            </span>
            saved word{{ savedWordsLang.words.length > 1 ? "s" : "" }}

            in
            <strong>{{ savedWordsLang.l2.name }}</strong>
          </router-link>
        </div>
      </div>
      <h5
        class="text-center"
        style="margin-top: 2rem; margin-bottom: 3rem"
        v-if="videosFiltered && videosFiltered.length > 0"
      >
        Continue watching
      </h5>
      <div class="history container">
        <div class="youtube-videos row">
          <div
            v-for="(item, itemIndex) of this.videosFiltered.slice(0, 24)"
            :key="`history-item-${itemIndex}`"
            :class="{
              'pb-4 history-item-column': true,
              'col-12': params.xs,
              'col-6': params.sm,
              'col-4': params.md,
              'col-3': params.lg,
            }"
            :set="videoL1 = $languages.getSmart(item.l1)"
            :set2="videoL2 = $languages.getSmart(item.l2)"
          >
            <div class="history-item-language-badge">
              {{ videoL2.name }}
            </div>
            <YouTubeVideoCard :video="item" skin="light" :l1="videoL1" :l2="videoL2" />
            <button
              class="
                btn btn-small
                bg-white
                text-secondary
                ml-0
                history-item-remove-btn
              "
              @click.stop.prevent="$store.dispatch('history/remove', item)"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
        <div
          class="text-center mb-3"
          v-if="videosFiltered && videosFiltered.length > 0"
        >
          <button
            class="btn bg-gray btn-small text-gray ml-0 mb-2"
            @click.stop.prevent="$store.dispatch('history/removeAll')"
          >
            Clear History
          </button>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import { mapState } from "vuex";

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
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
  props: {
    l2: undefined,
  },
  mounted() {
    this.emitHasDashboard();
    if (!this.$store.state.history.historyLoaded) {
      this.$store.commit("history/LOAD_HISTORY");
    }
  },
  computed: {
    ...mapState("history", ["history"]),
    ...mapState("savedWords", ["savedWords"]),
    savedWordsSorted() {
      let savedWordsSorted = [];
      for (let l2 in this.savedWords) {
        savedWordsSorted.push({
          l2: this.$languages.getSmart(l2),
          words: this.savedWords[l2],
        });
      }
      savedWordsSorted = savedWordsSorted
        .sort((a, b) => b.words.length - a.words.length)
        .filter((s) => s.words.length > 0);
      if (this.l2)
        savedWordsSorted = savedWordsSorted.filter(
          (s) => s.l2.code === this.l2.code
        );
      return savedWordsSorted;
    },
    videosFiltered() {
      return this.history.filter((i) => {
        if (this.l2 && i.l2 !== this.l2.code) return false;
        return i.type === "video";
      });
    },
  },
  watch: {
    history() {
      this.emitHasDashboard();
    },
    savedWords() {
      this.emitHasDashboard();
    },
  },
  methods: {
    emitHasDashboard() {
      this.$emit(
        "hasDashboard",
        (this.history && this.history.length > 0) ||
          (this.savedWordsSorted && this.savedWordsSorted.length > 0)
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@media (min-width: 768px) {
  .dashboard-saved-words-list {
    column-count: 2;
  }
}
@media (min-width: 992px) {
  .dashboard-saved-words-list {
    column-count: 3;
  }
}
.history-item-column {
  position: relative;

  .history-item-remove-btn {
    position: absolute;
    top: 0.25rem;
    right: 1.2rem;
    z-index: 9;
    border-radius: 0.2rem;
    background: rgba(0, 0, 0, 0.2) !important;
    color: rgba(255, 255, 255, 0.384) !important;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    &:hover {
      color: rgba(255, 255, 255, 0.6) !important;
      background: rgba(0, 0, 0, 0.4) !important;
    }
  }
  .history-item-language-badge {
    position: absolute;
    top: 0.25rem;
    left: 1.2rem;
    z-index: 9;
    border-radius: 0.2rem;
    background: rgba(0, 0, 0, 0.2) !important;
    color: rgba(255, 255, 255, 0.5) !important;
    font-size: 0.85em;
    padding: 0.1rem 0.3rem;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
}
</style>
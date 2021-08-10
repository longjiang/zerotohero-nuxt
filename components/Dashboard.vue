<template>
  <div>
    <div v-if="savedWords">
      <div class="dashboard-saved-words-list mt-4">
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
            style="min-width: 1.7rem; display: inline-block; text-align: center"
          >
            {{ savedWordsLang.words.length }}
          </span>
          saved word{{ savedWordsLang.words.length > 1 ? "s" : "" }}
          in
          <strong>{{ savedWordsLang.l2.name }}</strong>
        </router-link>
      </div>
    </div>
    <div class="text-center mt-4 mb-3" v-if="history && history.length > 0">
      <button
        class="btn bg-gray btn-small text-gray ml-0 mb-2"
        @click.stop.prevent="$store.dispatch('history/removeAll')"
      >
        Clear History
      </button>
    </div>
    <div class="history d-flex">
      <div
        class="history-item media shadow"
        v-for="(item, itemIndex) of this.history.slice(0, 20)"
        :key="`history-item-${itemIndex}`"
      >
        <router-link :to="item.path" class="link-unstyled">
          <div class="aspect-wrapper">
            <img
              :src="item.image"
              class="aspect history-item-image img-fluid"
              style="width: 100%"
            />
          </div>
          <div class="media-body bg-white">
            <h6 style="line-height: 1.5; font-size: 0.9em">
              {{ item.title }}
            </h6>
            <div class="btn btn-small">
              {{ $languages.getSmart(item.l2).name }}
            </div>
            <button
              class="btn btn-small bg-white text-secondary ml-0"
              @click.stop.prevent="$store.dispatch('history/remove', item)"
              style="
                position: absolute;
                top: 0.5rem;
                left: 0.5rem;
                z-index: 9;
                border-radius: 100%;
              "
            >
              <i class="fa fa-times"></i>
            </button>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
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
      return savedWordsSorted;
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
.history {
  flex-wrap: wrap;
  margin: 0 -1rem;
}

.history-item {
  min-width: 12rem;
  max-width: calc(100% - 2rem);
  flex: 1;
  margin: 1rem;
  position: relative;
  border-radius: 1rem;
  .media-body {
    height: 100%;
  }
}

@media (min-width: 768px) {
  .history-item {
    max-width: calc(50% - 2rem);
  }
}
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
</style>
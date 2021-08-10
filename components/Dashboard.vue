<template>
  <div>
    <div class="text-center mb-3">
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
    if (!this.$store.state.history.historyLoaded) {
      this.$store.commit("history/LOAD_HISTORY");
    }
  },
  computed: {
    ...mapState("history", ["history"]),
  },
  watch: {
    history() {
      console.log("updating history", this.history);
      this.$emit("historyUpdate", this.history);
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
</style>
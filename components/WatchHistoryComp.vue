<template>
  <div :class="`watch-history watch-history-${skin}`">
    <!-- Clear button -->
    <div class="row" v-if="showClear && itemsFiltered.length > 0">
      <div class="col-12 text-right">
        <button
          :class="`btn text-danger bg-none btn-md p-0 ${
            skin === 'light' ? 'text-secondary' : ''
          }`"
          @click.stop.prevent="clearHistoryWithConfirmation"
        >
          <i class="fas fa-trash mr-1"></i>
          {{ $t('Clear History') }}
        </button>
      </div>
    </div>

    <!-- Groups with date headers -->
    <template v-if="itemsFiltered.length > 0">
      <template v-for="group in groups">
        <div class="row" :key="`date-${group.date}`">
          <div class="col-sm-12" v-if="showDate">
            <p v-if="group.date === '0'" class="mb-4 mt-4">
              {{ $t('Studied earlier:') }}
            </p>
            <p class="mb-4 mt-4" v-else>
              {{ $t('Studied on {date}:', { date: $d(new Date(group.date), 'short', $l1.code) }) }}
            </p>
          </div>
        </div>
        <YouTubeVideoList
          :key="`history-group-${group.date}`"
          :videos="group.items"
          :skin="skin"
          :showProgress="true"
          :showRemove="showRemove"
          :showLanguageBadge="showLanguage"
          :showAdminToolsInAdminMode="false"
          @remove-video="removeVideo"
        />
      </template>
    </template>

    <!-- Empty state when no items -->
    <div class="w-100" v-if="itemsFiltered.length === 0">
      <div class="col-sm-12">
        <p class="text-center p-4 rounded bg-accent">
          {{ $t("You haven't studied any {l2} videos yet.", { l2: l2 ? $t(l2.name) : '' }) }}
          <br />
          <br />
          <router-link :to="{ name: DEFAULT_PAGE }" class="btn btn-success">
            <i class="fas fa-play mr-1"></i>
            {{ $t('Start Watching') }}
          </router-link>
        </p>
      </div>
    </div>

    <!-- Infinite scroll -->
    <div
      v-if="!limit && itemsFiltered?.length > visible"
      v-observe-visibility="visibilityChanged"
      class="w-100 text-center py-5"
    >
      <div class="col-sm-12">
        <Loader
          key="rec-loader"
          :sticky="true"
          :message="$t('Loading...')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { groupArrayBy, DEFAULT_PAGE, uniqueByValue } from "../lib/utils";

export default {
  props: {
    l2: undefined,
    showLanguage: {
      default: true,
    },
    skin: {
      default: "light",
    },
    limit: {
      type: Number, // For showing on the profile page
    },
    showClear: {
      type: Boolean,
      default: true,
    },
    showDate: {
      type: Boolean,
      default: true,
    },
    showRemove: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      DEFAULT_PAGE,
      visible: 50,
    };
  },
  mounted() {
    this.emitHasWatchHistory();
  },
  computed: {
    ...mapState("watchHistory", ["watchHistory"]),
    groups() {
      let history = this.itemsFiltered;

      // Sort the array
      history = history.sort((a, b) => b.date > a.date);

      // Make sure there aren't any duplicates
      history = uniqueByValue(history, "youtube_id");

      // Map through the history array
      history = history.map((i) => {
        // Create a new object from the current item
        let obj = Object.assign({}, i);
        // Convert the date to a yyyy-mm-dd
        obj.date = new Date(i.date).toISOString().slice(0, 10);
        // Return the new object
        return obj;
      });

      // If a limit is set, slice the history array to only include the first 'limit' items
      if (this.limit) history = history.slice(0, this.limit); // For showing on the profile page
      else history = history.slice(0, this.visible); // For showing on the history page with infinite scroll

      // Group the history array by date
      let groups = groupArrayBy(history, "date");

      // Map through the keys of the groups object
      groups = Object.keys(groups).map((date) => {
        // Return an object with the date and the items for that date
        return {
          date,
          items: groups[date],
        };
      });

      // Sort the groups array by date in descending order
      groups = groups.sort((a, b) => b.date > a.date);

      // Return the groups array
      return groups;
    },
    itemsFiltered() {
      if (typeof this.watchHistory !== "undefined") {
        const filterFunction = (i) => {
          if (this.l2 && Number(i.l2) !== Number(this.l2.id)) return false;
          return i.id; // Only those with ids are returned
        };
        const itemsFiltered = this.watchHistory.filter(filterFunction);
        return itemsFiltered;
      } else {
        return [];
      }
    },
  },
  watch: {
    history() {
      this.emitHasWatchHistory();
    },
  },
  methods: {
    visibilityChanged() {
      this.visible = this.visible + 50;
    },
    emitHasWatchHistory() {
      if (this.itemsFiltered && this.itemsFiltered.length > 0)
        this.$emit("hasWatchHistory");
    },
    clearHistoryWithConfirmation() {
      if (confirm("Are you sure you want to clear history?")) {
        this.$store.dispatch("watchHistory/removeAll");
      }
    },
    removeVideo(video) {
      this.$store.dispatch("watchHistory/remove", video);
    },
  },
};
</script>

<style lang="scss" scoped>
.watch-history-dark {
  .no-videos {
    background: rgba(37, 36, 44, 0.651);
  }
}
</style>

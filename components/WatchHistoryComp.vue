<template>
  <container-query :query="query" v-model="params">
    <div :class="`watch-history watch-history-${skin}`">
      <div class="history-items" v-if="itemsFiltered.length > 0">
        <div class="row" v-if="showClear">
          <div
            class="col-12 text-right"
            v-if="videosFiltered && videosFiltered.length > 0"
          >
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
        <div class="row">
          <template v-for="group in groups">
            <!-- If date is not shown, the cards will be presented in one grid. -->
            <div class="col-sm-12" v-if="showDate" :key="`date-${group.date}`">
              <p v-if="group.date === '0'" class="mb-4 mt-4">
                {{ $t('Studied earlier:') }}
              </p>
              <p class="mb-4 mt-4" v-else>
                {{ $t('Studied on {date}:', {date: $d(new Date(group.date), 'short', $l1.code)})}}
              </p>
            </div>
            <div
              v-for="(item, itemIndex) of group.items"
              :key="`history-item-${group.date}-${itemIndex}`"
              :class="{
                'pb-4 history-item-column': true,
                'col-compact': params.xs,
                'col-6': params.xs || params.sm,
                'col-4': params.md,
                'col-3': params.lg || params.xl,
              }"
              :set="(itemL1 = $languages.getSmart(item.l1))"
              :set2="(itemL2 = $languages.getSmart(item.l2))"
            >
              <div class="history-item-language-badge" v-if="showLanguage && itemL1 && itemL2">
                {{ $t(itemL2.name) }}
              </div>
              <LazyYouTubeVideoCard
                v-if="itemL1 && itemL2 && item.type === 'video'"
                :skin="skin === 'dark' ? 'dark' : 'card'"
                :video="Object.assign({}, item.video)"
                :l2="itemL2"
                :showProgress="true"
                :showPlayButton="showPlayButton"
                :showAdmin="false"
              />
              <LazyPhrasebookCard
                v-if="itemL1 && itemL2 && item.type === 'phrasebook'"
                skin="light"
                size="lg"
                :l2="itemL2"
                :phrasebook="Object.assign({}, item.phrasebook)"
                :showAdmin="false"
              />
              <button
                class="
                  btn btn-small
                  bg-white
                  text-secondary
                  ml-0
                  history-item-remove-btn
                "
                @click.stop.prevent="$store.dispatch('history/remove', item)"
                v-if="showRemove"
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
          </template>
        </div>
      </div>
      <div class="w-100" v-if="itemsFiltered.length === 0">
        <div class="col-sm-12">
          <p class="text-center p-4 rounded bg-accent">
            {{ $t("You haven't studied any {l2} videos yet.", {l2: l2 ? $t(l2.name) : ""}) }}
            <br />
            <br />
            <router-link :to="{ name: 'explore-media' }" class="btn btn-success">
              <i class="fas fa-play mr-1"></i>
              {{ $t('Start Watching') }}
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import { mapState } from "vuex";
import { groupArrayBy } from "@/lib/utils";

export default {
  components: {
    ContainerQuery,
  },
  props: {
    l2: undefined,
    showLanguage: {
      default: true,
    },
    skin: {
      default: "light",
    },
    limit: {
      type: Number,
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
    showPlayButton: {
      type: Boolean,
      default: true,
    }
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
  mounted() {
    this.emitHasWatchHistory();
  },
  computed: {
    ...mapState("history", ["history"]),
    groups() {
      let history = this.itemsFiltered
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((i) => {
          let d = String(i.date).split(" ");
          let obj = Object.assign({}, i);
          obj.date = d.length === 2 ? d[0] : 0;
          return obj;
        });
      if (this.limit) history = history.slice(0, this.limit);
      let groups = groupArrayBy(history, "date");
      groups = Object.keys(groups).map((date) => {
        return {
          date,
          items: groups[date],
        };
      });
      groups = groups.sort((a, b) => b.date.localeCompare(a.date));
      return groups
    },
    itemsFiltered() {
      if (typeof this.history !== "undefined") {
        return this.history.filter((i) => {
          if (this.l2 && i.l2 !== this.l2.code) return false;
          if (i.type === "video") return typeof i.video !== "undefined" && i.video.youtube_id;
          if (i.type === "phrasebook")
            return (
              typeof i.phrasebook !== "undefined" && i.phrasebook.id !== "saved"
            );
        });
      }
    },
    videosFiltered() {
      if (typeof this.history !== "undefined") {
        return this.history.filter((i) => {
          if (this.l2 && i.l2 !== this.l2.code) return false;
          return i.type === "video" && i.video;
        });
      }
    },
    phrasebooksFiltered() {
      if (typeof this.history !== "undefined") {
        return this.history.filter((i) => {
          if (this.l2 && i.l2 !== this.l2.code) return false;
          return i.type === "phrasebook" && i.phrasebook;
        });
      }
    },
  },
  watch: {
    history() {
      this.emitHasWatchHistory();
    },
  },
  methods: {
    emitHasWatchHistory() {
      if (this.itemsFiltered && this.itemsFiltered.length > 0)
        this.$emit("hasWatchHistory");
    },
    clearHistoryWithConfirmation() {
      if (confirm('Are you sure you want to clear history?')) {
        this.$store.dispatch('history/removeAll');
      }
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
:deep(.youtube-title),
:deep(.phrasebook-title) {
  font-size: 1rem;
  line-height: 1.33rem !important;
}

.col-compact {
  padding: 0 0.5rem;
  :deep(.media-body) {
    font-size: 0.9em;
  }
}

.history-items {
  perspective: 800px;

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
}
</style>
<template>
  <container-query :query="query" v-model="params">
    <div>
      <div class="history-items container" v-if="itemsFiltered.length > 0">
        <div class="row">
          <div
            class="col-12 text-center mb-2"
            v-if="videosFiltered && videosFiltered.length > 0"
          >
            <button
              :class="`btn btn-ghost-dark btn-sm ml-0 ${
                skin === 'light' ? 'text-secondary' : ''
              }`"
              @click.stop.prevent="$store.dispatch('history/removeAll')"
            >
              Clear History
            </button>
          </div>
        </div>
        <div v-for="group in groups" :key="group.date">
          <div class="row">
            <div class="col-sm-12">
              <h5 v-if="group.date === '0'" class="mb-4 mt-4">Earlier</h5>
              <h5 class="mb-4 mt-4" v-else>
                {{
                  new Date(group.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </h5>
            </div>
          </div>
          <div class="row">
            <div
              v-for="(item, itemIndex) of group.items"
              :key="`history-item-${itemIndex}`"
              :class="{
                'pb-4 history-item-column': true,
                'col-12': params.xs,
                'col-6': params.sm,
                'col-4': params.md,
                'col-3': params.lg,
              }"
              :set="(itemL1 = $languages.getSmart(item.l1))"
              :set2="(itemL2 = $languages.getSmart(item.l2))"
            >
              <div class="history-item-language-badge" v-if="itemL1 && itemL2">
                {{ itemL2.name }}
              </div>
              <YouTubeVideoCard
                v-if="itemL1 && itemL2 && item.type === 'video'"
                :skin="skin === 'dark' ? 'dark' : 'card'"
                :video="Object.assign({}, item.video)"
                :l1="itemL1"
                :l2="itemL2"
                :showProgress="true"
                :showPlayButton="true"
                :showAdmin="false"
              />
              <PhrasebookCard
                v-if="itemL1 && itemL2 && item.type === 'phrasebook'"
                skin="light"
                size="lg"
                :l1="itemL1"
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
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p
        v-if="itemsFiltered.length === 0"
        class="text-center p-5 mt-5 ghost-dark rounded"
        style="background: rgba(37, 36, 44, 0.651)"
      >
        You don't have anything in your history yet.
        <br />
        <br />
        <router-link :to="{ name: 'all-media' }" class="btn btn-success">
          <i class="fas fa-play mr-1"></i>
          Watch Some Videos
        </router-link>
      </p>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import { mapState } from "vuex";
import Helper from "@/lib/helper";

export default {
  components: {
    ContainerQuery,
  },
  props: {
    l2: undefined,
    skin: {
      default: "light",
    },
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
    if (!this.$store.state.history.historyLoaded) {
      this.$store.commit("history/LOAD_HISTORY");
    }
  },
  computed: {
    ...mapState("history", ["history"]),
    groups() {
      let history = this.history.map((i) => {
        let d = String(i.date).split(" ");
        let obj = Object.assign({}, i);
        obj.date = d.length === 2 ? d[0] : 0;
        return obj;
      });
      let groups = Helper.groupArrayBy(history, "date");
      groups = Object.keys(groups).map((date) => {
        return {
          date,
          items: groups[date],
        };
      });
      return groups.sort((a, b) => b.date.localeCompare(a.date));
    },
    itemsFiltered() {
      if (typeof this.history !== "undefined") {
        return this.history.filter((i) => {
          if (this.l2 && i.l2 !== this.l2.code) return false;
          if (i.type === "video") return typeof i.video !== "undefined";
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
  },
};
</script>

<style lang="scss" scoped>
::v-deep .youtube-title,
::v-deep .phrasebook-title {
  font-size: 1rem;
  line-height: 1.33rem !important;
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
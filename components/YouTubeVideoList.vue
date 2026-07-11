<template>
  <container-query :query="query" v-model="params">
    <div
      :class="{
        'youtube-video-list': true,
        'cloak-videos-without-subs': cloakVideosWithoutSubs,
      }"
    >
      <YouTubeVideoListAdminBar
        :showAdminToolsInAdminMode="showAdminToolsInAdminMode"
        :checkSavedData.sync="checkSavedData"
        :checkSavedDone="checkSavedDone"
        :generated.sync="generated"
        :hideVideosWithoutSubs.sync="hideVideosWithoutSubs"
        :hideVideosInShows.sync="hideVideosInShows"
        :showSubsEditing.sync="showSubsEditing"
        :sort.sync="sort"
        :sortOptions="sortOptions"
        :keyword.sync="keyword"
        :channels="channels"
        :checkSubs="checkSubs"
        :defaultShowTitle="defaultShowTitle"
        :filteredVideosCount="filteredVideos.length"
        :videosWithSubsCount="videosWithSubs.length"
        :savedVideosCount="savedVideos.length"
        @add-all="addAll"
        @remove-all="removeAll"
        @assign-show-to-all="assignShowToAll"
        @survey-channels="surveyChannels"
        @drop-files="(data, event) => handleDrop(data, event)"
      />

      <draggable
        @end="$emit('end', $event)"
        :class="['youtube-videos', view === 'carousel' ? 'youtube-video-carousel-row' : 'row']"
        v-if="videos"
        :disabled="!dragEnabled"
      >
        <div
          v-for="(video, videoIndex) in filteredVideos"
          :class="colClasses(video, videoIndex)"
          :key="`youtube-video-wrapper-${video.youtube_id}-${videoIndex}`"
        >
          <LazyFeedItem v-if="view === 'feed'" :video="video" :skin="$skin" />
          <LazyYouTubeVideoCard
            v-else
            ref="youTubeVideoCard"
            :class="{ 'checking-subs': checkSubs && subsChecked < videoIndex }"
            @newShow="newShow"
            @hasSubs="onHasSubs"
            @unavailable="unavailableVideos.push(video)"
            v-bind="{
              skin: $skin,
              video,
              generated,
              checkSubs: checkSubsData,
              checkSaved: checkSavedData,
              view,
              showSubsEditing,
              showBadges,
              showDate,
              showProgress,
              showLanguage: multilingual,
              playlistId: playlistId ? String(playlistId) : getAdHocPlaylistId(video.id),
              sort,
            }"
          >
            <template v-slot:footer>
              <slot name="footer" :video="video"></slot>
            </template>
          </LazyYouTubeVideoCard>
          <div
            v-if="showLanguageBadge && video.l2 && $languages.getSmart(video.l2)"
            class="youtube-video-language-badge"
          >
            {{ $t($languages.getSmart(video.l2).name) }}
          </div>
          <button
            v-if="showRemove"
            class="btn btn-small youtube-video-remove-btn"
            @click.stop.prevent="$emit('remove-video', video)"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>
      </draggable>

      <div v-if="videos && filteredVideos.length === 0" class="w-100">
        <slot name="empty">
          <p class="text-center p-4 rounded bg-accent">
            {{ $t("No videos found.") }}
          </p>
        </slot>
      </div>
    </div>
  </container-query>
</template>

<script>
import { uniqueByValue } from "../lib/utils";
import { ContainerQuery } from "vue-container-query";
import draggable from "vuedraggable";
import youtubeVideoListAdminMixin from "../lib/mixins/youtubeVideoListAdminMixin";
import YouTubeVideoListAdminBar from "./YouTubeVideoListAdminBar.vue";

export default {
  components: {
    draggable,
    ContainerQuery,
    YouTubeVideoListAdminBar,
  },
  mixins: [youtubeVideoListAdminMixin],
  props: {
    dragEnabled: {
      default: false,
    },
    videos: {
      type: Array,
    },
    view: {
      type: String,
      default: "grid", // Can be 'grid', 'list', 'feed', or 'carousel'
    },
    singleColumn: {
      type: Boolean,
      default: false,
    },
    showBadges: {
      default: false,
    },
    showDate: {
      default: false,
    },
    skin: {
      default: null,
    },
    showProgress: {
      default: false,
    },
    multilingual: {
      default: false,
    },
    showRemove: {
      type: Boolean,
      default: false,
    },
    showLanguageBadge: {
      type: Boolean,
      default: false,
    },
    playlistId: {
      type: String,
    },
    limit: {
      type: Number,
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

  computed: {
    filteredVideos() {
      if (!this.videos) return [];
      let keyword = this.keyword ? this.keyword.toLowerCase() : undefined;
      let filteredVideos = this.videos.filter((video) => {
        if (this.unavailableVideos.includes(video)) return false;
        if (this.hideVideosWithoutSubs && !video.hasSubs) return false;
        if (
          this.hideVideosInShows &&
          video.id &&
          ((video.tv_show && video.tv_show.id) || (video.talk && video.talk.id))
        )
          return false;
        if (keyword && !video.title.toLowerCase().includes(keyword))
          return false;
        return true;
      });
      if (!this.$adminMode)
        filteredVideos = uniqueByValue(filteredVideos, "youtube_id");
      if (this.sort) {
        filteredVideos = filteredVideos.sort((a, b) => {
          if (this.sort === "title") {
            return a.title.localeCompare(b.title);
          } else if (this.sort === "-date") {
            return new Date(b.date) - new Date(a.date);
          } else if (this.sort === "-views") {
            return b.views - a.views;
          } else if (this.sort === "-likes") {
            return b.likes - a.likes;
          } else if (this.sort === "-comments") {
            return b.comments - a.comments;
          }
        });
      }
      if (this.limit) filteredVideos = filteredVideos.slice(0, this.limit);
      return filteredVideos;
    },
  },

  methods: {
    colClasses(video, videoIndex) {
      let classes = { "pb-3": true, "col-no-subs": !video.hasSubs };
      
      if (this.view === "list" || this.singleColumn) {
        classes["col-sm-12"] = true;
      } else if (this.view === "grid" || this.view === "carousel") {
        classes = Object.assign(
          {
            "col-compact": this.params.xs,
            "col-6": this.params.xs || this.params.sm,
            "col-4": this.params.md,
            "col-3": this.params.lg || this.params.xl,
          },
          classes
        );
        
        // Append our custom carousel class if mode is active
        if (this.view === "carousel") {
          classes["youtube-video-carousel-item"] = true;
        }
      } else if (this.view === "feed") {
        classes = Object.assign(
          {
            "col-12": this.params.xs || this.params.sm || this.params.md,
            "col-6": this.params.lg || this.params.xl,
          },
          classes
        );
      }
      return classes;
    },
    newShow(show) {
      this.$emit("newShow", show);
    },
  },
};
</script>

<style lang="scss" scoped>
.col-compact {
  padding: 0.5rem;
  :deep(.media-body) {
    font-size: 0.9em;
  }
}

.cloak-videos-without-subs {
  .col-no-subs {
    display: none;
  }
}

.checking-subs {
  opacity: 0.2;
}

.youtube-video-remove-btn {
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

.youtube-video-language-badge {
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

/* --- Carousel Mode Specific Styles --- */
.youtube-video-carousel-row {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  
  // Using CSS scroll snapping for that snappy native-app slider feel
  scroll-snap-type: x mandatory; 
  
  // Account for bootstrap column spacing offsets
  margin-right: -15px;
  margin-left: -15px;
  padding-right: 15px;
  padding-left: 15px;
  padding-bottom: 0.5rem; /* Space for hidden scrollbar area */

  /* Hide scrollbars elegantly while preserving operational scroll functionality */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.youtube-video-carousel-item {
  flex: 0 0 auto; // Force elements to stay wide instead of shrinking down to fit the window
  scroll-snap-align: start;
  position: relative; // Protects badge layout boundaries
}
</style>
<template>
  <client-only>
    <div
      v-if="$adminMode && showAdminToolsInAdminMode"
      class="mb-4 bg-accent rounded p-3 w-100"
    >
      <div>
        <b-button
          class="mt-1 mb-1"
          v-if="!checkSavedData"
          size="small"
          @click="$emit('update:checkSavedData', true)"
        >
          <i class="fas fa-question mr-2"></i>
          Check Saved
        </b-button>
        <b-button
          class="mt-1 mb-1"
          v-if="checkSavedData && checkSavedDone"
          size="small"
          @click="$emit('update:checkSavedData', false)"
        >
          <i class="fas fa-question mr-2"></i>
          Uncheck Saved
        </b-button>
        <b-button
          class="mt-1 mb-1"
          variant="secondary"
          v-if="
            checkSavedData &&
            checkSavedDone &&
            (generated ? filteredVideosCount : videosWithSubsCount) -
              savedVideosCount >
              0
          "
          size="small"
          @click="$emit('add-all')"
        >
          <i class="fas fa-plus mr-2"></i>
          Add All
          {{
            (generated ? filteredVideosCount : videosWithSubsCount) -
            savedVideosCount
          }}
        </b-button>
        <b-button size="small" @click="$emit('survey-channels')">
          Survey Channels
        </b-button>
        <b-button
          v-if="checkSavedData && checkSavedDone"
          class="mt-1 mb-1"
          @click="$emit('remove-all')"
          size="small"
        >
          <i class="fas fa-trash mr-2"></i>
          Remove All
        </b-button>
        <br />
      </div>
      <div v-if="checkSavedData && checkSavedDone">
        <AssignShow
          size="small"
          @assignShow="(show, type) => $emit('assign-show-to-all', show, type)"
          :defaultSelection="defaultShowTitle"
          type="tv-shows"
        />
        <AssignShow
          size="small"
          @assignShow="(show, type) => $emit('assign-show-to-all', show, type)"
          :defaultSelection="defaultShowTitle"
          type="talks"
        />
        <drop
          @drop="(data, event) => $emit('drop-files', data, event)"
          :class="{
            'subs-drop text-secondary rounded d-inline-block text-center mt-1': true,
            over: over,
            drop: true,
          }"
          :key="`drop-${_uid}`"
          @dragover="over = true"
          @dragleave="over = false"
          style="font-size: 0.9em"
        >
          Drop SRT files here to bulk add subs ...
        </drop>
      </div>
      <div class="mt-1">
        {{ filteredVideosCount }} videos
        <span v-if="checkSubs">, {{ filteredVideosCount }} checked</span>
        <span v-if="checkSubs">
          , {{ videosWithSubsCount }} have subs
        </span>
        <span v-if="checkSavedData">, {{ savedVideosCount }} added</span>
      </div>
      <div class="mt-1" style="font-size: 0.9em">
        <b-form-checkbox
          class="mr-1 d-inline-block"
          :checked="hideVideosWithoutSubs"
          @change="$emit('update:hideVideosWithoutSubs', $event)"
        >
          Hide Videos without Subs
        </b-form-checkbox>
        <b-form-checkbox
          class="mr-1 d-inline-block"
          :checked="hideVideosInShows"
          @change="$emit('update:hideVideosInShows', $event)"
        >
          Hide Videos in Shows
        </b-form-checkbox>
        <b-form-checkbox
          class="mr-1 d-inline-block"
          :checked="showSubsEditing"
          @change="$emit('update:showSubsEditing', $event)"
        >
          Show Subs Editing
        </b-form-checkbox>
        <b-form-checkbox
          class="mr-1 d-inline-block"
          :checked="generated"
          @change="$emit('update:generated', $event)"
        >
          Use Auto-Generated Subs
        </b-form-checkbox>
        <b-form-select
          :value="sort"
          :options="sortOptions"
          class="d-inline-block"
          size="sm"
          style="width: 150px"
          @change="$emit('update:sort', $event)"
        />
      </div>
      <div class="mt-1">
        <b-form-input
          type="text"
          :value="keyword"
          lazy
          placeholder="Filter"
          size="small"
          @update="$emit('update:keyword', $event)"
        />
      </div>
      <div v-if="channels">
        <h6 class="mt-2">Channels with the most videos below:</h6>
        <div
          v-for="(channel, index) in channels"
          :key="`video-list-unique-by-channel-${index}`"
        >
          {{ channel.videos.length }} Videos:
          <router-link
            :to="{
              name: 'l1-l2-video-view-type',
              params: {
                type: 'youtube',
                youtube_id: channel.videos[0].youtube_id,
              },
            }"
          >
            {{
              channel.videos[0].title
                ? channel.videos[0].title.slice(0, 30)
                : "(Untitled)"
            }}
          </router-link>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script>
import { Drop } from "vue-drag-drop";

export default {
  components: {
    Drop,
  },
  props: {
    showAdminToolsInAdminMode: {
      default: true,
    },
    checkSavedData: {
      type: Boolean,
      default: false,
    },
    checkSavedDone: {
      type: Boolean,
      default: false,
    },
    generated: {
      type: Boolean,
      default: false,
    },
    hideVideosWithoutSubs: {
      type: Boolean,
      default: false,
    },
    hideVideosInShows: {
      type: Boolean,
      default: false,
    },
    showSubsEditing: {
      type: Boolean,
      default: false,
    },
    sort: {
      type: String,
    },
    sortOptions: {
      type: Array,
      default: () => [],
    },
    keyword: {
      type: String,
    },
    channels: {
      type: Array,
    },
    checkSubs: {
      type: Boolean,
      default: false,
    },
    defaultShowTitle: {
      type: String,
    },
    filteredVideosCount: {
      type: Number,
      default: 0,
    },
    videosWithSubsCount: {
      type: Number,
      default: 0,
    },
    savedVideosCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      over: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.subs-drop {
  border: 1px #666 dashed;
  padding: 0.2rem 0.6rem;
}
</style>

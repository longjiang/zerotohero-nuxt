<template>
  <div :class="{ 'compare-search-subs': true, fullscreen }">
    <div
      v-if="
        !checkingA && !checkingB && hitsA.length === 0 && hitsB.length === 0
      "
      class="text-center mb-3 mt-3"
    >
      No hits.
    </div>
    <div
      :class="{
        'search-subs text-center': true,
        'd-none': checkingA || checkingB,
      }"
      v-if="this.$refs.searchSubsA && this.$refs.searchSubsB"
    >
      <b-button
        size="sm"
        :class="{
          tab: true,
          'btn-gray text-secondary': hitAB !== 'A' && skin === 'light',
          'btn-ghost-dark': hitAB !== 'A' && skin === 'dark',
        }"
        variant="none"
        :data-bg-level="hitAB === 'A' ? levelA || 'outside' : false"
        @click="hitAB = 'A'"
      >
        {{ termsA[0] }}
      </b-button>
      <b-button
        size="sm"
        :variant="skin === 'light' ? 'gray' : 'ghost-dark'"
        :class="{ 'border-0 mr-1': true, 'text-secondary': skin === 'light' }"
        @click="showPlaylistModal"
      >
        <i class="fa fa-stream" />
        Compare Hits
      </b-button>
      <b-button
        :class="{
          tab: true,
          'btn-gray text-secondary': hitAB !== 'B' && skin === 'light',
          'btn-ghost-dark': hitAB !== 'B' && skin === 'dark',
        }"
        variant="none"
        size="sm"
        :data-bg-level="hitAB === 'B' ? levelB || 'outside' : false"
        @click="hitAB = 'B'"
      >
        {{ termsB[0] }}
      </b-button>
      <div class="float-right mr-1">
        <b-button
          class="search-subs-fullscreen border-0 ml-1"
          :variant="skin === 'dark' ? 'ghost-dark' : 'gray'"
          size="sm"
          @click="toggleFullscreen"
          v-if="!fullscreen"
        >
          <i class="fas fa-expand"></i>
        </b-button>
        <b-button
          class="search-subs-close border-0 ml-1 mr-1"
          variant="dark"
          size="sm"
          @click="toggleFullscreen"
          v-if="fullscreen"
        >
          <i class="fas fa-times" />
        </b-button>
      </div>
      <div
        style="height: 0.5rem"
        :data-bg-level="
          hitAB === 'A' ? levelA || 'outside' : levelB || 'outside'
        "
      ></div>
      <b-modal
        ref="playlist-modal"
        centered
        hide-footer
        title="Video Caption Search Results"
        body-class="playlist-modal-wrapper"
        size="xl"
      >
        <div class="playlist-modal">
          <div class="text-center pt-3 pl-3 pr-3">
            <button
              :class="{
                btn: true,
                'btn-small': true,
                'bg-dark': sort === 'left',
                'text-white': sort === 'left',
              }"
              @click.stop.prevent="sort = 'left'"
            >
              Sort Left
            </button>
            <button
              :class="{
                btn: true,
                'btn-small': true,
                'bg-dark': sort === 'right',
                'text-white': sort === 'right',
              }"
              @click.stop.prevent="sort = 'right'"
            >
              Sort Right
            </button>
          </div>
          <template v-for="group in groups[sort]">
            <div v-if="group" :key="`compare-subs-grouping-${sort}-${group.c}`">
              <hr :key="`comp-subs-grouping-${group.c}-divider`" v-if="group.hits.A.length > 0 && group.hits.B.length > 0"/>
              <div
                v-for="index in Math.max(
                  group.hits.A.length,
                  group.hits.B.length
                )"
                class="playlist-modal-item"
                :key="`comp-subs-grouping-${group.c}-${index}`"
                @click="
                  group.hits.A[index - 1]
                    ? goToHit('A', group.hits.A[index - 1])
                    : group.hits.B[index - 1]
                    ? goToHit('B', group.hits.B[index - 1])
                    : false
                "
              >
                <div style="display: flex">
                  <template v-for="ab in ['A', 'B']">
                    <div
                      :style="`flex: 1; margin-right: ${
                        ab === 'A' ? '1rem' : 0
                      }; display: flex;`"
                      v-if="group.hits[ab][index - 1]"
                      @click.stop.prevent="
                        goToHit(
                          ab,
                          sort === 'right'
                            ? group.hits[ab][index - 1]
                            : group.hits[ab][index - 1]
                        )
                      "
                      :set="(hit = group.hits[ab][index - 1])"
                      :key="`comp-subs-grouping-${group.c}-${index}-${ab}-1`"
                    >
                      <div>
                        <img
                          class="hit-thumb"
                          style="margin-top: 0.2rem"
                          v-if="ab === 'A' && hit"
                          :src="`https://img.youtube.com/vi/${hit.video.youtube_id}/hqdefault.jpg`"
                          :alt="hit.video.title"
                        />
                      </div>
                      <div style="flex: 1">
                        <span
                          :key="`dropdown-line-${index}-annotate-${
                            hit.video.subs_l2[Number(hit.lineIndex)].line
                          }`"
                        >
                          <span
                            v-if="sort === 'left' && hit.lineIndex > 0"
                            v-html="
                              hit.video.subs_l2[Number(hit.lineIndex) - 1].line
                            "
                            style="margin-right: 0.5em; opacity: 0.5"
                          />
                          <span
                            v-html="
                              highlightMultiple(
                                hit.video.subs_l2[Number(hit.lineIndex)].line,
                                ab === 'A'
                                  ? termsA.map((term) => term)
                                  : termsB.map((term) => term),
                                ab === 'A' ? levelA : levelB
                              )
                            "
                          />
                          <span
                            v-if="
                              sort === 'right' &&
                              hit.lineIndex < hit.video.subs_l2.length - 1
                            "
                            v-html="
                              hit.video.subs_l2[Number(hit.lineIndex) + 1].line
                            "
                            style="margin-left: 0.5em; opacity: 0.5"
                          ></span>
                        </span>
                      </div>
                      <div style="margin-left: 1rem">
                        <img
                          class="hit-thumb"
                          style="margin-top: 0.2rem"
                          v-if="ab === 'B' && hit"
                          :src="`https://img.youtube.com/vi/${hit.video.youtube_id}/hqdefault.jpg`"
                          :alt="hit.video.title"
                        />
                      </div>
                    </div>
                    <div
                      v-if="!group.hits[ab][index - 1]"
                      style="flex: 1; margin-right: 1rem"
                      :key="`comp-subs-grouping-${group.c}-${index}-${ab}-2`"
                    >
                      &nbsp;
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
      </b-modal>
    </div>
    <SearchSubsComp
      :class="{ 'd-none': hitAB === 'B' }"
      ref="searchSubsA"
      :level="levelA"
      :terms="termsA"
      :key="`subs-search-a-${termsA[0]}`"
      @loaded="searchSubsALoaded"
      :keyboard="false"
      :fullscreenToggle="false"
      :skin="skin"
    />
    <SearchSubsComp
      :class="{ 'd-none': hitAB === 'A' }"
      ref="searchSubsB"
      :level="levelB"
      :terms="termsB"
      :key="`subs-search-b-${termsB[0]}`"
      @loaded="searchSubsBLoaded"
      :keyboard="false"
      :fullscreenToggle="false"
      :skin="skin"
    />
  </div>
</template>

<script>
import SearchSubsComp from "@/components/SearchSubsComp";
import Helper from "@/lib/helper";

export default {
  components: {
    SearchSubsComp,
  },
  props: {
    termsA: {
      type: Array,
    },
    levelA: {
      type: String,
    },
    termsB: {
      type: Array,
    },
    levelB: {
      type: String,
    },
    keyboard: {
      default: true,
    },
    skin: {
      default: "light",
    },
  },
  data() {
    return {
      hitAB: "A",
      checkingA: true,
      checkingB: true,
      sort: "right",
      fullscreen: false,
    };
  },
  destroyed() {
    if (this.keyboard) this.unbindKeys();
  },
  unmounted() {
    if (this.keyboard) this.unbindKeys();
  },
  deactivated() {
    if (this.keyboard) this.unbindKeys();
  },
  updated() {
    if (this.keyboard) this.unbindKeys();
    if (this.keyboard) this.bindKeys();
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    groups() {
      return {
        left: this.mergeGroups({
          A: this.$refs.searchSubsA.groupsLeft,
          B: this.$refs.searchSubsB.groupsLeft,
        }),
        right: this.mergeGroups({
          A: this.$refs.searchSubsA.groupsRight,
          B: this.$refs.searchSubsB.groupsRight,
        }),
      };
    },
  },
  watch: {
    hitAB() {
      this.$refs.searchSubsA.pauseYouTube(),
        this.$refs.searchSubsB.pauseYouTube(),
        this.unbindKeys();
      this.bindKeys();
    },
  },
  methods: {
    highlightMultiple(...args) {
      return Helper.highlightMultiple(...args)
    },
    showPlaylistModal() {
      this.$refs["playlist-modal"].show();
    },
    mergeGroups(groups) {
      let merged = [];
      for (let letter of ["A", "B"]) {
        for (let key in groups[letter]) {
          let hits = groups[letter][key];
          let group = merged.find((g) => g.c === key);
          if (!group) {
            group = {
              c: key,
              hits: {
                A: [],
                B: [],
              },
            };
            merged.push(group);
          }
          group.hits[letter] = hits;
        }
      }
      merged = merged.sort(
        (a, b) =>
          b.hits.A.length +
          b.hits.B.length -
          (a.hits.A.length + a.hits.B.length)
      );
      let zthSavedIndex = merged.findIndex((g) => g.c === "zthSaved");
      let zthSaved = merged[zthSavedIndex];
      merged.splice(zthSavedIndex, 1);
      merged = [zthSaved].concat(merged);
      return merged;
    },
    bindKeys() {
      document.addEventListener("keydown", this.keydown);
      if (this.$refs.searchSubsA) this.$refs.searchSubsA.unbindKeys();
      if (this.$refs.searchSubsB) this.$refs.searchSubsB.unbindKeys();
      if (this.hitAB === "A") this.$refs.searchSubsA.bindKeys();
      if (this.hitAB === "B") this.$refs.searchSubsB.bindKeys();
    },
    unbindKeys() {
      if (this.$refs.searchSubsA) this.$refs.searchSubsA.unbindKeys();
      if (this.$refs.searchSubsB) this.$refs.searchSubsB.unbindKeys();
      document.removeEventListener("keydown", this.keydown);
    },
    keydown(e) {
      if (
        !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
        !e.metaKey
      ) {
        // f = 70
        if (e.keyCode == 70) {
          this.toggleFullscreen();
          e.preventDefault();
          return false;
        }
        // escape = 27
        if (e.keyCode == 27) {
          this.fullscreen = false;
          e.preventDefault();
          return false;
        }
      }
    },
    toggleFullscreen() {
      if (this.hitsA.length > 0 || this.hitsB.length > 0)
        this.fullscreen = !this.fullscreen;
    },
    goToHit(hitAB, hit) {
      this.hitAB = hitAB;
      if (hitAB === "A") this.$refs.searchSubsA.goToHit(hit);
      if (hitAB === "B") this.$refs.searchSubsB.goToHit(hit);
      this.$refs["playlist-modal"].hide();
      setTimeout(() => {
        document.activeElement.blur();
      }, 100);
    },
    searchSubsALoaded() {
      this.hitsA = this.$refs.searchSubsA.hits;
      this.checkingA = false;
    },
    searchSubsBLoaded() {
      this.hitsB = this.$refs.searchSubsB.hits;
      this.checkingB = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.compare-search-subs.fullscreen :deep(.search-subs) .video-area {
  background: black;
}
.compare-search-subs.fullscreen {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 10;
  overflow: auto;
  margin-top: 0 !important;
}
.compare-search-subs.fullscreen :deep(.youtube-video-wrapper) {
  max-width: calc((100vh - 9rem) * 16 / 9);
  margin: 0 auto;
}
</style>
<template>
  <div :class="{ 'search-subs pb-3': true, fullscreen }">
    <div
      class="text-center pt-2 pb-2"
      :style="fullscreenToggle && !$adminMode ? 'padding-left: 2.5rem' : ''"
    >
      <span v-if="hits.length > 0">
        <div :class="{ 'float-left ml-1': true, 'd-none': !$adminMode }">
          <b-button variant="danger" size="sm" @click="remove">
            <i class="fas fa-trash"></i>
          </b-button>
        </div>
        <b-button
          size="sm"
          variant="gray"
          :disabled="hitIndex === 0"
          @click="prevHit"
          :class="{ 'ml-1 mr-1': true, disabled: hitIndex === 0 }"
        >
          <i class="fas fa-step-backward" />
        </b-button>
        <b-button
          variant="gray"
          size="sm"
          v-if="!showFilter"
          @click="showFilter = true"
        >
          <i class="fas fa-filter" />
        </b-button>
        <b-input
          type="text"
          size="sm"
          class="d-inline-block mr-1 ml-1"
          v-if="!checking && (hits.length > 0 || regex) && showFilter"
          v-model.lazy="regex"
          :style="`width: 6em`"
          placeholder="Filter..."
          @blur="showFilter = false"
        />
        <span
          v-if="groupsRight['zthSaved'].length > 0"
          class="ml-0 mr-0"
          style="background: none"
        >
          {{ groupsRight["zthSaved"].length }}
        </span>
        <SmallStar
          v-if="groupsRight['zthSaved'].length > 0"
          :item="currentHit"
          :saved="(hit) => hit.saved"
          :save="saveHit"
          :remove="removeSavedHit"
          class="ml-0 mr-0"
        />
        <span
          class="ml-2 mr-2 d-inline-block"
          style="margin-bottom: -0.52rem; overflow: hidden"
        >
          {{ hitIndex + 1 }} of {{ hits.length }}
        </span>
        <b-dropdown
          class="playlist-dropdown"
          toggle-class="btn btn-gray btn-sm border-gray playlist-dropdown-toggle ml-1 mr-1"
          boundary="viewport"
          no-caret
        >
          <template #button-content><i class="fa fa-stream" /></template>
          <b-dropdown-item>
            <button
              :class="{
                'btn btn-small': true,
                'bg-dark': sort === 'length',
                'text-white': sort === 'length',
              }"
              @click.stop.prevent="sort = 'length'"
            >
              Sort By Length
            </button>
            <button
              :class="{
                'btn btn-small': true,
                'bg-dark': sort === 'left',
                'text-white': sort === 'left',
              }"
              @click.stop.prevent="sort = 'left'"
            >
              Sort Left
            </button>
            <button
              :class="{
                'btn btn-small': true,
                'bg-dark': sort === 'right',
                'text-white': sort === 'right',
              }"
              @click.stop.prevent="sort = 'right'"
            >
              Sort Right
            </button>
          </b-dropdown-item>
          <template v-for="c in get(`groupIndex${ucFirst(sort)}`)">
            <div
              :set="(theseHits = get(`groups${ucFirst(sort)}`)[c])"
              :key="`comp-subs-grouping-${sort}-${c}`"
            >
              <b-dropdown-divider :key="`comp-subs-grouping-${c}-divider`" />
              <template v-for="(hit, index) in theseHits">
                <b-dropdown-item
                  @click.stop="goToHit(hit)"
                  :class="{ current: hit === currentHit }"
                  :key="`dropdown-line-${c}-${index}`"
                >
                  <SmallStar
                    :item="hit"
                    :saved="(hit) => hit.saved"
                    :save="saveHit"
                    :remove="removeSavedHit"
                  />
                  <img
                    class="hit-thumb"
                    :src="`//img.youtube.com/vi/${hit.video.youtube_id}/hqdefault.jpg`"
                    :alt="hit.video.title"
                    v-lazy-load
                  />
                  <span
                    :key="`dropdown-line-${index}-annotate-${
                      hit.video.subs_l2[Number(hit.lineIndex)].line
                    }`"
                  >
                    <span>
                      <span
                        v-if="
                          ['left', 'length'].includes(sort) && hit.lineIndex > 0
                        "
                        v-html="
                          hit.video.subs_l2[Number(hit.lineIndex) - 1].line
                        "
                        style="margin-right: 0.5em; opacity: 0.5"
                      ></span>
                      <span
                        v-html="
                          highlightMultiple(
                            hit.video.subs_l2[Number(hit.lineIndex)].line,
                            terms.map((term) => term),
                            level
                          )
                        "
                      ></span>
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
                  </span>
                </b-dropdown-item>
              </template>
            </div>
          </template>
        </b-dropdown>
        <router-link
          v-if="currentHit"
          :to="`/${$l1.code}/${$l2.code}/youtube/view/${
            currentHit.video.youtube_id
          }/?t=${currentHit.video.subs_l2[currentHit.lineIndex].starttime}`"
          class="btn btn-gray btn-sm mr-1 ml-1"
        >
          <i class="fa fa-window-restore" />
        </router-link>
        <b-button
          variant="gray"
          size="sm"
          :disabled="hitIndex >= hits.length - 1"
          @click="nextHit"
          :class="{
            'ml-1 mr-1': true,
            disabled: hitIndex >= hits.length - 1,
          }"
        >
          <i class="fas fa-step-forward" />
        </b-button>
        <div class="float-right mr-1">
          <b-button
            variant="gray"
            class="search-subs-fullscreen"
            size="sm"
            @click="toggleFullscreen"
            v-if="
              !checking &&
              !fullscreen &&
              fullscreenToggle &&
              (hits.length > 0 || regex)
            "
          >
            <i class="fas fa-expand"></i>
          </b-button>
          <b-button
            variant="gray"
            size="sm"
            class="btn search-subs-close"
            @click="toggleFullscreen"
            v-if="!checking && fullscreen && fullscreenToggle"
          >
            <i class="fas fa-times" />
          </b-button>
        </div>
      </span>
    </div>
    <div
      :class="{ 'loader text-center mt-4': true, 'd-none': !checking }"
      style="flex: 1"
    >
      <div class="heartbeat-loader"></div>
      <div class="text-center mt-4 mb-4">
        Searching through video captions...
      </div>
    </div>
    <div class="text-center mt-3 mb-3" v-if="!checking && hits.length === 0">
      <p>Sorry, no hits found.</p>
      <p v-if="$store.state.settings.subsSearchLimit">Try turning off ‘Limit “this word in TV Shows” search result (faster)’ in <router-link :to="{name: 'settings'}">Settings</router-link></p>
      <b-button
        v-if="$adminMode"
        size="sm"
        variant="primary"
        @click="checkHits"
      >
        <i class="fa fa-sync-alt"></i>
        Refresh
      </b-button>
    </div>
    <div v-if="hits.length > 0" :set="(hit = currentHit)">
      <YouTubeWithTranscript
        :video="hit.video"
        ref="youtube"
        layout="vertical"
        :highlight="terms"
        :hsk="level"
        :speed="speed"
        :startLineIndex="startLineIndex(hit)"
        :autoload="iOS() || (!hit.saved && navigated)"
        :autoplay="!hit.saved && navigated"
        :key="`youtube-with-transcript-${hit.video.youtube_id}`"
        @paused="updatePaused"
      />
    </div>
    <div class="text-center mt-0">
      <b-button
        variant="gray"
        @click="goToPreviousLine"
        size="sm"
        title="Go back to previous line"
        class="mr-1 ml-1"
      >
        <i class="fa fa-chevron-left" />
      </b-button>
      <b-button
        variant="gray"
        size="sm"
        :class="{
          'mr-1 ml-1': true,
          'bg-secondary border-secondary text-white': speed <= 0.75,
        }"
        @click="toggleSpeed()"
      >
        <i class="fas fa-tachometer-alt" v-if="speed === 1"></i>
        <span v-else>{{ speed }}x</span>
      </b-button>
      <b-button
        variant="dark"
        :class="{
          'quick-access-button shadow d-inline-block text-center mr-1 ml-1': true,
        }"
        @click="togglePaused"
      >
        <i v-if="paused" class="fas fa-play"></i>
        <i v-if="!paused" class="fas fa-pause"></i>
      </b-button>
      <b-button variant="gray" @click="rewind" size="sm" class="'ml-1 mr-1">
        <i class="fa fa-undo" />
      </b-button>
      <b-button
        variant="gray"
        @click="goToNextLine"
        size="sm"
        title="Advance to next line"
        class="mr-1 ml-1"
      >
        <i class="fa fa-chevron-right" />
      </b-button>
    </div>
    <!--
    <p class="mt-1 text-center" v-if="youglishLang[$l2.code]">
      See examples of “{{ terms[0] }}” on
      <a
        :href="`https://youglish.com/pronounce/${terms[0]}/${
          youglishLang[$l2.code]
        }`"
        target="youglish"
        >YouGlish</a
      >
    </p>
    -->
  </div>
</template>

<script>
import YouTubeWithTranscript from "@/components/YouTubeWithTranscript";
import SyncedTranscript from "@/components/SyncedTranscript";
import SimpleSearch from "@/components/SimpleSearch";
import SmallStar from "@/components/SmallStar";
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import YouTube from "@/lib/youtube";

export default {
  components: {
    SimpleSearch,
    YouTubeWithTranscript,
    SyncedTranscript,
    SmallStar,
  },
  props: {
    terms: {
      type: Array,
    },
    level: {
      type: String,
    },
    keyboard: {
      default: true,
    },
    fullscreenToggle: {
      default: true,
    },
    tvShow: {
      default: undefined
    },
    exact: {
      default: false
    }
  },
  data() {
    return {
      paused: true,
      currentHit: undefined,
      groupsRight: {},
      groupsLeft: {},
      foundHits: [],
      groupsLength: {},
      excludeTerms: [],
      navigated: false,
      checking: true,
      videos: [],
      contextLeft: [],
      contextRight: [],
      groupIndexLeft: [],
      groupIndexRight: [],
      groupIndexLength: [],
      fullscreen: false,
      showFilter: false,
      regex: undefined,
      excludeArr: [],
      speed: 1,
      sort: "length",
      youglishLang: {
        zh: "chinese",
        en: "english",
        ar: "arabic",
        nl: "dutch",
        fr: "french",
        de: "german",
        he: "hebrew",
        it: "italian",
        ja: "japanese",
        ko: "korean",
        pl: "polish",
        pt: "portuguese",
        ru: "russian",
        es: "spanish",
        tr: "turkish",
      },
    };
  },
  async mounted() {
    this.checkHits();
  },
  activated() {
    setTimeout(() => {
      if (this.$refs.youtube) this.$refs.youtube.pause();
    }, 800);
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
  watch: {
    regex() {
      if (!this.unfilteredHits) this.unfilteredHits = this.hits;
      let r =
        this.regex.startsWith("!") || this.regex.startsWith("！")
          ? `^((?!${this.regex.substr(1).replace(/[,，]/gi, "|")}).)*$`
          : this.regex;
      let hits = [];
      for (let hit of this.unfilteredHits) {
        let regex = new RegExp(r, "gim");
        if (regex.test(hit.video.subs_l2[hit.lineIndex].line)) {
          hits.push(hit);
        }
      }
      this.collectContext(hits);
      this.$emit("updated", hits);
    },
    currentHit() {
      if (this.navigated && this.$hasFeature('speech')) {
        window.speechSynthesis.cancel()
        Helper.speak(this.currentHit.line, this.$l2, 1)
      };
    },
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
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    $subsSearchLimit() {
      if (typeof this.$store.state.settings.subsSearchLimit !== "undefined")
        return this.$store.state.settings.subsSearchLimit;
      else {
        return 20;
      }
    },
    hitIndex() {
      let hits = this.hits;
      return hits.findIndex((hit) => hit === this.currentHit);
    },
    hits() {
      let hits = [];
      for (let index of this[`groupIndex${Helper.ucFirst(this.sort)}`]) {
        for (let hit of this[`groups${Helper.ucFirst(this.sort)}`][index]) {
          hits.push(hit);
        }
      }
      return hits;
    },
  },
  methods: {
    async remove() {
      let id = this.currentHit.video.id;
      let index = this.hitIndex;
      let response;
      try {
        response = await axios.delete(
          `${Config.wiki}items/youtube_videos/${id}`
        );
      } catch (err) {}
      let hits = [];
      for (let hit of this.hits) {
        if (hit !== this.currentHit && hit.video.id !== id) {
          hits.push(hit);
        }
      }
      this.collectContext(hits);
      this.$emit("updated", hits);
      this.goToHitIndex(index);
    },
    togglePaused() {
      this.$refs.youtube.togglePaused();
    },
    updatePaused(paused) {
      if (paused !== this.paused) {
        this.paused = paused;
      }
    },
    async checkHits() {
      this.checking = true;
      if (
        this.$l2.code === "zh" &&
        this.terms[0] &&
        this.terms[0].length === 1
      ) {
        this.excludeTerms = await (
          await this.$getDictionary()
        ).getWordsWithCharacter(this.terms[0]);
      }
      let hits = await YouTube.searchSubs(
        this.terms,
        this.excludeTerms,
        this.$l2.code,
        this.$l2.id,
        this.$adminMode,
        this.$l2.continua,
        this.$subsSearchLimit ? 20 : 500,
        this.tvShow ? this.tvShow.id : undefined,
        this.exact
      );

      hits = this.updateSaved(hits);
      this.collectContext(hits);
      this.$emit("loaded", hits);
      this.checking = false;
    },
    get(name) {
      return this[name];
    },
    ucFirst() {
      return Helper.ucFirst(...arguments);
    },
    highlightMultiple(a, b, c) {
      return Helper.highlightMultiple(a, b, c);
    },
    iOS() {
      return Helper.iOS();
    },
    collectContext(hits) {
      let contextLeft = [];
      let contextRight = [];
      for (let hit of hits) {
        contextLeft.push(hit.leftContext);
        contextRight.push(hit.rightContext);
      }
      this.contextLeft = Helper.unique(contextLeft).sort((a, b) =>
        a.localeCompare(b, this.$l2.code)
      );
      this.contextRight = Helper.unique(contextRight).sort((a, b) =>
        a.localeCompare(b, this.$l2.code)
      );
      this.groupsLeft = this.groupContext(this.contextLeft, hits, "left");
      this.groupsRight = this.groupContext(this.contextRight, hits, "right");
      this.groupsLength = this.groupByLength(hits);
      this.groupIndexLeft = this.sortGroupIndex(this.groupsLeft);
      this.groupIndexRight = this.sortGroupIndex(this.groupsRight);
      this.groupIndexLength = this.sortGroupIndex(this.groupsLength, false);
      this.Length = this.sortGroupIndex(this.groupsRight);
      this.currentHit = this.hits[0];
    },
    groupByLength(hits) {
      let hitGroups = {};
      let savedHits = [];
      let unsavedHits = hits.filter((hit) => {
        if (hit.saved) savedHits.push(hit);
        return !hit.saved;
      });
      let lengths = hits.map(
        (hit) => hit.video.subs_l2[hit.lineIndex].line.length
      );
      lengths = Helper.unique(lengths);
      for (let length of lengths) {
        if (!hitGroups[length]) hitGroups[length] = {};
        hitGroups[length] = unsavedHits.filter(
          (hit) => hit.video.subs_l2[hit.lineIndex].line.length === length
        );
      }
      hitGroups = Object.assign({ zthSaved: savedHits }, hitGroups);
      for (let key in hitGroups) {
        hitGroups[key] = hitGroups[key].sort(
          (a, b) => a.leftContext.length - b.leftContext.length
        );
      }
      return hitGroups;
    },
    groupContext(context, hits, leftOrRight) {
      let hitGroups = {};
      let savedHits = [];
      let unsavedHits = hits.filter((hit) => {
        if (hit.saved) savedHits.push(hit);
        return !hit.saved;
      });
      for (let c of context.map((s) => s.charAt(0))) {
        if (!hitGroups[c.charAt(0)]) hitGroups[c.charAt(0)] = {};
        hitGroups[c.charAt(0)] = unsavedHits.filter((hit) =>
          c.length > 0
            ? hit[`${leftOrRight}Context`].startsWith(c)
            : hit[`${leftOrRight}Context`] === ""
        );
      }
      hitGroups = Object.assign({ zthSaved: savedHits }, hitGroups);
      for (let key in hitGroups) {
        hitGroups[key] = hitGroups[key].sort((a, b) =>
          a.leftContext.localeCompare(b[`${leftOrRight}Context`], this.$l2.code)
        );
      }
      return hitGroups;
    },
    sortGroupIndex(group, sort = true) {
      let index = [];
      for (let c in group) {
        index.push({ c, length: group[c].length });
      }
      if (sort) index = index.sort((a, b) => b.length - a.length);
      index = index.map((i) => i.c);
      index.splice(index.indexOf("zthSaved"), 1);
      return ["zthSaved"].concat(index);
    },
    updateSaved(hits) {
      for (let hit of hits) {
        hit.saved = this.$store.getters["savedHits/has"]({
          l2: this.$l2.code,
          hit,
          terms: this.terms,
        });
      }
      return hits;
    },
    saveHit(hit) {
      console.log("Saving subs-search hit", hit);
      this.$store.dispatch("savedHits/add", {
        terms: this.terms,
        hit: hit,
        l2: this.$l2.code,
      });
      hit.saved = true;
      if (this.currentHit === hit) this.nextHit();
      this.groupsLeft["zthSaved"].push(hit);
      this.groupsRight["zthSaved"].push(hit);
      this.findAndRemoveHit(this.groupsLeft, hit);
      this.findAndRemoveHit(this.groupsRight, hit);
    },
    removeSavedHit(hit) {
      console.log("Removing subs-search hit", hit);
      this.$store.dispatch("savedHits/remove", {
        terms: this.terms,
        hit: hit,
        l2: this.$l2.code,
      });
      hit.saved = false;
      if (this.currentHit === hit) this.nextHit();
      let index = this.groupsLeft["zthSaved"].findIndex((h) => h === hit);
      if (index !== -1) this.groupsLeft["zthSaved"].splice(index, 1);
      index = this.groupsRight["zthSaved"].findIndex((h) => h === hit);
      if (index !== -1) this.groupsRight["zthSaved"].splice(index, 1);
      this.putHitBack(this.groupsLeft, hit, "left");
      this.putHitBack(this.groupsRight, hit, "right");
    },
    findAndRemoveHit(groups, hit) {
      for (let c in groups) {
        if (c !== "zthSaved") {
          let group = groups[c];
          let index = group.findIndex((h) => h === hit);
          if (index !== -1) group.splice(index, 1);
        }
      }
    },
    putHitBack(groups, hit, leftOrRight) {
      for (let c in groups) {
        if (hit[`${leftOrRight}Context`].startsWith(c)) {
          groups[c].push(hit);
          break;
        }
      }
    },
    toggleSpeed() {
      this.speed = this.speed === 1 ? 0.75 : this.speed === 0.75 ? 0.5 : 1;
    },
    startLineIndex(hit) {
      return hit.lineIndex;
    },
    goToPreviousLine() {
      if (this.$refs.youtube) this.$refs.youtube.goToPreviousLine();
    },
    goToNextLine() {
      if (this.$refs.youtube) this.$refs.youtube.goToNextLine();
    },
    rewind() {
      if (this.$refs.youtube) this.$refs.youtube.rewind();
    },
    prevHit() {
      let index = Math.max(this.hitIndex - 1, 0);
      this.currentHit = this.hits[index];
      this.navigated = true;
    },
    nextHit() {
      let index = Math.min(this.hitIndex + 1, this.hits.length - 1);
      this.currentHit = this.hits[index];
      this.navigated = true;
    },
    goToHit(hit) {
      this.currentHit = hit;
      this.navigated = true;
      setTimeout(() => {
        document.activeElement.blur();
      }, 100);
    },
    goToHitIndex(index) {
      index = Math.min(index, this.hits.length - 1);
      index = Math.max(index, 0);
      this.currentHit = this.hits[index];
      this.navigated = true;
    },
    seekYouTube(starttime) {
      this.$refs.youtube.seek(starttime);
    },
    pauseYouTube() {
      this.$refs.youtube.pause();
    },
    playYouTube() {
      this.$refs.youtube.play();
    },
    togglePaused() {
      if (this.$refs.youtube) this.$refs.youtube.togglePaused();
    },
    toggleFullscreen() {
      if (this.hits.length > 0) this.fullscreen = !this.fullscreen;
    },
    bindKeys() {
      document.addEventListener("keydown", this.keydown);
    },
    unbindKeys() {
      document.removeEventListener("keydown", this.keydown);
    },
    keydown(e) {
      if (
        !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
        !e.metaKey &&
        !e.repeat &&
        !e.target.getAttribute("contenteditable")
      ) {
        // left = 37
        if (e.keyCode == 37 && e.shiftKey) {
          this.prevHit();
          e.preventDefault();
          return false;
        }
        if (e.code == "KeyM") {
          this.toggleSpeed();
          e.preventDefault();
          return false;
        }
        // right = 39
        if (e.keyCode == 39 && e.shiftKey) {
          this.nextHit();
          e.preventDefault();
          return false;
        }
        // right = 39
        if (e.code == "KeyD") {
          this.nextHit();
          e.preventDefault();
          return false;
        }
        // up = 38, left = 37
        if (e.keyCode == 38 || (e.keyCode == 37 && !e.shiftKey)) {
          this.goToPreviousLine();
          e.preventDefault();
          return false;
        }
        // down = 40, right = 39
        if (e.keyCode == 40 || (e.keyCode == 39 && !e.shiftKey)) {
          this.goToNextLine();
          e.preventDefault();
          return false;
        }
        // r = 82
        if (e.keyCode == 82) {
          this.rewind();
          e.preventDefault();
          return false;
        }
        // spacebar = 32
        if (e.keyCode == 32) {
          this.togglePaused();
          e.preventDefault();
          return false;
        }
        // f = 70
        if (e.keyCode == 70) {
          if (this.fullscreenToggle) this.toggleFullscreen();
          e.preventDefault();
          return false;
        }
        // escape = 27
        if (e.keyCode == 27) {
          if (this.fullscreenToggle) this.fullscreen = false;
          e.preventDefault();
          return false;
        }
      }
    },
  },
};
</script>
<style lang="scss">
.search-subs .btn {
  margin: 0;
}
.search-subs .btn:disabled {
  opacity: 0.2;
}
.hit-thumb {
  width: calc(0.2rem * 16);
  height: calc(0.2rem * 9);
  object-fit: cover;
  margin-right: 1rem;
}
.search-subs.fullscreen .video-area {
  background: black;
}
.search-subs.fullscreen {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 10;
  overflow: scroll;
  padding-top: 0.3rem;
  margin-top: 0 !important;
}
.search-subs .playlist-dropdown {
  .dropdown-menu {
    margin-top: 2.2rem;
    height: calc(100vh - 3rem);
    border: none;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    overflow: scroll;
    .current {
      .dropdown-item {
        background: #f3f3f3;
      }
    }
    .dropdown-item {
      max-width: 98vw;
      white-space: normal;
      padding: 0.25rem 1rem;
      color: #666;
      &:hover {
        background-color: #f3f3f3;
        cursor: pointer;
      }
    }
  }
}
</style>

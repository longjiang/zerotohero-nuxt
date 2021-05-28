<template>
  <div :class="{ 'search-subs': true, fullscreen }">
    <div class="text-center mt-3 mb-3" v-if="checking">Checking content...</div>
    <div class="text-center mt-3 mb-3" v-if="!checking && hits.length === 0">
      No hits.
    </div>
    <div class="text-center" v-if="hits.length > 0">
      <button
        :disabled="hitIndex === 0"
        @click="prevHit"
        :class="{ btn: true, 'btn-small': true, invisible: hitIndex === 0 }"
      >
        <i class="fas fa-step-backward" />
      </button>
      <b-button @click="previousLine" class="btn btn-small">
        <i class="fa fa-chevron-left" />
      </b-button>
      <b-button @click="rewind" class="btn btn-small">
        <i class="fa fa-undo" />
      </b-button>
      <span class="ml-0 btn-small mr-0" style="background: none">
        {{ groupsRight["zthSaved"].length }}
      </span>
      <SmallStar
        :item="currentHit"
        :saved="(hit) => hit.saved"
        :save="saveHit"
        :remove="removeSavedHit"
        style="overflow: hidden; margin-bottom: -0.2rem"
        class="ml-0 mr-0"
      />
      <span class="ml-0 btn-small mr-0" style="background: none">
        {{ hitIndex + 1 }} of {{ hits.length }}
      </span>
      <b-dropdown
        class="primary playlist-dropdown"
        toggle-class="playlist-dropdown-toggle"
        boundary="viewport"
        no-caret
      >
        <template #button-content><i class="fa fa-stream" /></template>
        <b-dropdown-item>
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
        </b-dropdown-item>
        <template
          v-for="c in sort === 'right' ? groupIndexRight : groupIndexLeft"
        >
          <div
            :set="
              (theseHits = sort === 'right' ? groupsRight[c] : groupsLeft[c])
            "
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
                <Annotate
                  :phonetics="false"
                  :checkSaved="false"
                  :sticky="true"
                  :popup="false"
                  :key="`dropdown-line-${index}-annotate-${
                    hit.video.subs_l2[Number(hit.lineIndex)].line
                  }`"
                >
                  <span
                    v-if="sort === 'left' && hit.lineIndex > 0"
                    v-html="hit.video.subs_l2[Number(hit.lineIndex) - 1].line"
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
                    v-html="hit.video.subs_l2[Number(hit.lineIndex) + 1].line"
                    style="margin-left: 0.5em; opacity: 0.5"
                  ></span>
                </Annotate>
              </b-dropdown-item>
            </template>
          </div>
        </template>
      </b-dropdown>
      <b-button @click="nextLine" class="btn btn-small">
        <i class="fa fa-chevron-right" />
      </b-button>
      <button
        :disabled="hitIndex >= hits.length - 1"
        @click="nextHit"
        :class="{
          btn: true,
          'btn-small': true,
          invisible: hitIndex >= hits.length - 1,
        }"
      >
        <i class="fas fa-step-forward" />
      </button>
      <b-button
        :class="{
          btn: true,
          'btn-small': true,
          'bg-secondary text-white': speed === 0.75,
          'bg-dark text-white': speed === 0.5,
        }"
        @click="toggleSpeed()"
      >
        {{ speed === 1 ? "慢" : speed + "x" }}
      </b-button>
      <input
        type="text"
        v-model.lazy="excludeStr"
        :style="`width: 6em`"
        placeholder="Exclude..."
        class="btn-small"
      />
      <router-link
        :to="`/${$l1.code}/${$l2.code}/youtube/view/${currentHit.video.youtube_id}/`"
        class="btn btn-small pr-2"
      >
        <i class="fa fa-window-restore" />
      </router-link>
      <b-button
        class="btn btn-small search-subs-fullscreen"
        @click="toggleFullscreen"
        v-if="!fullscreen && fullscreenToggle"
      >
        <i class="fas fa-expand"></i>
      </b-button>
      <b-button
        class="btn btn-small search-subs-close"
        @click="toggleFullscreen"
        v-if="fullscreen && fullscreenToggle"
      >
        <i class="fas fa-times" />
      </b-button>
    </div>
    <div v-if="hits.length > 0" :set="(hit = currentHit)" class="mb-4">
      <YouTubeWithTranscript
        :youtube="hit.video.youtube_id"
        ref="youtube"
        :l2Lines="hit.video.subs_l2"
        layout="vertical"
        :highlight="terms"
        :hsk="level"
        :speed="speed"
        :startLineIndex="startLineIndex(hit)"
        :autoload="iOS() || (!hit.saved && navigated)"
        :autoplay="!hit.saved && navigated"
        :key="`youtube-with-transcript-${hit.video.youtube_id}`"
      />
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
  },
  data() {
    return {
      currentHit: undefined,
      groupsRight: {},
      groupsLeft: {},
      excludeTerms: [],
      navigated: false,
      checking: true,
      videos: [],
      contextLeft: [],
      contextRight: [],
      groupIndexLeft: [],
      groupIndexRight: [],
      fullscreen: false,
      excludeStr: "",
      excludeArr: [],
      speed: 0.75,
      sort: "right",
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
    await Helper.timeout(2000)
    this.checking = true;
    if (this.$l2.code === "zh" && this.terms[0].length === 1) {
      this.excludeTerms = await (
        await this.$getDictionary()
      ).getWordsWithCharacter(this.terms[0]);
    }
    let hits = await YouTube.searchSubs(
      this.terms,
      this.excludeTerms,
      this.$l2.code,
      this.$l2.id,
      this.$settings.adminMode,
      this.$l2.continua
    );

    hits = this.updateSaved(hits);
    this.collectContext(hits);
    this.$emit("loaded", hits);
    this.checking = false;
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
    excludeStr() {
      this.excludeArr = this.excludeStr.split(",");
      let hits = [];
      for (let hit of this.hits) {
        let regex = new RegExp(this.excludeArr.join("|"));
        if (
          !regex.test(hit.video.subs_l2[hit.lineIndex].line) &&
          !regex.test(hit.video.title)
        ) {
          hits.push(hit);
        }
      }
      this.collectContext(hits);
      this.$emit("updated", hits);
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
        a.localeCompare(b, "zh-CN")
      );
      this.contextRight = Helper.unique(contextRight).sort((a, b) =>
        a.localeCompare(b, "zh-CN")
      );
      this.groupsLeft = this.groupContext(this.contextLeft, hits, "left");
      this.groupsRight = this.groupContext(this.contextRight, hits, "right");
      this.groupIndexLeft = this.sortGroupIndex(this.groupsLeft);
      this.groupIndexRight = this.sortGroupIndex(this.groupsRight);
      this.currentHit = this.hits[0];
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
          a.leftContext.localeCompare(b[`${leftOrRight}Context`], "zh-CN")
        );
      }
      return hitGroups;
    },
    sortGroupIndex(group) {
      let index = [];
      for (let c in group) {
        index.push({ c, length: group[c].length });
      }
      index = index.sort((a, b) => b.length - a.length).map((i) => i.c);
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
      console.log("saving", hit);
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
      console.log("removing", hit);
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
    previousLine() {
      if (this.$refs.youtube) this.$refs.youtube.previousLine();
    },
    nextLine() {
      if (this.$refs.youtube) this.$refs.youtube.nextLine();
    },
    rewind() {
      if (this.$refs.youtube) this.$refs.youtube.rewind();
    },
    async remove() {
      let id = this.hits[this.hitIndex].video.id;
      let response = await axios.delete(
        `${Config.wiki}items/youtube_videos/${id}`
      );
      if (response) {
        this.hits = this.hits.filter((hit) => hit.video.id !== id);
      }
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
        !e.metaKey && !e.repeat
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
        if (e.code == 'KeyD') {
          this.nextHit();
          e.preventDefault();
          return false;
        }
        // up = 38, left = 37
        if (e.keyCode == 38 || (e.keyCode == 37 && !e.shiftKey)) {
          this.previousLine();
          e.preventDefault();
          return false;
        }
        // down = 40, right = 39
        if (e.keyCode == 40 || (e.keyCode == 39 && !e.shiftKey)) {
          this.nextLine();
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
.search-subs .btn-small {
  margin: 0
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
  .playlist-dropdown-toggle {
    color: #a7a7a7;
    font-size: 0.8rem;
    padding: 0.1rem 0.4rem;
    border-radius: 0.2rem;
    background: #f3f3f3;
    position: relative;
    margin: 0.2rem;
    display: inline-block;
    bottom: 0.2rem;
    border: none;
    &:hover {
      background-color: #b5b5b5;
      text-decoration: none;
      color: #868686;
    }
  }
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

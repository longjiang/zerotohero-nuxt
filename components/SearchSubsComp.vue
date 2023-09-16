<template>
  <div
    :class="{
      'search-subs search-subs-dark pb-3': true,
      fullscreen,
      reels: fullscreen && reels,
    }"
  >
    <div class="text-center pb-2">
      <span v-if="hits.length > 0">
        <b-button
          size="sm"
          variant="ghost-dark-no-bg"
          :disabled="hitIndex === 0"
          @click="goToPrevHit"
          title="Previous Clip"
          :class="{ '': true, disabled: hitIndex === 0 }"
        >
          <i class="fas fa-step-backward" />
        </b-button>
        <b-button
          variant="ghost-dark-no-bg"
          size="sm"
          v-if="!showFilter"
          title="Filter Clips by Keywords"
          @click="showFilter = true"
        >
          <i class="fas fa-filter" />
        </b-button>
        <b-button
          size="sm"
          variant="ghost-dark-no-bg"
          class="playlist-toggle"
          @click="showPlaylistModal"
          title="List All Clips"
        >
          <i class="fa-solid fa-list mr-1"></i>
          {{ $t("List") }}
        </b-button>
        <b-form-input
          v-if="!checking && (hits.length > 0 || regex) && showFilter"
          type="text"
          class="d-inline-block"
          size="sm"
          v-model="regex"
          placeholder="Filter..."
          style="width: 6em"
          :variant="skin === 'light' ? 'gray' : 'ghost-dark-no-bg'"
          :lazy="true"
          @blur="showFilter = false"
        />
        <span class="search-subs-hit-index ml-2 mr-2 d-inline-block">
          {{ hitIndex + 1 }} of {{ hits.length }}
        </span>
        <router-link
          v-if="currentHit"
          :to="{
            name: 'video-view',
            params: {
              type: 'youtube',
              youtube_id: currentHit.video.youtube_id,
            },
            query: {
              t: currentHit.video.subs_l2[currentHit.lineIndex].starttime,
            },
          }"
          class="btn btn-ghost-dark-no-bg btn-sm"
          title="Open this video with full transcript"
        >
          <i class="fa-solid fa-arrows-maximize mr-1"></i>
          {{ $t("Open Full") }}
        </router-link>
        <b-button
          size="sm"
          :disabled="hitIndex >= hits.length - 1"
          variant="ghost-dark-no-bg"
          @click="goToNextHit"
          title="Next Clip"
          :class="{
            disabled: hitIndex >= hits.length - 1,
          }"
        >
          <i class="fas fa-step-forward" />
        </b-button>
        <div class="float-right mr-1" v-if="$adminMode">
          <SmallStar
            class="small-star ml-0 mr-0"
            :item="currentHit"
            :saved="(hit) => hit.saved"
            :save="saveHit"
            :remove="removeSavedHit"
          />
          <span
            class="num-saved ml-1 mr-0"
            v-if="groupsRight['zthSaved'].length > 0"
          >
            {{ groupsRight["zthSaved"].length }}
          </span>
          <b-button
            variant="ghost-dark-no-bg"
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
            variant="ghost-dark-no-bg"
            size="sm"
            class="btn search-subs-close"
            v-if="!checking && fullscreen && fullscreenToggle"
            @click="toggleFullscreen"
          >
            <i class="fas fa-times" />
          </b-button>
          <b-button
            variant="ghost-dark-no-bg"
            size="sm"
            v-if="fullscreen"
            @click="reels = !reels"
            :class="{ active: reels }"
          >
            <i class="fa-brands fa-instagram"></i>
          </b-button>
        </div>
      </span>
    </div>
    <div
      :class="{ 'loader text-center pb-5 pt-3': true, 'd-none': !checking }"
      style="flex: 1"
    >
      <Loader :sticky="true" message="Searching through video captions..." />
    </div>
    <div class="text-center p-3" v-if="!checking && hits.length === 0">
      <p>{{ $t("Sorry, no hits found.") }}</p>
      <p v-if="$store.state.settings.subsSearchLimit">
        {{
          $t(
            "Try turning off ‘Limit “this word in TV Shows” search result (faster)’ in Settings."
          )
        }}
        <router-link :to="{ name: 'settings' }">
          {{ $t("Go to settings") }}
        </router-link>
      </p>
      <b-button
        v-if="$adminMode"
        size="sm"
        variant="primary"
        @click="searchSubsAndProcessHits"
      >
        <i class="fa fa-sync-alt"></i>
        {{ $t("Refresh") }}
      </b-button>
    </div>
    <template v-if="pro || hitIndex < NON_PRO_MAX_SUBS_SEARCH_HITS">
      <div v-if="reels && currentHit" class="video-title">
        <b>{{ $t("VIDEO SOURCE") }}:</b>
        <span>{{ currentHit.video.title }}</span>
      </div>
      <LazyVideoWithTranscript
        v-if="currentHit"
        :ref="`youtube-${hitIndex}`"
        v-bind="{
          autoload: true,
          autoplay: navigated,
          cc: true,
          episodes: hits.map((h) => h.video),
          forcePro: true,
          forceMode: 'subtitles',
          show: currentHit.show,
          showInfoButton: true,
          showAnimation: !reels,
          showFullscreenToggle: true,
          showInfo: true,
          showLineList: false,
          showType: currentHit.showType,
          skin: 'dark',
          speed,
          startLineIndex: Math.max(startLineIndex, 0),
          type: 'youtube',
          video: currentHit.video,
        }"
        @previous="goToPrevHit"
        @next="goToNextHit"
      />
    </template>
    <template v-if="!pro">
      <YouNeedPro
        v-if="hitIndex > NON_PRO_MAX_SUBS_SEARCH_HITS - 1"
        skin="dark"
        :message="
          $t('See all {num} search results with a Pro account', {
            num: hits.length,
          })
        "
      />
    </template>

    <b-modal
      ref="playlist-modal"
      size="lg"
      centered
      hide-footer
      :title="$t('Video Caption Search Results')"
      body-class="playlist-modal-wrapper"
      modal-class="safe-padding-top mt-4"
      @show="onPlaylistModalShown"
    >
      <div class="playlist-modal">
        <div class="pt-3 pl-3 pr-3">
          <button
            :class="{
              'btn btn-small': true,
              'bg-dark': sort === 'length',
              'text-white': sort === 'length',
            }"
            @click.stop.prevent="sort = 'length'"
          >
            {{ $t("Sort By Length") }}
          </button>
          <button
            :class="{
              'btn btn-small': true,
              'bg-dark': sort === 'left',
              'text-white': sort === 'left',
            }"
            @click.stop.prevent="sort = 'left'"
          >
            {{ $t("Sort Left") }}
          </button>
          <button
            :class="{
              'btn btn-small': true,
              'bg-dark': sort === 'right',
              'text-white': sort === 'right',
            }"
            @click.stop.prevent="sort = 'right'"
          >
            {{ $t("Sort Right") }}
          </button>
        </div>
        <template v-for="c in get(`groupIndex${ucFirst(sort)}`)">
          <div
            :set="(theseHits = get(`groups${ucFirst(sort)}`)[c])"
            :key="`comp-subs-grouping-${sort}-${c}`"
          >
            <hr
              :key="`comp-subs-grouping-${c}-divider`"
              v-if="theseHits && theseHits.length > 0"
            />
            <template v-for="(hit, index) in theseHits">
              <div
                @click.stop="goToHit(hit)"
                :class="{
                  current: hit === currentHit,
                  'playlist-modal-item': true,
                }"
                :key="`dropdown-line-${c}-${index}`"
                :ref="
                  hit === currentHit ? 'playlist-modal-current-item' : undefined
                "
              >
                <SmallStar
                  :item="hit"
                  :saved="(hit) => hit.saved"
                  :save="saveHit"
                  :remove="removeSavedHit"
                />
                <img
                  class="hit-thumb"
                  :src="`https://img.youtube.com/vi/${hit.video.youtube_id}/hqdefault.jpg`"
                  :alt="hit.video.title"
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
                  </span>
                </span>
              </div>
            </template>
          </div>
        </template>
      </div>
    </b-modal>
  </div>
</template>

<script>
import {
  unique,
  ucFirst,
  timeout,
  highlightMultiple,
  iOS,
  NON_PRO_MAX_SUBS_SEARCH_HITS,
} from "@/lib/utils";
import YouTube from "@/lib/youtube";
import Vue from "vue";

export default {
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
      default: undefined,
    },
    exact: {
      default: false,
    },
    skin: {
      default: "light",
    },
    context: {
      type: Object, // { form, text, starttime = undefined, youtube_id = undefined }
    },
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
      maxNumOfHitsForSanity: 500,
      showFilter: false,
      regex: undefined,
      reels: false,
      excludeArr: [],
      speed: 1,
      slideIndex: 0,
      sort: "length",
      tvShowFilter: this.tvShow ? [this.tvShow.id] : "all",
      talkFilter: "all",
      NON_PRO_MAX_SUBS_SEARCH_HITS,
    };
  },
  computed: {
    hitIndex() {
      let hits = this.hits;
      return hits.findIndex((hit) => hit === this.currentHit);
    },
    hits() {
      let hits = [];
      for (let index of this[`groupIndex${ucFirst(this.sort)}`]) {
        for (let hit of this[`groups${ucFirst(this.sort)}`][index]) {
          hits.push(hit);
        }
      }
      return hits;
    },
    prevHit() {
      if (this.hitIndex > 0) return this.hits[this.hitIndex - 1];
      else return this.hits[this.hits.length - 1];
    },
    nextHit() {
      if (this.hitIndex < this.hits.length - 1)
        return this.hits[this.hitIndex + 1];
      else return this.hits[0];
    },
    startLineIndex() {
      let startLineIndex = this.currentHit.lineIndex;
      return startLineIndex;
    },
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
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
    async currentHit() {
      this.loadL1SubsIfNeeded();
    },
  },
  async mounted() {
    if (typeof this.$store.state.settings !== "undefined") {
      this.loadSettings();
    }
    this.unsubscribeSettings = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
        this.loadSettings();
      }
    });
    this.excludeTerms = await this.getExcludeTerms();
    await this.searchSubsAndProcessHits();
  },
  activated() {
    setTimeout(() => {
      if (this.$refs[`youtube-${this.hitIndex}`])
        this.$refs[`youtube-${this.hitIndex}`].pause();
    }, 800);
  },
  beforeDestroy() {
    this.unsubscribeSettings();
  },
  methods: {
    ucFirst,
    highlightMultiple,
    iOS,
    async loadL1SubsIfNeeded() {
      let video = this.currentHit?.video;
      if (!video) return;

      // If the video doesn't have L1 subtitles, we load it from YouTube
      if (!(video?.subs_l1?.length > 0)) {
        let subs;

        let { l1Locale, l2Locale, l2Name } = await YouTube.getTranscriptLocales(
          video.youtube_id,
          this.$l1,
          this.$l2
        );

        if (l1Locale) {
          subs = await YouTube.getTranscript(video.youtube_id, l1Locale);
        }

        // If we still don't have it, we get translated ones
        if (!(subs?.length > 0)) {
          let tlang = this.$l1.code === "zh" ? "zh-Hans" : this.$l1.code; // tlang
          subs = await YouTube.getTranslatedTranscript({
            youtube_id: video.youtube_id,
            locale: l2Locale,
            name: l2Name,
            tlang
          });
        }
        if (subs && subs.length > 0) Vue.set(video, `subs_l1`, subs);
      }
    },
    async onVideoUnavailable(youtube_id) {
      let video = this.currentHit.video;
      if (youtube_id && youtube_id !== video.youtube_id) return; // Always make sure the unavailable video is indeed what the user is looking at
      // Go to next video
      await timeout(2000);
      if (this.currentHit.video.youtube_id === youtube_id)
        this.removeCurrentHitAndGoToNext();
    },
    loadSettings() {
      this.tvShowFilter = this.tvShow
        ? [this.tvShow.id]
        : this.$l2Settings.tvShowFilter;
      this.talkFilter = this.$l2Settings.talkFilter;
    },
    showPlaylistModal() {
      this.$refs["playlist-modal"].show();
    },
    async onPlaylistModalShown() {
      await timeout(500);
      if (this.$refs["playlist-modal-current-item"]) {
        let ref = this.$refs["playlist-modal-current-item"][0];
        ref.scrollIntoView({ block: "center" });
      }
    },
    hitIndexFromSlideIndex(slideIndex) {
      let currentSlideIndex = this.slideIndex;
      let s;
      let i = this.hitIndex;
      if (currentSlideIndex === 0) s = [i, i + 1, i - 1];
      else if (currentSlideIndex === 1) s = [i - 1, i, i + 1];
      else if (currentSlideIndex === 2) s = [i + 1, i - 1, i];
      let hitIndex = s[slideIndex];
      if (hitIndex > this.hits.length - 1) hitIndex = 0;
      if (hitIndex < 0) hitIndex = this.hits.length - 1;
      return hitIndex;
    },
    vueSlickCarouselAfterChange(slideIndex) {
      this.goToHitIndex(this.hitIndexFromSlideIndex(slideIndex));
      this.slideIndex = slideIndex;
    },
    removeCurrentHitAndGoToNext() {
      let hits = [];
      let index = this.hitIndex;
      let id = this.currentHit.video.id;
      for (let hit of this.hits) {
        if (hit !== this.currentHit && hit.video.id !== id) {
          hits.push(hit);
        }
      }
      this.collectContext(hits);
      this.$emit("updated", hits);
      this.goToHitIndex(index);
    },
    updatePaused(paused) {
      if (paused !== this.paused) {
        this.paused = paused;
      }
    },
    simplifyExcludeTerms(excludeTerms) {
      excludeTerms = excludeTerms.map((t) =>
        t
          .replace(new RegExp(`.*?((${this.terms.join("|")}).).*`), "$1")
          .replace(new RegExp(`.*?(.(${this.terms.join("|")})).*`), "$1")
          .trim()
      );
      return excludeTerms;
    },
    calculateLimit() {
      // No limit unless set
      if (this.$store.state.settings.subsSearchLimit) {
        return 150;
      } else {
        return this.maxNumOfHitsForSanity;
      }
    },
    async getExcludeTerms() {
      let excludeTerms = [];
      let dictionary = await this.$getDictionary();
      if (dictionary && this.terms.length > 0) {
        for (let term of this.terms) {
          let t = await dictionary.getWordsThatContain(term);
          t = this.simplifyExcludeTerms(t);
          excludeTerms = excludeTerms.concat(t);
        }
        excludeTerms = unique(excludeTerms);
      }
      return excludeTerms.filter(
        (s) =>
          s !== "" &&
          !this.terms
            .filter((t) => t)
            .map((t) => t.toLowerCase())
            .includes(s.toLowerCase())
      );
    },
    async searchSubsAndProcessHits() {
      this.checking = true;
      let terms = this.terms;
      let mustIncludeYouTubeId = this.context?.youtube_id;
      let limit = this.calculateLimit();
      let options = {
        terms,
        excludeTerms: this.excludeTerms,
        langId: this.$l2.id,
        adminMode: false,
        continua: this.$l2.continua,
        limit,
        tvShowFilter: this.tvShowFilter,
        talkFilter: this.talkFilter,
        exact: this.exact,
        apostrophe: true,
        convertToSimplified: this.$l2.han,
        mustIncludeYouTubeId,
      };
      let hits = await this.$subs.searchSubs(options);
      if (hits.length === 0) {
        options.limit = this.maxNumOfHitsForSanity;
        hits = await this.$subs.searchSubs(options);
      }
      if (hits.length === 0) {
        this.tvShowFilter = "all";
        this.talkFilter = "all";
        options.tvShowFilter = "all";
        options.talkFilter = "all";
        hits = await this.$subs.searchSubs(options);
      }

      hits = this.updateSaved(hits);
      hits = this.setShows(hits);
      this.collectContext(hits);
      this.$emit("loaded", hits);
      this.checking = false;
    },
    setShows(hits) {
      for (let hit of hits) {
        let show, showType;
        if (hit.video) {
          if (hit.video.tv_show) {
            show = this.$store.getters["shows/tvShow"]({
              id: Number(hit.video.tv_show),
              l2: this.$l2,
            });
            showType = "tv_show";
          } else if (hit.video.talk) {
            show = this.$store.getters["shows/talk"]({
              id: hit.video.talk,
              l2: this.$l2,
            });
            showType = "talk";
          }
          hit.show = show;
          hit.showType = showType;
        }
      }
      return hits;
    },
    get(name) {
      return this[name];
    },
    collectContext(hits) {
      let contextLeft = [];
      let contextRight = [];
      for (let hit of hits) {
        contextLeft.push(hit.leftContext);
        contextRight.push(hit.rightContext);
      }
      this.contextLeft = unique(contextLeft).sort((a, b) =>
        a.localeCompare(b, this.$l2.locales[0])
      );
      this.contextRight = unique(contextRight).sort((a, b) =>
        a.localeCompare(b, this.$l2.locales[0])
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
    /**
     * Matched hits are hits from the video context the word is saved from.
     */
    getSavedAndMatchedHits(hits) {
      let savedHits = [];
      let matchedHits = [];
      let remainingHits = hits.filter((hit) => {
        let pass = true;
        if (hit.saved) {
          savedHits.push(hit);
          pass = false;
        }
        if (
          this.context?.youtube_id &&
          hit.video.youtube_id === this.context.youtube_id
        ) {
          matchedHits.push(hit);
          pass = false;
        }
        return pass;
      });
      return { savedHits, matchedHits, remainingHits };
    },
    groupByLength(hits) {
      let hitGroups = {};
      let { savedHits, matchedHits, remainingHits } =
        this.getSavedAndMatchedHits(hits);
      let lengths = hits.map(
        (hit) => hit.video.subs_l2[hit.lineIndex].line.length
      );
      lengths = unique(lengths);
      for (let length of lengths) {
        if (!hitGroups[length]) hitGroups[length] = {};
        hitGroups[length] = remainingHits.filter(
          (hit) => hit.video.subs_l2[hit.lineIndex].line.length === length
        );
      }
      hitGroups = Object.assign(
        { zthSaved: savedHits, contextMatched: matchedHits },
        hitGroups
      );
      for (let key in hitGroups) {
        hitGroups[key] = hitGroups[key].sort(
          (a, b) => a.leftContext.length - b.leftContext.length
        );
      }
      return hitGroups;
    },
    groupContext(context, hits, leftOrRight) {
      let hitGroups = {};
      let { savedHits, matchedHits, remainingHits } =
        this.getSavedAndMatchedHits(hits);
      for (let c of context.map((s) => s.charAt(0))) {
        if (!hitGroups[c.charAt(0)]) hitGroups[c.charAt(0)] = {};
        hitGroups[c.charAt(0)] = remainingHits.filter((hit) =>
          c.length > 0
            ? hit[`${leftOrRight}Context`].startsWith(c)
            : hit[`${leftOrRight}Context`] === ""
        );
      }
      hitGroups = Object.assign(
        { zthSaved: savedHits, contextMatched: matchedHits },
        hitGroups
      );
      for (let key in hitGroups) {
        hitGroups[key] = hitGroups[key].sort((a, b) =>
          a.leftContext.localeCompare(
            b[`${leftOrRight}Context`],
            this.$l2.locales[0]
          )
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
      index.splice(index.indexOf("contextMatched"), 1);
      return ["contextMatched", "zthSaved"].concat(index);
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
      this.$store.dispatch("savedHits/add", {
        terms: this.terms,
        hit: hit,
        l2: this.$l2.code,
      });
      hit.saved = true;
      if (this.currentHit === hit) this.goToNextHit();
      this.groupsLeft["zthSaved"].push(hit);
      this.groupsRight["zthSaved"].push(hit);
      this.findAndRemoveHit(this.groupsLeft, hit);
      this.findAndRemoveHit(this.groupsRight, hit);
    },
    removeSavedHit(hit) {
      this.$store.dispatch("savedHits/remove", {
        terms: this.terms,
        hit: hit,
        l2: this.$l2.code,
      });
      hit.saved = false;
      if (this.currentHit === hit) this.goToNextHit();
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
    goToPrevHit() {
      this.currentHit = this.prevHit;
      this.navigated = true;
    },
    goToNextHit() {
      this.currentHit = this.nextHit;
      this.navigated = true;
    },
    goToHit(hit) {
      this.currentHit = hit;
      this.navigated = true;
      this.$refs["playlist-modal"].hide();
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
    toggleFullscreen() {
      if (this.hits.length > 0) this.fullscreen = !this.fullscreen;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";
.search-subs {
  max-width: calc(100vh - 5rem);
  margin: 0 auto;
  .search-subs-hit-index {
    margin-bottom: -0.52rem;
    overflow: hidden;
  }

  .btn {
    margin: 0;
  }

  .btn:disabled {
    opacity: 0.2;
  }

  .video-area {
    background: black;
  }

  &.fullscreen {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    z-index: 99;
  }

  &.search-subs-light.fullscreen {
    background: white;
  }

  &.search-subs-dark {
    &.fullscreen {
      background: black;
    }

    .search-subs-hit-index {
      color: rgba(255, 255, 255, 0.877);
    }
  }
  :deep(.video-transcript-column) {
    min-height: 5rem; // Make sure the black space around the subs don't shift too much between lines
  }
}

.btn.active {
  color: $primary-color;
}

.show-pinyin .reels {
  :deep(.annotated) {
    line-height: 1;
  }
}

:deep(.synced-transcript-single-line) .transcript-line-both {
  min-height: 5rem;
}

.reels {
  :deep(.video-controls) {
    display: none !important;
  }

  :deep(.video-transcript-column) {
    margin-top: 0.5rem;
  }

  :deep(.quick-gloss) {
    display: none;
  }

  :deep(.add-pinyin) .word-block.saved {
    text-align: center;
  }

  :deep(.video-with-transcript) {
    width: calc(1080px / 2);
    height: calc(1920px / 2);
    background: #010101;
    margin-left: calc((100vw - 1080px / 2) / 2);
    position: relative;
  }

  :deep(.youtube) {
    width: calc(1080px / 2 * 1.77);
    height: calc(855px / 2);
    margin-left: calc(1080px / 2 * -0.77 / 2);
  }

  :deep(.synced-transcript-single-line) .transcript-line-both {
    padding-top: 0;
    font-size: 1.7em;
    font-weight: bold;
    padding-left: 1.5rem;
    padding-right: 5.75rem;
    .transcript-line-l1 {
      font-weight: normal;
      opacity: 1;
      line-height: 1.25;
    }

    .transcript-line-l2 {
      padding-left: 0;
    }
    .transcript-line-l2-rtl {
      padding-right: 0;
    }
  }

  :deep(.annotator-buttons) {
    position: absolute;
    right: -3rem;
    padding: 0;
  }

  .video-title {
    position: absolute;
    z-index: 1;
    width: calc(540px - 9rem);
    bottom: 50rem;
    margin-left: calc((100vw - 540px) / 2 + 2.5rem);
    text-align: center;
    background: #000000cc;
    color: white;
    padding: 0.5rem;
    font-size: 0.8rem;
    border-radius: 0.25rem;
    backdrop-filter: blur(10px);
  }

  .small-star {
    position: relative;
    bottom: -0.07em;
  }

  .num-saved {
    background: none;
    position: relative;
    bottom: -0.07em;
    opacity: 0.7;
  }
}
</style>

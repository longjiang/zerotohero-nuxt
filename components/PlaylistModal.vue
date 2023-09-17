<template>
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
          @click.stop.prevent="$emit('updateSort', 'length')"
        >
          {{ $t("Sort By Length") }}
        </button>
        <button
          :class="{
            'btn btn-small': true,
            'bg-dark': sort === 'left',
            'text-white': sort === 'left',
          }"
          @click.stop.prevent="$emit('updateSort', 'left')"
        >
          {{ $t("Sort Left") }}
        </button>
        <button
          :class="{
            'btn btn-small': true,
            'bg-dark': sort === 'right',
            'text-white': sort === 'right',
          }"
          @click.stop.prevent="$emit('updateSort', 'right')"
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
</template>

<script>
import {
  ucFirst,
  timeout,
  highlightMultiple,
} from "@/lib/utils";

export default {
  props: {
    // define the props that this component needs, if any
    sort: {
      type: String,
      required: true,
    },
    terms: {
      type: Array,
      required: true,
    },
    currentHit: {
      type: Object,
      default: undefined
    },
    get: {
      type: Function,
      required: true,
    },
    goToHit: {
      type: Function,
      required: true,
    },
    level: {
      type: String,
    },
  },
  methods: {
    ucFirst,
    highlightMultiple,
    show() {
      this.$refs["playlist-modal"].show();
    },
    hide() {
      this.$refs["playlist-modal"].hide();
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
    async onPlaylistModalShown() {
      await timeout(500);
      if (this.$refs["playlist-modal-current-item"]) {
        let ref = this.$refs["playlist-modal-current-item"][0];
        ref.scrollIntoView({ block: "center" });
      }
    },
    // ... any other existing methods for this modal
  },
};
</script>

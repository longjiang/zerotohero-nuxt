<!-- /components/YouTubeVideoCard/SubtitleEditor.vue -->

<template>
  <div v-if="adminMode && showSubsEditing">
    <!-- L1 subs -->
    <div
      v-if="video.subs_l1 && video.subs_l1.length > 0"
    >
      <div
        v-for="index in Math.min(20, video.subs_l1.length)"
        :key="`l1-subs-${index}`"
      >
        <b>{{ video.l1Locale }}</b>
        <span
          @click="matchSubs(index - 1)"
          :class="{
            btn: true,
            'btn-small': true,
            'text-danger':
              video.subs_l2 &&
              video.subs_l2.length > 0 &&
              video.subs_l1[index - 1] &&
              video.subs_l1[index - 1].starttime !==
                video.subs_l2[0].starttime,
          }"
        >
          {{ video.subs_l1[index - 1].starttime }}
        </span>
        {{ video.subs_l1[index - 1].line }}
      </div>
    </div>

    <!-- L2 subs with time input -->
    <div v-if="video.subs_l2 && video.subs_l2.length > 0">
      <b>{{ video.l2Locale || $l2.code }}</b>
      <input
        type="text"
        v-model="localFirstLineTime"
        :lazy="true"
        :style="`width: ${String(localFirstLineTime).length + 1}em`"
        class="ml-1 mr-1 btn btn-small"
        @input="shiftAndUpdate"
      />
      {{ video.subs_l2[0].line }}
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  props: {
    video: { type: Object, required: true },
    showSubsEditing: { type: Boolean, default: false },
    adminMode: { type: Boolean, default: false },
    // firstLineTime is v-model: we use .sync or v-model internally.
    // We'll use a local copy and emit update.
    value: { type: Number, default: undefined }, // v-model value
  },
  data() {
    return {
      localFirstLineTime: this.value !== undefined ? this.value : (this.video.subs_l2 && this.video.subs_l2[0] ? this.video.subs_l2[0].starttime : undefined),
    };
  },
  watch: {
    value(newVal) {
      this.localFirstLineTime = newVal;
    },
  },
  methods: {
    matchSubs(index) {
      if (this.video.subs_l1 && this.video.subs_l1[index]) {
        this.localFirstLineTime = this.video.subs_l1[index].starttime;
        this.shiftAndUpdate();
      }
    },
    shiftAndUpdate() {
      if (
        this.video.subs_l2 &&
        this.video.subs_l2.length > 0 &&
        this.localFirstLineTime !== this.video.subs_l2[0].starttime
      ) {
        const subsShift = Number(this.localFirstLineTime) - Number(this.video.subs_l2[0].starttime);
        if (subsShift !== 0) {
          for (let line of this.video.subs_l2) {
            line.starttime = Number(line.starttime) + subsShift;
          }
        }
        this.$emit("update-subs"); // parent will save to backend
      }
      this.$emit("input", this.localFirstLineTime);
    },
  },
};
</script>

<style scoped>
/* any specific styles for the editor */
</style>
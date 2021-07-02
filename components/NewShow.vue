<template>
  <div>
    <b-input
      type="text"
      v-model.lazy="newShowTitle"
      placeholder="Title"
      size="sm"
    />
    <b-button
      class="btn btn-small mt-2 ml-0 bg-success text-white"
      size="sm"
      @click="addShow()"
    >
      Save {{ type === "tv-shows" ? "Show" : "Talk" }}
    </b-button>
  </div>
</template>

<script>
import Config from "@/lib/config";

export default {
  props: {
    youtube_id: String,
    defaultTitle: String,
    type: {
      default: "tv-shows",
      type: String,
    },
  },
  data() {
    return {
      newShow: false,
      newShowTitle: this.defaultTitle,
      newShowYear: undefined,
      newShowL1Title: undefined,
    };
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
  },
  methods: {
    async addShow() {
      let show = {
        youtube_id: this.youtube_id,
        title: this.newShowTitle,
        l2: this.$l2.id,
      };
      if (this.newShowYear) show.year = this.newShowYear;
      show = await this.$store.dispatch("shows/add", {
        l2: this.$l2,
        type: this.type === "tv-shows" ? "tvShows" : "talks",
        show,
      });
      if (show) {
        this.$emit("newShow", show.id);
      }
    },
  },
};
</script>

<style>
</style>
<template>
  <span>
    <b-button
      class="mt-1 mb-1"
      @click="assignShow = !assignShow"
      :variant="variant"
      :size="size"
    >
      <i class="fa fa-tv mr-2"></i>
      Assign {{ type === "talks" ? "Talk" : "Show" }}
    </b-button>
    <div
      v-if="assignShow"
      :size="size"
      class="mt-2 mb-2 p-2 rounded"
      style="border: 1px solid #666"
    >
      <b-form-select
        :size="size"
        v-model="showSelect"
        :options="showOptions"
      ></b-form-select>
      <b-button
        v-if="selectedShowID"
        :size="size"
        @click="save"
        variant="success"
        class="mt-2 w-100"
      >
        Save {{ type === "talks" ? "Talk" : "Show" }}
      </b-button>
      <NewShow
        v-if="showSelect === 'new'"
        class="mt-1"
        :youtube_id="defaultYoutubeId"
        :type="type"
        :defaultTitle="defaultTitle"
        @newShow="newShow"
      />
    </div>
  </span>
</template>

<script>
export default {
  props: {
    defaultYoutubeId: String,
    defaultTitle: String,
    defaultSelection: String,
    type: {
      type: String,
      default: "tv-shows",
    },
    variant: {
      type: String,
      default: "gray",
    },
    size: {
      type: String,
      default: "md",
    },
  },
  data() {
    return {
      assignShow: false,
      shows: undefined,
      showSelect: undefined,
      selectedShowID: undefined,
    };
  },
  mounted() {
    let type = this.type === "talks" ? "talks" : "tvShows";

    this.shows = this.$store.state.shows[type][this.$l2.code]
      ? this.$store.state.shows[type][this.$l2.code]
      : undefined;

    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    if (this.defaultSelection && this.shows) {
      this.makeDefaultSelection();
    }
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  watch: {
    shows() {
      this.makeDefaultSelection();
    },
    showSelect() {
      if (this.showSelect && this.showSelect !== "new") {
        this.selectedShowID = this.showSelect;
      }
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    showOptions() {
      if (this.shows) {
        let options = [
          {
            value: "new",
            text: this.type === "talks" ? "New Talk..." : "New TV Show...",
          },
          ...this.shows.map((s) => {
            return {
              value: s.id,
              text: s.title,
            };
          }),
        ];
        return options;
      }
    },
  },
  methods: {
    makeDefaultSelection() {
      let show = this.shows.find((s) => s.title === this.defaultSelection);
      if (show) this.showSelect = show.id;
    },
    loadShows() {
      let type = this.type === "talks" ? "talks" : "tvShows";
      this.shows = this.$store.state.shows[type][this.$l2.code]
        ? this.$store.state.shows[type][this.$l2.code]
        : undefined;
    },
    newShow(newShow) {
      this.selectedShowID = newShow.id;
      this.$emit('newShow', newShow)
      this.save();
    },
    save() {
      this.$emit(
        "assignShow",
        this.selectedShowID,
        this.type === "talks" ? "talk" : "tv_show"
      );
    },
  },
};
</script>

<style>
</style>
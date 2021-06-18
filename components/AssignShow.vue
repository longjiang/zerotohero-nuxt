<template>
  <span>
    <b-button @click="assignShow = !assignShow" variant="gray">
      <i class="fa fa-tv mr-2"></i>
      Assign {{ type === "talks" ? "Talk" : "Show" }}
    </b-button>
    <div
      v-if="assignShow"
      class="mt-2 rounded p-2"
      style="border: 1px solid #ccc"
    >
      <b-form-select
        v-model="showSelect"
        :options="showOptions"
      ></b-form-select>
      <b-button
        v-if="selectedShowID"
        @click="save"
        variant="success"
        class="mt-2 w-100"
      >
        Save {{ type === "talks" ? "Talk" : "Show" }}
      </b-button>
      <NewShow
        v-if="showSelect === 'new'"
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
      default: 'tv-shows'
    }
  },
  data() {
    return {
      assignShow: false,
      shows: undefined,
      talks: undefined,
      showSelect: undefined,
      selectedShowID: undefined,
    };
  },
  mounted() {
    let type = this.type === "talks" ? "talks" : "shows";

    this.shows = this.$store.state.shows[type]
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
    newShow(newShowID) {
      this.selectedShowID = newShowID;
      this.save();
    },
    save() {
      this.$emit("assignShow", this.selectedShowID, this.type === 'talks' ? 'talk' : 'tv_show');
    },
  },
};
</script>

<style>
</style>
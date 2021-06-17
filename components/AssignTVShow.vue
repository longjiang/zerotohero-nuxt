<template>
  <span>
    <b-button @click="assignShow = !assignShow" variant="gray">
      <i class="fa fa-tv mr-2"></i>
      Assign Show
    </b-button>
    <div v-if="assignShow" class="mt-2 rounded p-2" style="border: 1px solid #ccc">
      <b-form-select
        v-model="tvShowSelect"
        :options="tvShowOptions"
      ></b-form-select>
      <b-button v-if="selectedTVShowID" @click="save" variant="success" class="mt-2 w-100">
        Save TV Show
      </b-button>
      <NewTVShow
        v-if="newShow"
        :youtube_id="defaultYoutubeId"
        :defaultTitle="defaultTitle"
        @newTVShow="newTVShow"
      />
    </div>
  </span>
</template>

<script>

export default {
  props: ["defaultYoutubeId", "defaultTitle", "defaultSelection"],
  data() {
    return {
      assignShow: false,
      tvShows: undefined,
      tvShowSelect: undefined,
      selectedTVShowID: undefined
    };
  },
  mounted() {
    this.tvShows = this.$store.state.tvShows.shows ? this.$store.state.tvShows.shows[this.$l2.code] : undefined
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "tvShows/LOAD_TV_SHOWS") {
        this.loadTVShows();
      }
    });
    if (this.defaultSelection && this.tvShows) {
      this.makeDefaultSelection()
    }
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  watch: {
    tvShows() {
      this.makeDefaultSelection()
    },
    tvShowSelect() {
      if (this.tvShowSelect && this.tvShowSelect !== 'new') {
        this.selectedTVShowID = this.tvShowSelect
      }
    }
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
    newShow() {
      return this.tvShowSelect === "new";
    },
    tvShowOptions() {
      if (this.tvShows) {
        let options = [
          {
            value: "new",
            text: "New TV Show...",
          },
          ...this.tvShows.map((s) => {
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
      let show = this.tvShows.find(s => s.title === this.defaultSelection)
      if (show) this.tvShowSelect = show.id
    },
    loadTVShows() {
      this.tvShows = this.$store.state.tvShows.shows[this.$l2.code]
        ? this.$store.state.tvShows.shows[this.$l2.code]
        : undefined;
    },
    newTVShow(newTVShowID) {
      this.selectedTVShowID = newTVShowID
      this.save()
    },
    save() {
      this.$emit('assignTVShow', this.selectedTVShowID)
    }
  }
};
</script>

<style>
</style>
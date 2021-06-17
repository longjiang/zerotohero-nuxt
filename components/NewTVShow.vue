<template>
  <div>
    <b-input
      type="text"
      v-model.lazy="newShowTitle"
      placeholder="Title"
    />
    <b-button
      class="btn btn-small mt-2 ml-0 bg-success text-white"
      @click="addShow()"
    >
      Save Show
    </b-button>
  </div>
</template>

<script>
import Config from '@/lib/config'

export default {
  props: ['youtube_id', 'defaultTitle'],
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
      }
      if (this.newShowYear) show.year = this.newShowYear
      let response = await axios.post(`${Config.wiki}items/tv_shows`, show);
      if (response && response.data) {
        this.$emit('newTVShow', response.data.id)
      }
    },
  },
};
</script>

<style>
</style>
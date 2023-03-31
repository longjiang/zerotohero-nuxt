<template>
  <b-input-group>
    <b-form-input v-model="url" @keyup.enter="goto" placeholder="YouTube URL" />
    <b-input-group-append>
      <b-button variant="danger" @click="goto">{{ $t("Study") }}</b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
export default {
  data() {
    return {
      url: undefined,
    };
  },
  methods: {
    goto() {
      if (this.url) {
        let id = this.url
          .replace("https://youtu.be/", "")
          .replace(/.*\?v=([^&]*).*/, "$1");
        this.$router.push({
          name: "video-view",
          params: { type: "youtube", youtube_id: id },
        });
      }
    },
  },
};
</script>

<style>
</style>
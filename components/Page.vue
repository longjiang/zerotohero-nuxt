<template>
  <v-runtime-template :template="`<div>${body}</div>`" />
</template>

<script>
import VRuntimeTemplate from "v-runtime-template";
import YouTubeVideo from "@/components/YouTubeVideo";

export default {
  components: {
    YouTubeVideo,
    VRuntimeTemplate,
  },
  props: {
    id: {
      type: String,
    },
  },
  data() {
    return {
      title: "",
      body: "",
    };
  },
  mounted() {
    if (this.id) {
      this.load(this.id);
    }
  },
  methods: {
    async load() {
      let response = await this.$directus.get(
        `items/pages/${this.id}?${Date.now()}`
      );
      response = response.data
      this.title = response.data.title;
      this.body = response.data.body;
    },
  },
  computed: {
    isZh() {
      return this.$l2.code === "zh";
    },
  },
};
</script>

<style>
</style>
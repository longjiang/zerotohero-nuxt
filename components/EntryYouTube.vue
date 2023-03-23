<template>
  <Widget>
    <template #title>
      {{ $t("“{text}” videos on YouTube", { text: text }) }}
    </template>
    <template #body><YouTubeSearchResults :term="text" :start="0" /></template>
  </Widget>
</template>

<script>
import YouTubeSearchResults from "@/components/YouTubeSearchResults";

export default {
  components: {
    YouTubeSearchResults,
  },
  props: {
    text: {
      type: String,
    },
  },
};
</script>

<style></style>

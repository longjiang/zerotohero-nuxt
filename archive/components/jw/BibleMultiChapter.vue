<template>
  <div class="jw-study-aid-bible-multi-chapter">
    <JWArticle :url="`https://wol.jw.org${htmlPath}`" />
  </div>
</template>

<script>

export default {
  props: ['htmlPath'],
  data() {
    return {
      chapters: [],
      places: []
    }
  },
  mounted() {

  },
  methods: {
  },
};
</script>

<style>
</style>
<template>
  <span @click="share" style="cursor: pointer" v-if="canShare">
    <i class="fas fa-share mr-1"></i>
    Share
  </span>
</template>

<script>
export default {
  computed: {
    canShare() {
      return typeof navigator !== "undefined" && navigator.share;
    },
  },
  methods: {
    share() {
      if (navigator.share) {
        navigator.share({
          url: location.href,
        });
      }
    },
  },
};
</script>

<style>
</style>
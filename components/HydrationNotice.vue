<template>
  <div>
    <div v-if="!($l1 && $l2)" class="p-3 text-center bg-warning">
      App is asleep due to inactivity. Click here to
      <router-link :to="{ path }">wake up</router-link>
      .
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { path: this.$route.fullPath, loaded: false };
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
};
</script>

<style>
</style>
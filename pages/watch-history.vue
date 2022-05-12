<router>
  {
    path: '/:l1/:l2/youtube/history',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main-dark">
    <div class="container">
      <div class="row pt-5 pb-5">
        <div class="col-sm-12">
          <h3 class="text-center">My Watch History</h3>
          <WatchHistoryComp
            :l2="$l2"
            skin="dark"
            class="mt-3"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
  },
};
</script>
<style>
</style>
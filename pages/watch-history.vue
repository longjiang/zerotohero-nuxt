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
  <div>
    <div class="container">
      <div class="row pb-5">
        <div class="col-sm-12">
          <WatchHistoryComp
            skin="dark"
            class="mt-3"
            :l2="$l2"
            :limit="50"
            :showPlayButton="false"
            :showLanguage="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
  },
};
</script>
<style>
</style>
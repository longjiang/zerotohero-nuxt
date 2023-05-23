<router>
  {
    path: '/:l1/:l2/my-playlists',
    meta: {
      title: 'My Playlists | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'View, manage and share the playlists you created.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pb-4" v-cloak>
    <div class="container">
      <div class="row text-center">
        <div class="col-sm-12">
          <Playlists />
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
</script>
<style lang="scss" scoped>
@import "@/assets/scss/variables.scss";
</style>

<router>
  {
    path: '/:l1/:l2/playlist/:id',
    props: true,
    meta: {
      title: 'Playlist | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'View a playlist.'
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
          <Playlist :id="id" />
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/variables.scss";
</style>

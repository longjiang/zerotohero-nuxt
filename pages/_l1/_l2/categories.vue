<template>
  <div>
    <div class="container pb-5">
      <SocialHead
        :title="`${$t('Video Categories')} | Language Player`"
        :description="`Learn ${$l2.name} with Videos`"
        :image="'/img/tv-shows.jpg'"
      />
      <div class="row">
        <div class="col-sm-12">
          <h3 class="my-4 text-left">{{ $t('Categories') }}</h3>
          <CategoryNav />
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
};
</script>

<style>
  /* Add your styles here */
</style>

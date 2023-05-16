<router>
  {
    path: '/:l1/:l2/about',
    meta: {
      title: 'About | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'About this version of Language Player.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main">
    <div class="container pt-3 pb-5">
      <SocialHead :title="$t('Support and Contact') + ' | Language Player'" />
      <template>
        <div class="row">
          <div class="col-12">
            <h4 class="mb-3">
              {{ $t("About") }}
            </h4>
          </div>
        </div>
        <div class="row">
          
          <div class="col-sm-12 mb-4">
            <p class="mb-4">Language Player is an innovative language learning platform designed to help you master a new language through engaging video content. With its unique subtitle-based learning approach, Language Player immerses you in authentic videos that cater to your interests and skill level. Our platform offers an extensive library of TV shows, movies, and talks to make language learning not just effective, but also fun and enjoyable. </p>
            <h4 class="mb-3">Version Information</h4>
            <VersionInfo />
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12 mb-4">
            <Changelog />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>

export default {
  computed: {
  },
  data() {
    return {
      params: {},
      query: {
        lg: {
          minWidth: 960,
        },
      },
    };
  },
};
</script>

<style lang="scss" scoped>
.contact-block {
  background: #ffffff16;
  border-radius: 0.5rem;
  box-shadow: 0px 5px 20px rgb(0 0 0 / 25%);
  height: 100%;
}
</style>

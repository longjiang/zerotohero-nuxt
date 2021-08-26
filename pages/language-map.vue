<router>
  {
    path: '/language-map',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div>
    <SocialHead
      title="Map of World Languages | Zero to Hero Languages"
      description="Tap on any language label to learn the language! Live TV channels, TV shows with subtitles, music with lyrics, phrasebooks with video examples... everything that can help you to learn a language “by osmosis.”"
      image="/img/thumbnail-language-map.jpg"
    />
    <div class="container-fluid">
      <div class="row bg-dark text-white pt-2 pb-2 text-left" style="overflow: visible">
        <div class="col-sm-12 d-flex" style="overflow: visible">
          <div class="mr-3 d-flex align-items-center">
            <router-link to="/" class="link-unstyled">
              <i class="fa fa-chevron-left mr-2"></i>
              Home
            </router-link>
          </div>
          <LanguageSwitch style="flex: 1" />
        </div>
      </div>
      <div class="row">
        <div class="col-12" style="height: calc(100vh - 54px); padding: 0">
          <LanguageMap style="height: 100%" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
::v-deep .vue2leaflet-map {
  z-index: -1;
}
</style>
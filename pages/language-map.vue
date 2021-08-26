<router>
  {
    path: '/language-map',
    props: true
  }
</router>
<template>
  <div class="main">
    <SocialHead
      title="Map of World Languages | Zero to Hero Languages"
      description="Tap on any language label to learn the language! Live TV channels, TV shows with subtitles, music with lyrics, phrasebooks with video examples... everything that can help you to learn a language “by osmosis.”"
      image="/img/thumbnail-language-map.jpg"
    />
    <div class="container-fluid">
      <div class="row">
        <div class="col-12" style="height: calc(100vh - 10rem); padding: 0">
          <LanguageMap style="height: 100%" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>
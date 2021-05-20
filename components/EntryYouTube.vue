<template>
  <div class="entry-youtube widget">
    <div class="widget-title">{{ $t('“{text}” videos on YouTube', {text: text})}}</div>
    <div class="widget-body jumbotron-fluid p-4">
      <YouTubeSearchResults :term="text" :start="0" />
    </div>
  </div>
</template>

<script>
import YouTube from '@/lib/youtube'
import YouTubeSearchResults from '@/components/YouTubeSearchResults'

export default {
  components: {
    YouTubeSearchResults
  },
  props: {
    text: {
      type: String
    }
  },
}
</script>

<style></style>

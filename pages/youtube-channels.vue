<router>
  {
    path: '/:l1/:l2/youtube/channels',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div :class="`youtube-browse skin-${$skin}`">
    <div class="youtube-browse container pt-5 pb-5">
      <SocialHead
        :title="`Study ${$l2.name} videos with subs | Language Player`"
        :description="`Watch ${$l2.name} videos and study the ${
          $l2.code === 'zh' ? 'Pinyin' : $l2.name
        } subtitles.`"
      />
      <div class="row mb-4">
        <div class="col-sm-12">
          <ChannelList :collapse="false" :channels="channels.filter(c => c.l2 === this.$l2.id)" />
        </div>
      </div>
      <client-only>
        <NavPage
          :l1="$l1"
          :l2="$l2"
          class="youtube-browse-nav mt-5"
          :showOnly="['Listening']"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";


export default {
  props: {
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapState("channels", ["channels"]),
  },
  watch: {
  },
  methods: {
    filterChannel(channels) {
      return channels.filter(channel => channel.l2 === this.$l2.code);
    },
  },
};
</script>
<style lang="scss" scoped>
</style>

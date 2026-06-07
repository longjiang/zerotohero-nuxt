// pages/_l1/_l2/youtube/channels.vue
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
          <b-input-group class="mb-4">
            <b-form-input
              v-model="keyword"
              @compositionend.prevent.stop="() => false"
              :placeholder="
                $t('Filter {num} {l2} YouTube Channels...', {
                  num: filteredChannels ? filteredChannels.length : '',
                  l2: $t($l2.name)
                })
              "
              ref="filter"
              :class="{
                'input-ghost-dark': $skin === 'dark',
              }"
            />
          </b-input-group>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-sm-12">
          <ChannelList :collapse="false" :channels="filteredChannels" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {},
  data() {
    return {
      // Added reactive keyword data property initialized as empty string
      keyword: "",
    };
  },
  computed: {
    ...mapState("channels", ["channels"]),
    
    // Added computed filtered structural layout to replicate Shows.vue strategy
    filteredChannels() {
      if (!this.channels) return [];
      
      // Step 1: Isolate by structural language matching criteria
      let filtered = this.channels.filter(c => c.l2 === this.$l2.id);
      
      // Step 2: Apply conditional keyword text containment scanning
      if (this.keyword) {
        const cleanKeyword = this.keyword.toLowerCase().trim();
        filtered = filtered.filter((channel) => {
          return channel.title && channel.title.toLowerCase().includes(cleanKeyword);
        });
      }
      
      return filtered;
    }
  },
  watch: {},
  methods: {
    filterChannel(channels) {
      return channels.filter(channel => channel.l2 === this.$l2.code);
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
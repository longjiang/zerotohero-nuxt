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
      
      <!-- Row 1: Search Filter Box -->
      <div class="row">
        <div class="col-sm-12">
          <b-input-group>
            <b-form-input
              v-model="keyword"
              @compositionend.prevent.stop="() => false"
              :placeholder="
                $t('Filter {num} channels...', {
                  num: filteredChannels ? filteredChannels.length : '',
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

      <!-- Row 2: Subscribed Only Toggle Line -->
      <div class="row mb-4 mt-2" v-if="$auth.loggedIn">
        <div class="col-sm-12">
          <b-form-checkbox v-model="showOnlySubscribed" switch>
            {{ $t("Subscribed only") }}
          </b-form-checkbox>
        </div>
      </div>

      <!-- Channels List Output -->
      <div class="row mb-4">
        <div class="col-sm-12">
          <ChannelList :collapse="false" :channels="filteredChannels" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  props: {},
  data() {
    return {
      keyword: "",
      showOnlySubscribed: false,
    };
  },
  computed: {
    ...mapState("channels", ["channels"]),
    ...mapState("channelPreferences", ["subscribedChannels"]),
    
    filteredChannels() {
      if (!this.channels) return [];
      
      // Step 1: Isolate by structural language matching criteria
      let filtered = this.channels.filter(c => c.l2 === this.$l2.id);
      
      // Step 2: Filter by subscription status if toggle is active
      if (this.showOnlySubscribed && this.subscribedChannels) {
        filtered = filtered.filter(channel => 
          this.subscribedChannels.includes(channel.id) || this.subscribedChannels.includes(channel.channel_id)
        );
      }
      
      // Step 3: Apply conditional keyword text containment scanning
      if (this.keyword) {
        const cleanKeyword = this.keyword.toLowerCase().trim();
        filtered = filtered.filter((channel) => {
          return channel.title && channel.title.toLowerCase().includes(cleanKeyword);
        });
      }
      
      return filtered;
    }
  },
  async mounted() {
    if (this.$auth.loggedIn) {
      try {
        await this.loadChannelPreferences(this.$l2);
      } catch (error) {
        console.error("Failed to load channel preferences:", error);
      }
    }
  },
  methods: {
    ...mapActions("channelPreferences", ["loadChannelPreferences"]),
    filterChannel(channels) {
      return channels.filter(channel => channel.l2 === this.$l2.code);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
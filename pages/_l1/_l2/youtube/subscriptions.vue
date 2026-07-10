<!-- /pages/_l1/_l2/youtube/subscriptions.vue -->
<template>
  <div class="main">
    <div class="container pt-5 pb-5 youtube-subscriptions">
      
      <h4 class="mb-5 text-center">
        {{ $t("Subscribed Channels Content") }}
      </h4>

      <div v-if="!$auth.loggedIn" class="text-center mt-5">
        <p class="text-muted">{{ $t("Please log in to see your subscribed channels.") }}</p>
      </div>

      <div v-else-if="loading" class="text-center mt-5">
        <i class="fa fa-spinner fa-spin fa-2x text-muted"></i>
        <p class="text-muted mt-2">{{ $t("Loading subscriptions...") }}</p>
      </div>

      <div v-else-if="subscribedChannels.length === 0" class="text-center mt-5">
        <p class="text-muted">
          {{ $t("You haven't subscribed to any channels yet.") }}
        </p>
        <router-link
          :to="`/${$l1.code}/${$l2.code}/youtube/search`"
          class="btn btn-primary mt-3"
        >
          <i class="fa fa-search mr-1"></i> {{ $t("Browse Channels") }}
        </router-link>
      </div>

      <div v-else>
        <MediaSearchResults 
          :params="mediaSearchParams" 
          :skin="$skin"
          noVideosMessage="No videos found from your subscribed channels."
        />
      </div>
    </div>
  </div>
</template>

<script>
import MediaSearchResults from "@/components/MediaSearchResults";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    MediaSearchResults,
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    ...mapState("channelPreferences", ["subscribedChannels"]),
    
    // Dynamically formats the multi-channel criteria matching directus syntax requirements
    mediaSearchParams() {
      if (!this.subscribedChannels || this.subscribedChannels.length === 0) {
        return {};
      }
      return {
        "filter[channel_id][in]": this.subscribedChannels.join(","),
        "sort": "-date" // Sorts by video date descending (newest first)
      };
    },
  },
  async mounted() {
    await this.fetchPreferences();
  },
  methods: {
    ...mapActions("channelPreferences", ["loadChannelPreferences"]),
    async fetchPreferences() {
      if (this.$auth.loggedIn) {
        this.loading = true;
        try {
          await this.loadChannelPreferences(this.$l2);
        } catch (error) {
          console.error("Failed to load channel preferences:", error);
        } finally {
          this.loading = false;
        }
      }
    },
  },
};
</script>
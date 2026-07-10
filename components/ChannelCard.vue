// components/ChannelCard.vue
<template>
  <div class="channel-card-container">
    <router-link
      class="channel-card link-unstyled w-100"
      :to="{ name: 'l1-l2-youtube-channel', params: { title, channel_id } }"
    >
      <div class="d-flex align-items-center flex-grow-1 min-w-0">
        <img :src="thumbnail" class="channel-thumbnail flex-shrink-0" @error="handleImageError" />

        <div class="channel-info min-w-0">
          <h6 class="mb-0 text-truncate">{{ title }}</h6>

          <div class="channel-stats">
            <div>
              {{
                $t("{count} Subscribers", {
                  count: formatK(subscribers, 2, $l1.code),
                })
              }}・{{
                $t("{num} Videos", { 
                  num: formatK(video_count, 2, $l1.code) 
                })
              }}
            </div>
          </div>
        </div>
      </div>

      <div class="channel-action ml-3" v-if="$auth.loggedIn">
        <button
          :class="['btn btn-sm subscription-toggle-btn', isSubscribed ? 'btn-secondary' : 'btn-primary']"
          @click.stop.prevent="toggleSubscription"
          :disabled="updating"
        >
          <i v-if="updating" class="fa fa-spinner fa-spin mr-1"></i>
          <template v-else>
            <i :class="['fa mr-1', isSubscribed ? 'fa-check' : 'fa-user-friends']"></i>
          </template>
          {{ isSubscribed ? $t("Subscribed") : $t("Subscribe") }}
        </button>
      </div>
    </router-link>
  </div>
</template>

<script>
import { formatK } from "../lib/utils";

export default {
  props: {
    channel_id: String,
  },
  data() {
    return {
      date: null,
      description: null,
      thumbnail: null,
      title: null,
      custom_url: null,
      country: null,
      views: null,
      video_count: null,
      subscribers: null,
      placeholder: '/img/placeholder-faded.png',
      updating: false
    };
  },
  computed: {
    isSubscribed() {
      return this.$store.getters["channelPreferences/isSubscribed"](this.channel_id);
    }
  },
  mounted() {
    const channel = this.$store.getters["channels/getChannelbyChannelIdAndL2Id"](
      this.channel_id, this.$l2.id
    );
    if (channel) {
      this.date = channel.date;
      this.description = channel.description;
      this.thumbnail = channel.thumbnail;
      this.title = channel.title;
      this.custom_url = channel.custom_url;
      this.country = channel.country;
      this.views = channel.views;
      this.video_count = channel.video_count;
      this.subscribers = channel.subscribers;
    }
  },
  methods: {
    formatK,
    handleImageError(event) {
      event.target.src = this.placeholder;
    },
    async toggleSubscription() {
      if (this.updating) return;
      this.updating = true;
      
      const nextStatus = this.isSubscribed ? 'neutral' : 'subscribed';
      
      try {
        const result = await this.$store.dispatch("channelPreferences/saveChannelPreference", {
          channelId: this.channel_id,
          l2: this.$l2,
          status: nextStatus
        });

        if (result) {
          if (nextStatus === 'subscribed') {
            this.$toast.success(this.$t("Subscribed"), {
              duration: 2000,
            });
          } else {
            this.$toast.success(this.$t("Unsubscribed"), {
              duration: 2000,
            });
          }
        } else {
          this.$toast.error(this.$t("Failed to update subscription. Please try again."));
        }
      } catch (error) {
        console.error("Failed to update channel preference:", error);
        this.$toast.error(this.$t("An error occurred. Please try again."));
      } finally {
        this.updating = false;
      }
    }
  }
};
</script>

<style scoped lang="scss">
.channel-card-container {
  display: flex;
  width: 100%;
}

.channel-stats {
  opacity: 0.7;
  line-height: 1.33;
  margin-top: 0.2rem;
  font-size: 0.8em;
}

.channel-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  overflow: hidden;
}

.channel-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.channel-info h3 {
  margin: 0;
}

.min-w-0 {
  min-width: 0;
}

.subscription-toggle-btn {
  font-weight: 600;
  padding: 0.25rem 1rem;
  white-space: nowrap;
}
</style>
<template>
  <router-link
    class="channel-card link-unstyled"
    :to="{ name: 'l1-l2-youtube-channel', params: { title, channel_id } }"
  >
    <img :src="thumbnail" class="channel-thumbnail" @error="handleImageError" />

    <div class="channel-info">
      <h6 class="mb-0">{{ title }}</h6>

      <div class="channel-stats">
        <div>
          {{
            $t("{count} Subscribers", {
              count: formatK(subscribers, 2, $l1.code),
            })
          }}
        </div>
        <!-- <div>
          {{
            $t("{count} Videos", { count: formatK(video_count, 2, $l1.code) })
          }}
        </div> -->
      </div>

      <!-- <small class="channel-description" style="opacity: 0.5">{{ description }}</small> -->
    </div>
  </router-link>
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
      placeholder: '/img/placeholder-faded.png' // path to your placeholder channel image
    };
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
      event.target.src = this.placeholder; // change the source to placeholder image
    }
  }
};
</script>

<style scoped lang="scss">
.channel-stats {
  opacity: 0.7;
  line-height: 1.33;
  margin-top: 0.2rem;
  font-size: 0.8em;
}
.channel-card {
  display: flex;
  align-items: flex-start;
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

.channel-description {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

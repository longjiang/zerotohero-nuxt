<template>
  <div class="channel-card">
    <img :src="thumbnail" alt="Channel Thumbnail" class="channel-thumbnail" />

    <div class="channel-info">
      <h6 class="mb-0">{{ title }}</h6>

      <div class="channel-stats"  style="opacity: 0.7">
        <small>{{ $t('{count} Subscribers', { count: formatK(subscribers, 2, $l1.code) }) }}</small>
        <!-- <small >{{ $t('{count} Videos', { count: formatK(video_count, 2, $l1.code) }) }}</small> -->
      </div>

      <!-- <small class="channel-description" style="opacity: 0.5">{{ description }}</small> -->
    </div>
  </div>
</template>

<script>
import { formatK } from "@/lib/utils";
export default {
  props: {
    date: String,
    description: String,
    thumbnail: String,
    title: String,
    channel_id: String,
    custom_url: String,
    country: String,
    views: Number,
    video_count: Number,
    subscribers: Number
  },
  methods: {
    formatK
  }
}
</script>

<style scoped>
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

.channel-stats {
  display: flex;
  gap: 10px;
}

.channel-description {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

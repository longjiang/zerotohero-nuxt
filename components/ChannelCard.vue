<template>
  <div class="channel-card">
    <img :src="thumbnail" alt="Channel Thumbnail" class="channel-thumbnail" />

    <div class="channel-info">
      <h3>{{ title }}</h3>

      <div class="channel-stats">
        <span>{{ $t('{count} Subscribers', { count: subscribers }) }}</span>
        <span>{{ $t('{count} Videos', { count: video_count }) }}</span>
      </div>

      <div class="channel-description">{{ description }}</div>
    </div>
  </div>
</template>

<script>
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
  }
}
</script>

<style scoped>
.channel-card {
  display: flex;
  align-items: center;
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
  font-size: 18px;
  margin: 0;
}

.channel-stats {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.channel-description {
  font-size: 14px;
  color: #888;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

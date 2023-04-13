<template>
  <router-link
    :to="`/${$l1.code}/${$l2.code}/youtube/channel/${
      channel.id
    }/${encodeURIComponent(channel.title)}`"
    class="link-unstyled channel"
  >
    <img
      v-if="channel.avatar"
      :src="channel.avatar"
      class="channel-avatar"
      alt
    />
    <div class="channel-body">
      <h6 v-if="channel.title">
        Channel:
        <span>{{ channel.title }}</span>
      </h6>
      <h6 v-else>
        View Channel
        <i class="fa fa-chevron-right ml-1"></i>
      </h6>
      <div v-if="channel.description">
        <div>{{ channel.description }}</div>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    channel: {
      type: Object,
    },
  },
};
</script>

<style>
.channel {
  display: flex;
  align-items: top;
}
.channel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.channel-avatar {
  border-radius: 100%;
  height: 4rem;
  float: left;
  margin-right: 1rem;
}
</style>

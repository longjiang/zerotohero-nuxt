<template>
  <div class="resource media rounded shadow">
    <router-link :to="resource.url" v-if="internal" class="link-unstyled">
      <img :src="resource.thumbnail" class="resource-thumbnail img-fluid" />
      <div class="media-body">
        <h6>
          <span>{{ resource.title }}</span>
        </h6>
        <div>{{ resource.description }}</div>
      </div>
    </router-link>
    <a :href="resource.url" v-else target="_blank" class="link-unstyled">
      <img :src="resource.thumbnail" class="resource-thumbnail img-fluid" />
      <div class="media-body">
        <h6>
          <span>{{ resource.title }}</span>
        </h6>
        <div>{{ resource.description }}</div>
      </div>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    resource: {
      type: Object
    },
    internal: { // Whether this is a resource that is part of this app, linked through router-link
      type: Boolean,
      default: false
    },
  }
};
</script>

<style>
.resource {
  min-width: 15rem;
  max-width: 480px;
  flex: 1;
}
.resource-thumbnail {
  width: 100%;
}
</style>
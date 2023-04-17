<template>
  <div :class="`resource media rounded shadow skin-${$skin}`">
    <router-link :to="resource.url" v-if="internal" class="link-unstyled">
      <img :src="resource.thumbnail" v-if="showThumbnail" class="resource-thumbnail img-fluid" />
      <div class="media-body">
        <h6 :data-level="level">
          <span>{{ resource.title }}</span>
        </h6>
        <div>{{ resource.description }}</div>
        <div class="mt-3 text-right">
          <router-link :to="resource.url" :data-level="level" class="link-unstyled">
            {{ buttonText }}
            <i class="fa-solid fa-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </router-link>
    <a :href="resource.url" v-if="!internal" target="_blank" class="link-unstyled">
      <img :src="resource.thumbnail" v-if="showThumbnail" class="resource-thumbnail img-fluid" />
      <div class="media-body">
        <h6 :data-level="level">
          <span>{{ resource.title }}</span>
        </h6>
        <div>{{ resource.description }}</div>
        <div class="mt-3 text-right">
          <a :href="resource.url" target="_blank" :data-level="level"  class="link-unstyled text-success">
            {{ $t(buttonText) }}
            <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i>
          </a>
        </div>
      </div>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    buttonText: {
      type: String,
      default: "Open Resource",
    },
    resource: {
      type: Object,
    },
    level: {
      type: String,
    },
    internal: {
      // Whether this is a resource that is part of this app, linked through router-link
      type: Boolean,
      default: false,
    },
    showThumbnail: {
      type: Boolean,
      default: true
    }
  },
};
</script>

<style lang="scss">
@import "~@/assets/scss/variables.scss";

.resource {
  min-width: 15rem;
  max-width: 480px;
  flex: 1;
  &.skin-light {
    background-color: #fff;
    border: 1px solid #ddd;
  }
  &.skin-dark {
    background-color: $bg-color-dark-2;
    border: 1px solid $bg-color-dark-3;
  }
}
.resource-thumbnail {
  width: 100%;
}
</style>
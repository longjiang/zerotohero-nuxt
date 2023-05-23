<template>
  <div class="video-thumbnail-stack">
    <div class="deck3"></div>
    <div class="deck2"></div>
    <div class="deck1"></div>
    <div
      :class="{
        'tv-show-card media': true,
        [`skin-${$skin}`]: true,
      }"
    >
      <router-link
        class="youtube-thumbnail-wrapper aspect-wrapper d-block"
        :to="to"
      >
        <img
          :src="thumbnail"
          class="youtube-thumbnail aspect"
        />
      </router-link>
      <div class="tv-show-card-title">
        <router-link :to="to" class="link-unstyled">
          <h6 class="mb-0">
            {{ title }}
            <slot name="afterTitle"></slot>
          </h6>
        </router-link>
        <slot name="belowTitle"></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    to: {
      type: [Object, String],
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
    },
    description: {
      type: String,
    },
  },
};
</script>
<style lang="scss" scoped>

.video-thumbnail-stack {
  position: relative;
}


.deck1,
.deck2,
.deck3 {
  height: 4rem;
  position: absolute;
  left: 0.5rem;
  width: calc(100% - 1rem);
  border-radius: 0.25rem;
}

.deck1 {
  top: -0.5rem;
  transform: scale(0.95);
}

.deck2 {
  top: -1rem;
  transform: scale(0.9);
  opacity: 0.66;
}

.deck3 {
  top: -1.4rem;
  transform: scale(0.85);
  opacity: 0.33;
}

.skin-dark {
  .deck1,
  .deck2,
  .deck3 {
    background-color: #767676;
    box-shadow: 1px -3px 4px #00000070;
    border: 1px solid rgb(138, 138, 138);
  }
}

.skin-light {
  .deck1,
  .deck2,
  .deck3 {
    background-color: #ffffff;
    box-shadow: 1px -3px 4px #00000019;
    border: 1px solid rgb(217, 217, 217);
  }
}




:deep(.media-body) {
  font-size: 0.9em;
}
.tv-show-card {
  position: relative;
  height: 100%;
  margin-top: 2rem;

  &.tv-show-card-hidden {
    opacity: 0.3;
  }

  .youtube-thumbnail {
    border-radius: 0.25rem;
  }

  .tv-show-card-title {
    padding-top: 0.5rem;

    a {
      z-index: 1;
      width: 100%;
    }
  }
}
</style>
<template>
  <div
    :class="{'image-wall': true, 'image-wall-hover': hover}"
    :key="`web-images-${text}`"
    v-cloak
    v-if="images && images.length > 0"
  >
    <img
      alt
      class="image-wall-image"
      v-for="(image, index) in images.slice(0, limit)"
      :key="`web-images-${text}-${index}`"
      :src="`${IMAGE_PROXY}?${image.src}`"
      @click="goto(image.url)"
    />
  </div>
</template>

<script>
import WordPhotos from "../lib/word-photos";
import { IMAGE_PROXY } from "../lib/utils";

export default {
  props: {
    text: {
      type: String,
    },
    limit: {
      type: String,
      default: "20",
    },
    entry: {
      default: undefined,
    },
    preloaded: {
      type: Array,
    },
    link: {
      type: Boolean,
      default: true
    },
    hover: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      IMAGE_PROXY,
      images: [],
    };
  },
  async created() {
    if (this.preloaded && this.preloaded.length > 0)
      this.images = this.preloaded;
    else {
      let scraped = await WordPhotos.getGoogleImages({
        term: this.text,
        lang: this.$l2.code,
      });
      let images = scraped.slice(0, this.limit);
      this.images = images;
      this.$emit("loaded", this.images);
    }
  },
  methods: {
    goto(url) {
      if (this.link) window.open(url);
    },
  },
};
</script>

<style lang="scss" scoped>
.image-wall {
  display: flex;
  flex-wrap: wrap;
}

.image-wall-hover:hover img {
  opacity: 0.5;
  &:hover {
    opacity: 1;
    transform: scale(1.3);
    z-index: 5;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    transition: 200ms all ease;
  }
}

.image-wall-image {
  object-fit: cover;
  flex: 1;
  height: 7.5rem;
  width: auto;
  background-color: #f5f5f5;
  cursor: pointer;
  margin: 0.2rem;
  max-width: 15rem;
}
.image-wall-image:last-child {
  flex: 0;
}
</style>

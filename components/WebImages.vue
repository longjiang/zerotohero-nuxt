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
      :v-lazy="`${Config.imageProxy}?${image.src}`"
      @click="goto(image.url)"
    />
  </div>
</template>

<script>
import WordPhotos from "@/lib/word-photos";
import Config from "@/lib/config";

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
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
  },
  async fetch() {
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
  data() {
    return {
      Config,
      images: [],
    };
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

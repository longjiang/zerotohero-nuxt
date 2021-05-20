<template>
  <div class="web-images widget">
    <div class="widget-title">{{ $t('Images of “{text}” on the Web', {text: text}) }}</div>
    <div class="widget-body jumbotron-fluid p-4">
      <div
        class="image-wall"
        :key="`web-images-${text}`"
        v-cloak
        v-if="images && images.length > 0"
      >
        <img
          alt
          class="image-wall-image"
          v-for="(image, index) in images.slice(0, limit)"
          :key="`web-images-${text}-${index}`"
          :src="`${Config.imageProxy}?${image.src}`"
          @click="goto(image.url)"
        />
      </div>
      <p class="mt-4">
        See more images of of “{{ text }}” on
        <a
          :href="
            `https://www.google.com/search?q=${text.replace(/ /g, '+')}&tbm=isch&sout=1#spf=1567955197854`
          "
        >
          <img src="/img/logo-google-images.png" alt="Google Images" class="logo-small ml-2" />
        </a>
      </p>
    </div>
  </div>
</template>

<script>
import WordPhotos from '@/lib/word-photos'
import Config from '@/lib/config'
import Vue from 'vue'

export default {
  props: {
    text: {
      type: String
    },
    limit: {
      type: String,
      default: '20'
    },
    entry: {
      default: undefined
    }
  },
  methods: {
    async update() {
      this.images = []
      let images = (await WordPhotos.getGoogleImages({
        term: this.text,
        lang: this.$l2.code
      })).slice(0, this.limit)
      this.images = images
      this.$emit('loaded', this.images)
      if (this.entry) {
        Vue.set(this.entry, 'images', this.images)
      }
    },
    goto(url) {
      window.open(url)
    }
  },
  watch: {
    text() {
      this.update()
    }
  },
  created() {
    if (this.images.length === 0) {
      this.update()
    }
  },
  data() {
    return {
      Config,
      images: []
    }
  }
}
</script>

<style lang="scss">
.image-wall {
  display: flex;
  flex-wrap: wrap;
}

.image-wall:hover img {
  opacity: 0.5;
  &:hover {
    opacity: 1;
    transform: scale(1.3);
    z-index: 5;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
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

<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { IMAGE_PROXY } from "@/lib/utils";
export default {
  async mounted() {
    this.testTokenizer();
  },
  methods: {
    async testVideoUnavailable() {
      console.log('Available: ', await this.videoUnavailable("8SHf6wmX5MU")); // available
      console.log('Unavailable: ', await this.videoUnavailable("yx8NF4EF9iA")); // unavailable
    },
    async testTokenizer() {
      let dictionary = await this.$getDictionary();
      if (dictionary.tokenizeWithCache) {
      let tokens = await dictionary.tokenizeWithCache("水雞泅泡茶");
        console.log({ tokens });
      }
    },
    detectCircularReferences(obj, path = []) {
      if (typeof obj !== "object" || obj === null) {
        return;
      }

      if (path.includes(obj)) {
        console.log("Circular reference detected:", path);
        return;
      }

      path.push(obj);

      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          this.detectCircularReferences(obj[key], path.slice());
        }
      }
    },
    videoUnavailable(youtube_id) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Handle CORS
        img.src = `${IMAGE_PROXY}?https://img.youtube.com/vi/${youtube_id}/hqdefault.jpg`;

        img.onload = function () {
          resolve(false);
        };

        img.onerror = function () {
          resolve(true)
        };
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>

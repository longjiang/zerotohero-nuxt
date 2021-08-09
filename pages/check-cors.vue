<router>
  {
    path: '/:l1/:l2/check-cors'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 mb-5">
      <h4>Check if URLs are blocked by CORS policy</h4>
      <b-progress
        class="mt-3"
        variant="success"
        v-if="totalURLCount > 0 && checkedURLCount < totalURLCount"
        :value="checkedURLCount"
        :max="totalURLCount"
        animated
      ></b-progress>
      <span v-if="totalURLCount > 0 && totalURLCount === checkedURLCount">
        All done! 🍺
      </span>
      <div class="row mt-4">
        <div class="col-md-6">
          Enter a list of URLs to check ({{ urls.split("\n").filter(l => l !== '').length}}):
          <b-form-textarea
            v-model="urls"
            :lazy="true"
            style="height: calc(100vh - 10rem)"
          ></b-form-textarea>
        </div>
        <div class="col-md-6">
          Allowed URLs ({{ allowed.split("\n").filter(l => l !== '').length}}):
          <b-form-textarea
            v-model="allowed"
            :lazy="true"
            style="height: calc(48vh - 5rem)"
            class="mb-3"
          ></b-form-textarea>
          Blocked URLs ({{ blocked.split("\n").filter(l => l !== '').length}}):
          <b-form-textarea
            v-model="blocked"
            :lazy="true"
            style="height: calc(48vh - 5rem)"
          ></b-form-textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
export default {
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
  },
  data() {
    return {
      urls: "",
      allowed: "",
      blocked: "",
      totalURLCount: undefined,
      checkedURLCount: undefined,
      timeout: 3000,
      threads: 3,
    };
  },
  async mounted() {},
  watch: {
    urls() {
      this.allowed = "";
      this.blocked = "";
      this.checkURLs();
    },
  },
  methods: {
    async checkURL(url) {
      try {
        let res = await axios.get(url, { timeout: this.timeout });
        if (res && res.data) this.allowed = this.allowed + url + "\n";
      } catch (err) {
        this.blocked = this.blocked + url + "\n";
      }
      this.checkedURLCount++;
    },
    async checkURLBatch(urls) {
      for (let url of urls) {
        await this.checkURL(url)
      }
    },
    async checkURLs() {
      let urls = this.urls.split("\n");
      this.totalURLCount = urls.length;
      this.checkedURLCount = 0;
      let chunks = Helper.arrayChunk(urls, Math.ceil(urls.length / this.threads));
      for (let urls of chunks) {
        this.checkURLBatch(urls)
      }
    },
  },
};
</script>

<style>
</style>
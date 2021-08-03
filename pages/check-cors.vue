<router>
  {
    path: '/:l1/:l2/check-cors'
  }
</router>
<template>
  <div>
    <div class="main container mt-5 mb-5">
      <h4>Check if URLs are blocked by CORS policy</h4>
      <b-progress class="mt-3" variant="success" v-if="totalURLCount > 0 && checkedURLCount < totalURLCount" :value="checkedURLCount" :max="totalURLCount" animated></b-progress>
      <span v-if="totalURLCount > 0 && totalURLCount === checkedURLCount">All done! 🍺</span>
      <div class="row mt-4">
        <div class="col-md-6">
          Enter a list of URLs to check:
          <b-form-textarea
            v-model.lazy="urls"
            style="height: calc(100vh - 10rem)"
          ></b-form-textarea>
        </div>
        <div class="col-md-6">
          Allowed URLs:
          <b-form-textarea
            v-model.lazy="allowed"
            style="height: calc(48vh - 5rem)"
            class="mb-3"
          ></b-form-textarea>
          Blocked URLs:
          <b-form-textarea
            v-model.lazy="blocked"
            style="height: calc(48vh - 5rem)"
          ></b-form-textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      checkedURLCount: undefined
    };
  },
  async mounted() {
  },
  watch: {
    urls() {
      this.allowed = "";
      this.blocked = "";
      this.checkURLs();
    },
  },
  methods: {
    async checkURLs() {
      let urls = this.urls.split("\n")
      this.totalURLCount = urls.length
      this.checkedURLCount = 0
      for (let url of urls) {
        try {
          let res = await axios.get(url);
          if (res && res.data) this.allowed = this.allowed + url + "\n";
        } catch (err) {
          this.blocked = this.blocked + url + "\n";
        }
        this.checkedURLCount++
      }
    },
  },
};
</script>

<style>
</style>
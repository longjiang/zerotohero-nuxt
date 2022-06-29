<router>
  {
    path: '/:l1/:l2/page/:id/:title?',
    props: true
  }
</router>
<template>
  <div class="main page pt-5 pb-5">
    <div class="container" v-if="page">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="mb-5">{{ page.title }}</h3>
          <div v-html="marked" ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Marked from "marked";
import Config from "@/lib/config";

export default {
  props: {
    id: [Number, String],
  },
  data() {
    return {
      page: undefined,
    };
  },
  computed: {
    marked() {
      if (this.page && this.page.body)
        return (
          Marked(this.page.body.replace(/^ {4,}/gm, "")) || this.page.body // We remove any FOUR CONSECUTIVE SPACES because they would emit <code>!
        );
    },
  },
  async created() {
    try {
      let res = await this.$directus.get(`items/pages/${this.id}`);
      if (res && res.data && res.data.data) {
        this.page = res.data.data;
      }
    } catch (err) {
      Helper.logError(err);
    }
  },
};
</script>

<style>
</style>
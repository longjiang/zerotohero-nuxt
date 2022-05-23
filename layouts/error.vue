<template>
  <div
    :style="`min-height: 100vh; background-image: url(${background()}); background-size: cover; background-position: center;`"
  >
    <div class="container">
      <div class="row">
        <div class="col-sm-12 text-center">
          <div
            v-if="!$route.params || !$route.params.l1"
            style="font-size: 2rem; color: white"
          >
            <img
              src="/img/czh-icon.png"
              style="height: 5.5rem; margin-bottom: 1rem; margin-top: 3rem"
              data-not-lazy
            />
            <br />
            <b>Hero to Zero 😭</b>
          </div>
          <div class="error-page">
            <h3 v-if="error.statusCode === 404">Route Not Found</h3>
            <h3 v-else>A {{ error.statusCode }} error has occurred.</h3>
            <p v-if="error.statusCode === 404">
              The route you requested
              <code>{{ $route.path }}</code>
              is invalid.
            </p>
            <a href="/">Go back to the home page</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  props: ["error"],
  layout: "error",
  mounted() {
    console.log(this.error);
  },
  methods: {
    background(...args) {
      return Helper.background(...args);
    },
  },
};
</script>
<style scoped>
.error-page {
  margin: 2rem 0px 5rem 0;
  padding: 2rem;
  text-align: center;
  border-radius: 1rem;
  overflow: hidden;
  background: white;
}
</style>
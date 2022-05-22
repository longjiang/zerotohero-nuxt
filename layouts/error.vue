<template>
  <div>
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
            <h1 v-if="error.statusCode === 404">Route Not Found</h1>
            <h1 v-else>A {{ error.statusCode }} error has occurred.</h1>
            <p v-if="error.statusCode === 404">
              The route you requested
              <code>{{ $route.path }}</code>
              is invalid.
            </p>
            <NuxtLink to="/">Go back to the home page</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["error"],
  layout: "error",
  mounted() {
    console.log(this.error);
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
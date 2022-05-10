<template>
  <div>
    <SiteTopBar />
    <div class="container">
      <div class="row">
        <div class="col-sm-12 bg-white error-page">
          <h1 v-if="error.statusCode === 404">Route Not Found</h1>
          <h1 v-else>An {{ error.statusCode }} error has occurred.</h1>
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
</template>

<script>
export default {
  props: ["error"],
  layout: "error",
};
</script>
<style scoped>
.error-page {
  margin: 5rem 0px;
  padding: 2rem;
  text-align: center;
  border-radius: 1rem;
}
</style>
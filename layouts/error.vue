<template>
  <div
    :style="`min-height: 100vh; background-image: url(/img/background-earth-vector-bw.jpg); background-size: cover; background-position: center;`"
  >
    <div class="container">
      <div class="row">
        <div class="col-sm-12 text-center pt-4">
          <div style="font-size: 2rem; color: white">
            <div style="font-size: 3rem">😭</div>
            <b>“Hero to Zero”</b>
          </div>
          <div class="error-page">
            <h3 v-if="error.statusCode === 404">Route Not Found</h3>
            <h3 v-else>A {{ error.statusCode }} error has occurred.</h3>
            <p v-if="error.statusCode === 404">
              The route you requested
              <code>{{ $route.path }}</code>
              is invalid.
            </p>
            <p class="mt-3">
              Send a 🐛 bug report with a
              <a
                :href="`mailto:jon.long@zerotohero.ca?subject=Bug%20Report&body=Hi%20Jon%2C%0D%0A%0D%0AI%20found%20a%20bug%20on%20Zero%20to%20Hero!%0D%0A%0D%0AURL%3A%20${host + $route.fullPath}%0D%0A%0D%0AError%20code%3A%20${error.statusCode}%0D%0A%0D%0AFull%20error%3A%20${JSON.stringify(error)}%0D%0A%0D%0APlease%20fix%20it%20quick%2C%20we're%20counting%20on%20you!`"
              >
                <i class="fas fa-paper-plane"></i>
                one-click email
              </a>
            </p>
            <b-button
              variant="unstyled p-0 text-success"
              @click="$router.back()"
            >
              <i class="fas fa-chevron-left"></i>
              Back
            </b-button>
            <router-link
              to="/dashboard"
              class="btn btn-unstyled ml-2 text-success"
              v-if="$auth.loggedIn"
              title="Dashboard"
            >
              <i class="fas fa-tachometer-alt"></i>
              Dashboard
            </router-link>
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
  data() {
    return {
      host: process.server ? process.env.baseUrl : window.location.protocol + '//' + window.location.hostname + ':' + window.location.port
    }
  },
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
<router>
  {
    name: 'error',
    path: '/',
    meta: {
      layout: 'full',
      skin: 'dark'
    }
  }
</router>
<template>
  <div
    :style="`min-height: 100vh; background-image: url(${background}); background-size: cover; background-position: center;`"
  >
    <client-only>
      <SiteTopBar
        skin="dark"
        variant="menu-bar"
      />
    </client-only>
    <div class="container">
      <div class="row">
        <div class="col-sm-12 text-center pt-4">
          <div class="error-page">
            <h3 v-if="error.statusCode === 404">Route Not Found</h3>
            <h3 v-else>A {{ error.statusCode }} error has occurred.</h3>
            <p v-if="error.statusCode === 404">
              The route you requested
              <code>{{ $route.path }}</code>
              is invalid.
            </p>
            <p class="mt-3">
              <a
                class="btn btn-success"
                :href="`mailto:jon.long@zerotohero.ca?subject=Bug%20Report&body=Hi%20Jon%2C%0D%0A%0D%0AI%20found%20a%20bug%20on%20Zero%20to%20Hero!%0D%0A%0D%0AURL%3A%20${host + $route.fullPath}%0D%0A%0D%0AError%20code%3A%20${error.statusCode}%0D%0A%0D%0AFull%20error%3A%20${JSON.stringify(error)}%0D%0A%0D%0APlease%20fix%20it%20quick%2C%20we're%20counting%20on%20you!`"
              >
                <i class="fas fa-paper-plane"></i>
                Send bug report
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { background } from '@/lib/utils/background'
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
  computed: {
    background() {
      return background()
    },
  }
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
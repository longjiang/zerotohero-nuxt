<template>
  <div
    :style="`min-height: 100vh; background-image: url(${background}); background-size: cover; background-position: center;`"
  >
    <div class="container">
      <div class="row">
        <div class="col-sm-12 text-center pt-4">
          <div class="error-page text-dark">
            <h3 v-if="error.statusCode === 404">{{ $tb('Route Not Found') }}</h3>
            <h3 v-else>{{ $tb('A {status} error has occurred.', { status: error.statusCode}) }}</h3>
            <div v-if="error.statusCode === 404">
              <p>{{ $tb('The route you requested is invalid.') }}</p>
              <div><code>{{ $route.path }}</code></div>
            </div>
            <div class="rounded p-3 text-left my-4" style="background: #eee"><code>{{ error.message }}</code></div>
            <div class="mt-3">
              <b-button
                variant="success px-5"
                size="lg"
                @click="$router.back()"
              >
                <i class="fas fa-arrow-left"></i>
                {{ $tb('Back') }}
              </b-button>
            </div>
            <div class="mt-3">
              <a
                class="text-success ml-2"
                :href="bugReportMailToURL"
              >
                <i class="fas fa-paper-plane"></i>
                {{ $tb('Send bug report') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { background } from '../lib/utils/background'
export default {
  props: ["error"],
  layout: "error",
  data() {
    return {
      host: process.server ? process.env.baseUrl : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
    }
  },
  mounted() {
    console.log(this.error);
  },
  computed: {
    background() {
      return background()
    },
    layoutHasTopBar() {
      if (this.$route.meta && this.$route.meta.layout === 'full') return false
      else return this.$route.params.l1 && this.$route.params.l1 && this.$l1 && this.$l2
    },
    bugReportMailToURL() {
      
      let receipient = 'jon.long@zerotohero.ca'
      let userEmail =
        this.$auth.loggedIn && this.$auth.user
          ? this.$auth.user.email
          : "(Not logged in)";
      let previousURL =
        this.fullHistory && this.fullHistory[this.fullHistory.length - 2]
          ? this.host + this.fullHistory[this.fullHistory.length - 2].path
          : "(None available)";
      let currentURL = this.host + this.$route.fullPath;
      let subject = `Bug Report for Language Player`
      let body = `Please describe the bug:




Please attach a screenshot or screen recording (with your voice explaining your suggestion):





* * *

Diagnostic information:

Error code: ${this.error.statusCode}
Error message: ${this.error.message}
Full error: ${JSON.stringify(this.error)}
Current URL: ${currentURL}
Previous URL: ${previousURL}

User's registered email: ${userEmail}`
      
      return `mailto:${receipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    },
    bugReportMailToURLAlt() {
      return `mailto:jon.long@zerotohero.ca?subject=Bug%20Report&body=Hi%20Jon%2C%0D%0A%0D%0AI%20found%20a%20bug%20on%20Language%20Player!%0D%0A%0D%0AURL%3A%20${this.host + this.$route.fullPath}%0D%0A%0D%0AError%20code%3A%20${this.error.statusCode}%0D%0A%0D%0AFull%20error%3A%20${JSON.stringify(this.error)}%0D%0A%0D%0APlease%20fix%20it%20quick%2C%20we're%20counting%20on%20you!`
    }
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
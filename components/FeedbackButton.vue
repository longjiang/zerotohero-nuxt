<template>
  <div>
    <a :href="feedbackMailToURL" class="feedback-button">Feedback</a>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      host: process.server
      ? process.env.baseUrl
      : window.location.protocol +
        "//" +
        window.location.hostname +
        (window.location.port ? ":" + window.location.port : "")
    }
  },
  computed: {
    ...mapState("fullHistory", ["fullHistory"]),
    feedbackMailToURL() {
      let receipient = "jon.long@zerotohero.ca";
      let userEmail =
        this.$auth.loggedIn && this.$auth.user
          ? this.$auth.user.email
          : "(Not logged in)";
      let previousURL =
        this.fullHistory && this.fullHistory[this.fullHistory.length - 2]
          ? this.host + this.fullHistory[this.fullHistory.length - 2].path
          : "(None available)";
      let currentURL = this.host + this.$route.fullPath;
      let subject = `Feedback on Language Player`;
      let body = `Your feedback on Language Player:




Please attach a screenshot or screen recording (with your voice explaining your suggestion):





* * *

Diagnostic information:

User email: ${userEmail}
Current URL: ${currentURL}
Previous URL: ${previousURL}`;

      return `mailto:${receipient}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    },
  },
};
</script>
<style lang="scss" scoped>
.feedback-button {
  display: block;
  position: fixed;
  transform: rotate(-90deg);
  background: #28a745;
  color: white;
  z-index: 999;
  right: -1.75rem;
  bottom: 12rem;
  padding: 0.1rem 0.5rem;
  border-radius: 0.25rem 0.25rem 0 0;
}
</style>
<template>
  <div class="feedback-button-wrapper">
    <!-- <router-link :to="{ lastFullHistoryPath }" class="feedback-button">
      <i class="fa-solid fa-arrows-rotate"></i>
    </router-link> -->
    <a href="https://discord.gg/4SzBp5J6VX" target="_blank" class="feedback-button"><i class="fa-brands fa-discord"></i> {{ $t("Feedback") }}</a>
    <!-- <span @click="showModal" class="feedback-button"><i class="fa-brands fa-discord"></i> {{ $t("Feedback") }}</span> -->
    <!-- <b-modal
      ref="feedback-modal"
      centered
      hide-footer
      title="Feedback"
      body-class="feedback-modal"
      modal-class="safe-padding-top mt-4"
    >
      <div>
        <h6>Your feedback on Language Player:</h6>
        <b-form-textarea
          id="textarea"
          v-model="feedbackText"
          rows="3"
          max-rows="6"
        ></b-form-textarea>
      </div>
      <div class="mt-4 text-center">
        <b-button variant="success pl-4 pr-4" @click="sendEmail">
          <b-spinner small v-if="sending" />
          <span v-else>
            <i class="fas fa-paper-plane mr-2"></i>
            Send
          </span>
        </b-button>
        <p class="mt-3 small">
          Want to include a screenshot? Send a feedback email directly to
          <a :href="feedbackMailToURL" class="link-unstyled">
            <u>{{ receipient }}</u>
          </a>
        </p>
      </div>
    </b-modal> -->
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      sending: false,
      feedbackText: undefined,
      receipient: "jon.long@zerotohero.ca",
      host: process.server
        ? process.env.baseUrl
        : window.location.protocol +
          "//" +
          window.location.hostname +
          (window.location.port ? ":" + window.location.port : ""),
    };
  },
  computed: {
    ...mapState("fullHistory", ["fullHistory"]),
    lastFullHistoryPath() {
      if (this.fullHistory) {
        let lastFullHistoryItem = this.fullHistory[this.fullHistory.length - 1];
        if (lastFullHistoryItem && lastFullHistoryItem.path) {
          return lastFullHistoryItem.path;
        }
      }
    },
    userEmail() {
      if (this.$auth.loggedIn && this.$auth.user) return this.$auth.user.email;
    },
    currentURL() {
      return this.host + this.$route.fullPath;
    },
    previousURL() {
      if (this.fullHistory && this.fullHistory[this.fullHistory.length - 2])
        return this.host + this.fullHistory[this.fullHistory.length - 2].path;
    },
    emailBody() {
      let emailBody = `My feedback on Language Player:

${this.feedbackText ? this.feedbackText : ""}


Please attach a screenshot or screen recording (with your voice explaining your suggestion):





* * *

Diagnostic information:

User email: ${this.userEmail ? this.userEmail : "(Not logged in)"}
Current URL: ${this.currentURL ? this.currentURL : "(Not available)"}
Previous URL: ${this.previousURL ? this.previousURL : "(Not available)"}`;
      return emailBody;
    },
    feedbackMailToURL() {
      let subject = `Feedback on Language Player`;
      let emailBody = this.emailBody;

      return `mailto:${this.receipient}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(emailBody)}`;
    },
  },
  methods: {
    showModal() {
      this.$refs["feedback-modal"].show();
    },
    hideModal() {
      this.$refs["feedback-modal"].hide();
    },
    async sendEmail() {
      this.sending = true;
      let payload = {
        to: [this.receipient],
        subject: "Language Player Feedback Form Reponse",
        body: this.emailBody,
        type: "plain", // or 'html'
      };
      await this.$directus.post("mail", payload);
      this.sending = false;
      this.$toast.success("Feedback sent. Thank you!", {
        duration: 5000,
      });
      this.hideModal();
    },
  },
};
</script>
<style lang="scss" scoped>
.feedback-button-wrapper {
  position: fixed;
  transform: rotate(-90deg);
  transform-origin: bottom left;
  left: 100vw;
  bottom: 10rem;
  z-index: 999;
  overflow: hidden;
  white-space: nowrap;
  font-size: 0.8rem;
  .feedback-button {
    cursor: pointer;
    background: #5865F2;
    color: white;
    padding: 0.1rem 0.5rem;
    border-radius: 0.25rem 0.25rem 0 0;
    &:hover {
      text-decoration: none;
      background: #3f4cd8;
    }
  }
}
</style>
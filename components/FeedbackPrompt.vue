<template>
  <div>
    <div
      :class="`alert-success p-4 rounded ${skin} `"
      style="position: relative"
    >
      <b-button variant="unstyled" class="close-button">
        <i class="fas fa-times" @click="closed = true"></i>
      </b-button>
      <h5 class="text-center">
        {{ messages[parseInt(Math.random() * messages.length)] }}
      </h5>
      <p class="text-center">
        If have any questions, experience any problems, or would like to suggest
        a feature, please
        <a href="mailto:jon@chinesezerotohero.com" class="strong text-success">
          send us an email.
        </a>
      </p>
      <div class="text-center">
        <a
          href="mailto:jon@chinesezerotohero.com"
          :to="
            this.$l1 && this.$l2
              ? { name: 'discussions' }
              : `/en/zh/discussions`
          "
          class="btn btn-bg btn-success strong"
        >
          <i class="fas fa-paper-plane mr-2"></i>
          Send Email
        </a>
        <div class="mt-2"><i class="fas fa-paperclip mr-1"></i> Make sure to attach a screen recording!</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    skin: {
      default: "light", // or 'dark'
    },
  },
  data() {
    return {
      messages: [
        "Feedback",
      ],
      closed: false,
      closedAgain: false,
    };
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  mounted() {
    if (typeof localStorage !== "undefined") {
      if (
        localStorage.getItem("zthQuitNotice") === "true" &&
        localStorage.getItem("zthQuitNoticeAgain") === "true"
      )
        this.closed = true;
    }
  },
  watch: {
    closed() {
      if (this.closed && typeof localStorage !== "undefined") {
        if (localStorage.getItem("zthQuitNotice") === "true") {
          localStorage.setItem("zthQuitNoticeAgain", "true");
        } else {
          localStorage.setItem("zthQuitNotice", "true");
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.close-button {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0.5;
}

.alert-success.dark {
  background-color: #155724;
  color: white;
  a {
    color: white !important;
  }
}
</style>
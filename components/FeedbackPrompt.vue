<template>
  <div
    :class="`alert-success p-4 rounded ${skin} ${closed ? 'd-none' : ''}`"
    style="position: relative"
  >
    <b-button variant="unstyled" class="close-button">
      <i class="fas fa-times" @click="closed = true"></i>
    </b-button>
    <h5 class="text-center">
      {{ messages[parseInt(Math.random() * messages.length)] }}
    </h5>
    <p>
      If have any questions, experience any problems, or would like to suggest a
      feature, please
      <router-link :to="{ name: 'discussions' }" class="strong text-success">
        join the discussion
      </router-link>
      and post to our
      <router-link :to="{ name: 'discussions' }" class="strong text-success">
        Support Disqus Board
      </router-link>
      .
    </p>
    <div class="text-center">
      <router-link
        :to="
          this.$l1 && this.$l2 ? { name: 'discussions' } : `/en/zh/discussions`
        "
        class="btn btn-bg btn-success strong"
      >
        <i class="fas fa-comment-alt mr-2"></i>
        Post a Comment
      </router-link>
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
        "Need some help?",
        "Confused?",
        "Not sure what this feature is for?",
        "Lost?",
        "Stuck?",
        "Want to suggest a feature?",
        "Did you find what you need?",
        "See a Problem?",
        "Not sure how to use this?",
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
      if (localStorage.getItem("zthQuitNotice") === 'true' && localStorage.getItem("zthQuitNoticeAgain") === 'true') this.closed = true;
    }
  },
  watch: {
    closed() {
      if (this.closed && typeof localStorage !== "undefined") {
        if (localStorage.getItem("zthQuitNotice") === 'true') {
          localStorage.setItem("zthQuitNoticeAgain", 'true');
        } else {
          localStorage.setItem("zthQuitNotice", 'true');
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
<template>
  <div class="screen pt-5 pb-5">
    <div class="text-center">
      <Logo :forcePro="true" />
      <div class="mt-3" />
      <div>
        <p class="text-white mb-1 strong" style="font-size: 1.2em">
          <template v-if="message">{{ message }}</template>
          <template
            v-else
          >See complete subtitles with Pro.</template>
        </p>
      </div>
      <div class="mt-3" />
      <div class="text-white pl-5">
        <span v-if="sale">
          <del style="opacity: 0.5">
            <sup style="font-size: 1rem">$</sup>
            <span style="font-size: 1.7rem; font-weight: bold">89</span>
          </del>
          <span>
            <sup style="font-size: 1rem">$</sup>
            <span style="font-size: 2.2rem; font-weight: bold">44</span>
            <b style="position: relative; bottom: 0.9rem">.50</b>
          </span>
          <sup style="font-size: 1rem" class="text-success">
            <b>/ lifetime</b><br/>
          </sup>
        </span>
        <span v-else>
          <sup style="font-size: 1rem">$</sup>
          <span style="font-size: 2.2rem; font-weight: bold">89</span>
          <sup style="font-size: 1rem" class="text-success">
            <b>/ lifetime!</b>
          </sup>
        </span>
      </div>
      <div class="mt-1" />
      <div class="strong text-white mb-2" style="font-size: 0.85em">Pay once, enjoy forever!</div>
      <div class="mt-4" />
      <div>
        <router-link class="btn btn-success pl-3 pr-3" :to="{ name: 'go-pro' }">🚀 Upgrade to Pro</router-link>
      </div>
      <!-- <div style="font-size: 0.8em; opacity: 0.7" class="mt-3">
        Compare prices with:
        <a
          href="https://www.fluentu.com/en/pricing/"
          target="_blank"
          class="text-primary"
        >FluentU</a>
        ,
        <a
          href="https://spanish.yabla.com/subscribe.php"
          target="_blank"
          class="text-primary"
        >Yabla</a>
        , and
        <a
          href="https://www.lingq.com/en/signup/"
          target="_blank"
          class="text-primary"
        >LingQ</a>
        .
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: {
    message: {
      type: String
    }
  },
  data() {
    return {
      sale: false
    }
  },
  computed: {
    ...mapState("stats", ["stats"]),
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },

    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    }
  }
};
</script>

<style scoped>
.screen {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 33%,
    rgba(0, 0, 0, 1) 100%
  );
  width: 100%;
}
</style>
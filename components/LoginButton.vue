<template>
  <div>
    <a
      v-if="$l1.code === 'zh' && $l2.code === 'en'"
      class="link-unstyled nuxt-link-active btn-sign-in mr-1"
      href="https://m.cctalk.com/inst/stevmab3"
      target="_blank"
    >
      登录
      <img
        src="/img/logo-cctalk-white.png"
        class="logo-small ml-1"
        data-not-lazy
      />
    </a>
    <a
      v-if="$l1.code === 'en' && $l2.code === 'zh'"
      class="link-unstyled nuxt-link-active btn-sign-in mr-1"
      href="https://sso.teachable.com/secure/133035/users/sign_in"
      target="_blank"
    >
      Login to
      <img src="/img/teachable_light.png" class="logosp-small" data-not-lazy />
    </a>
  </div>
</template>

<script>
export default {
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
};
</script>

<style>
.btn-sign-in {
  font-size: 0.8rem;
  text-decoration: none;
}

.btn-sign-in img {
  height: 1.2rem;
  margin-bottom: 0.2rem;
}
</style>
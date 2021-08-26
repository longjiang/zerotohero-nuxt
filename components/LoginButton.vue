<template>
  <div>
    <a
      v-if="$l1.code === 'zh' && $l2.code === 'en'"
      class="link-unstyled nuxt-link-active btn-sign-in"
      href="https://m.cctalk.com/inst/stevmab3"
    >
      <i v-if="icon" class="fas fa-key" style="width: 1.5rem"></i>
      我的课程
    </a>
    <a
      v-if="$l1.code === 'en' && $l2.code === 'zh'"
      class="link-unstyled nuxt-link-active btn-sign-in"
      href="https://sso.teachable.com/secure/133035/users/sign_in"
    >
      <i v-if="icon" class="fas fa-key" style="width: 1.5rem"></i>
      My Courses
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
  props: {
    icon: {
      default: true,
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
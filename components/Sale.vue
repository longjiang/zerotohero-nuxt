<template>
  <div
    class="jumbotron-fluid bg-dark text-light mb-0 text-center rounded"
    style="position: relative; overflow: hidden; cursor: pointer"
    @click="go"
  >
    <video autoplay muted loop>
      <source src="/video/backgrounds/vbg-waves-480p.mp4" type="video/mp4" />
    </video>
    <div class="foreground text-center">
      <div class="p-4 d-inline-block">
        <div style="font-weight: 700; font-size: 3rem; line-height: 1">SUMMER SALE</div>
        <div class="mt-3" style="font-size: 1.2rem; font-weight: bold; opacity: 0.8">CHINESE COURSES 30% OFF</div>
        <div style="font-size: 1.2rem; font-weight: bold; opacity: 0.8">
          <span>USE COUPON CODE</span>
          <code class="coupon-code">SUMMER</code>
        </div>
        <div style="font-size: 1.2rem; font-weight: bold; opacity: 0.8">DEAL ENDS AUG 25</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    go() {
      this.$router.push({ name: "sale" });
    },
  },
};
</script>

<style lang="scss" scoped>
.vidContain {
  position: relative;
  margin: 10px;
  width: 100%;
  height: 20rem;
  overflow: hidden;
}
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}
.coupon-code {
  background: #00000066;
  backdrop-filter: blur(30px);
  font-size: 1em;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
</style>
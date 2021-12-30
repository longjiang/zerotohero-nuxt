<template>
  <div
    class="jumbotron-fluid bg-dark text-light mb-0 text-center rounded"
    style="position: relative; overflow: hidden; cursor: pointer"
    @click="go"
  >
    <video autoplay muted loop>
      <source
        :src="`${server}data/video/backgrounds/vbg-sparks-480p.mp4`"
        type="video/mp4"
      />
    </video>
    <div class="foreground text-center">
      <div class="p-4 d-inline-block">
        <div style="font-weight: 700; font-size: 2.5rem; line-height: 1">
          NEW YEAR SALE
        </div>
        <div
          class="mt-3"
          style="font-size: 1.2rem; font-weight: bold; opacity: 0.8"
        >
          CHINESE COURSES 25% OFF
        </div>
        <div style="font-size: 1.2rem; font-weight: bold; opacity: 0.8">
          <span>USE COUPON CODE</span>
          <code class="coupon-code">NEWYEAR2022</code>
        </div>
        <div style="font-size: 1.2rem; font-weight: bold; opacity: 0.8">
          DEAL ENDS JAN 3.
        </div>
        <div class="mt-4 mb-2">
          <router-link to="/sale" class="btn btn-danger" style="background-color: #e17b12; border: none">
            Learn More
            <i class="fa fa-chevron-right ml-2"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
export default {
  data() {
    return {
      server: Config.server,
    };
  },
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
  background: #e17b1266;
  backdrop-filter: blur(30px);
  font-size: 1em;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
</style>
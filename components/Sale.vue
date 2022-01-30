<template>
  <div
    class="jumbotron-fluid bg-dark text-light mb-0 text-center rounded"
    style="
      background-image: url(/img/background-chinese-new-year.jpg);
      background-size: cover;
      background-position: center;
      background-attachment: initial;
    "
    @click="go"
  >
    <div class="foreground text-center">
      <div class="p-4 d-inline-block">
        <div style="font-weight: 700; font-size: 2.5rem; line-height: 1">
          Chinese New Year Sale
        </div>
        <div class="mt-3" style="font-size: 1.2rem; font-weight: bold">
          HSK Courses 25% Off
        </div>
        <div style="font-size: 1.2rem; font-weight: bold">
          <span>Use Coupon Code</span>
          <code class="coupon-code">CNY2022</code>
        </div>
        <div style="font-size: 1.2rem; font-weight: bold">Deal Ends Feb 5.</div>
        <div class="mt-4 mb-2">
          <router-link to="/sale" class="learn-more-button">
            LEARN MORE
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
  background: rgb(221, 45, 45);
  background: radial-gradient(
    circle,
    rgba(221, 45, 45, 1) 0%,
    rgba(108, 15, 15, 1) 100%
  );
  font-size: 1em;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.learn-more-button {
  border: none;
  background: rgb(221, 45, 45);
  background: radial-gradient(
    circle,
    rgba(221, 45, 45, 1) 0%,
    rgba(108, 15, 15, 1) 100%
  );
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: inline-block;
  font-weight: bold;
  &:hover {
    text-decoration: none;
  }
}
</style>
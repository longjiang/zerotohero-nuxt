<router>
  {
    path: '/sale',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div class="l2-zh">
    <SocialHead :title="title" :description="description" :image="image" />
    <!-- The video -->
    <div class="container pt-5 pb-5 text-white">
      <div class="row justify-content-center">
        <div class="text-center col">
          <router-link to="/en/zh/online-courses">
            <img
              src="/img/czh-logo-light.png"
              class="img-fluid"
              style="max-width: 15rem"
              data-not-lazy
            />
          </router-link>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="text-center">
            <h1 class="text-center mt-5 mb-4 sale-heading">
              Chinese New Year Sale
            </h1>
          </div>
          <h2 class="text-center mt-4" style="margin-bottom: 2rem">
            ALL HSK COURSES 25% OFF
          </h2>
          <client-only>
            <div class="sale-counter text-xs-left text-sm-center">
              <vac :end-time="new Date('Feb 5, 2022 23:59:59')">
                <template v-slot:process="{ timeObj }">
                  <span>
                    <span style="white-space: nowrap">
                      <span class="sale-counter-number">{{ timeObj.d }}</span>
                      DAYS
                    </span>
                    <span style="white-space: nowrap">
                      <span class="sale-counter-number">{{ timeObj.h }}</span>
                      HOURS
                    </span>
                    <span style="white-space: nowrap">
                      <span class="sale-counter-number">{{ timeObj.m }}</span>
                      MIN
                    </span>
                    <span style="white-space: nowrap">
                      <span class="sale-counter-number">{{ timeObj.s }}</span>
                      SEC LEFT
                    </span>
                  </span>
                </template>
                <template v-slot:finish>
                  <div class="text-center">The sale has ended.</div>
                </template>
              </vac>
            </div>
          </client-only>
          <h2 class="text-center mt-4 mb-4" style="line-height: 2">
            Use the coupon code
            <span class="coupon-code">CNY2022</span>
          </h2>
        </div>
      </div>
      <div class="row mt-5">
        <div class="col">
          <div class="home-card">
            <Courses />
          </div>
        </div>
      </div>
      <div class="row mt-5">
        <div class="col">
          <div class="home-card">
            <Testimonials />
          </div>
        </div>
      </div>
      <div class="row mt-5">
        <div class="col">
          <h2 class="text-center mt-4" style="margin-bottom: 2rem">
            Start Mastering Chinese Today
          </h2>
          <client-only>
            <div class="sale-counter text-xs-left text-sm-center">
              <vac :end-time="new Date('Feb 5, 2022 23:59:59')">
                <template v-slot:process="{ timeObj }">
                  <span>
                    <span style="white-space: nowrap">
                      <span class="sale-counter-number">{{ timeObj.d }}</span>
                      DAYS
                    </span>
                    <span style="white-space: nowrap">
                      <span class="sale-counter-number">{{ timeObj.h }}</span>
                      HOURS
                    </span>
                    <span style="white-space: nowrap">
                      <span class="sale-counter-number">{{ timeObj.m }}</span>
                      MIN
                    </span>
                    <span style="white-space: nowrap">
                      <span class="sale-counter-number">{{ timeObj.s }}</span>
                      SEC LEFT
                    </span>
                  </span>
                </template>
                <template v-slot:finish>
                  <span>The sale has ended.</span>
                </template>
              </vac>
            </div>
          </client-only>
          <h4 class="text-center mt-4 mb-4" style="line-height: 2">
            USE THE COUPON CODE
            <span class="coupon-code">CNY2022</span>
          </h4>
        </div>
      </div>
      <div class="row mt-5 text-center" style="margin-bottom: 5rem">
        <div class="col">
          <a
            href="https://chinesezerotohero.teachable.com/"
            class="btn btn-lg btn-success"
          >
            TAKE THIS OFFER NOW
          </a>
        </div>
      </div>
      <div class="row justify-content-center mt-5 mb-5">
        <div class="text-center col">
          <router-link to="/en/zh/online-courses">
            <img
              src="/img/czh-logo-light.png"
              class="img-fluid"
              style="max-width: 15rem"
            />
          </router-link>
        </div>
      </div>
    </div>
    <div
      style="
        position: fixed;
        top: 0;
        left: 0;
        background-image: url(/img/background-chinese-new-year.jpg);
        height: 100vh;
        width: 100vw;
        background-size: cover;
        background-position: center;
        background-attachment: initial;
        z-index: -1;
      "
    ></div>
  </div>
</template>

<script>
import vueAwesomeCountdown from "vue-awesome-countdown";
import Vue from "vue";
import Config from "@/lib/config";
Vue.use(vueAwesomeCountdown);

export default {
  data() {
    return {
      title: "HSK Courses at 25% Off | Chinese Zero to Hero",
      description: "Deal ends Jan 5, 2022",
      image: "/img/sale/cny-sale-2022.jpeg",
      server: Config.server,
    };
  },
};
</script>

<style lang="scss" scoped>
.video-background {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
}

.content {
  z-index: 1;
}

.sale-counter {
  background: rgb(221, 45, 45);
  background: radial-gradient(
    circle,
    rgba(221, 45, 45, 1) 0%,
    rgba(108, 15, 15, 1) 100%
  );
  font-size: 1.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  line-height: 2;
  .sale-counter-number {
    background: #00000066;
    padding: 0.5rem 1rem;
    margin: 0 0.5rem;
    border-radius: 0.5rem;
    font-weight: bold;
  }
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
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.sale-heading {
  font-size: 3.5rem;
}
</style>
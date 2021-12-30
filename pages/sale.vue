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
    <video autoplay muted loop class="video-background">
      <source
        :src="`${server}data/video/backgrounds/vbg-sparks-480p.mp4`"
        type="video/mp4"
      />
    </video>
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
              NEW YEAR SALE
            </h1>
          </div>
          <h2 class="text-center mt-4" style="margin-bottom: 2rem">
            ALL HSK COURSES 25% OFF
          </h2>
          <client-only>
            <div class="sale-counter text-xs-left text-sm-center">
              <vac :end-time="new Date('Jan 3, 2022 23:59:59')">
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
          <h2 class="text-center mt-4 mb-4" style="line-height: 2">
            USE THE COUPON CODE
            <span class="coupon-code">NEWYEAR2022</span>
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
              <vac :end-time="new Date('Nov 30, 2021 23:59:59')">
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
            <span class="coupon-code">NEWYEAR2022</span>
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
      description: "Deal ends Jan 3, 2022",
      image: "/img/sale/new-year-sale-2022.jpg",
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
  background-color: #e17b1266;
  backdrop-filter: blur(30px);
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
  background: #e17b1266;
  backdrop-filter: blur(30px);
  font-size: 1em;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.sale-heading {
  font-size: 5rem;
}

@media (max-width: 540px) {
  .sale-heading {
    font-size: 3rem;
  }
}
</style>
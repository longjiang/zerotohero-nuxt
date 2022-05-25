<router>
  {
    path: '/:l1/:l2/contact-us',
    meta: {
      title: 'Contact Us | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Get in touch with us.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <SocialHead :title="`Support and Contact | ${$l2.name} Zero to Hero`" />
      <template>
        <div class="row">
          <div class="col-12">
            <div class="alert-success p-4 rounded mb-5">
              <h5 class="text-center">Get Help &amp; Give Feed Back</h5>
              <p>
                If you experience a problem, see something broken, or would like
                to suggest a feature, please
                <router-link
                  :to="{ name: 'discussions' }"
                  class="strong text-success"
                >
                  join the discussion
                </router-link>
                and post to our
                <router-link
                  :to="{ name: 'discussions' }"
                  class="strong text-success"
                >
                  Support Disqus Board
                </router-link>
                .
              </p>
              <div class="text-center">
                <router-link
                  :to="{ name: 'discussions' }"
                  class="btn btn-bg btn-success strong"
                >
                  <i class="fas fa-comment-alt mr-2"></i>
                  Post a Comment
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <h4 class="mb-5 text-center">Our “Team”</h4>
          </div>
        </div>

        <div class="row">
          <div class="col-sm-6 mb-4" style="height: 100%">
            <div class="contact-block p-4">
              <div class="mb-3">
                <h5>Ken Dai</h5>
                <div>Co-founder, sales &amp; operations</div>
              </div>
              <div>
                <span>
                  <strong>{{ $t("Email:") }}</strong>
                  <a href="mailto:ken@chinesezerotohero.com">
                    ken@chinesezerotohero.com
                  </a>
                </span>
              </div>
              <div>
                <strong>{{ $t("WeChat:") }}</strong>
                kendai9&nbsp;
              </div>
            </div>
          </div>
          <div class="col-sm-6" style="height: 100%">
            <div class="contact-block p-4">
              <div class="mb-3">
                <h5>Jiang Long</h5>
                <div>Co-founder, instructor, designer &amp; dev</div>
              </div>
              <div>
                <span>
                  <strong>{{ $t("Email:") }}</strong>
                  <a href="mailto:jon@chinesezerotohero.com">
                    jon@chinesezerotohero.com
                  </a>
                  (fyi I have 1,219 unread messages)
                </span>
              </div>
              <div>
                <strong>{{ $t("WeChat:") }}</strong>
                longjiang2005bby (I'm too busy coding to check my phone)
              </div>
            </div>
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-sm-12">
            <div class="text-center p-4">
              <h5 class="mb-4">
                And you can always reach either one of us via:
              </h5>
              <SocialLogos style="line-height: 3" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <div v-if="this.$l2.code === 'zh'">
              <div class="contact-block p-4 container">
                <h5>{{ $t("Join our WeChat discussion group") }}</h5>
                <p class="mt-3">
                  {{
                    $t(
                      "Download the WeChat app, scan Ken’s QR code below, leave him a message, and he will invite you into the group."
                    )
                  }}
                </p>
                <img
                  src="/img/ken-wechat-qr.jpg"
                  class="img-fluid shadow"
                  style="max-width: 15rem"
                />
              </div>
              <TelegramPrompt bodyClasses=" contact-block p-4 " />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
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
  data() {
    return {
      params: {},
      query: {
        lg: {
          minWidth: 960,
        },
      },
    };
  },
};
</script>

<style lang="scss" scoped>
.contact-block {
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0px 5px 20px rgb(0 0 0 / 25%);
}
</style>

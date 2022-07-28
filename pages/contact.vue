<router>
  {
    path: '/:l1/:l2/contact-us',
    meta: {
      title: 'Contact Us | Language Player',
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
    <div class="container pb-5">
      <SocialHead :title="`Support and Contact | Language Player`" />
      <template>
        <div class="row">
          <div class="col-12">
            <h4 class="mb-5 text-center">Contact Language Player</h4>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6 mb-4">
            <div class="contact-block p-4" style="height: 100%">
              <h5>Join Our Discord Server</h5>
              <p>and connect with other language learners like you!</p>
              <a href="https://discord.gg/n9UFdaTW" target="_blank">
                <img
                  src="/img/screenshot-discord.png"
                  alt="Screenshot"
                  class="img-fluid"
                />
              </a>
              <p>
                Join link:
                <a href="https://discord.gg/n9UFdaTW" target="_blank">
                  https://discord.gg/n9UFdaTW
                </a>
              </p>
            </div>
          </div>
          <div class="col-sm-6 mb-4">
            <div class="contact-block p-4" style="height: 100%">
              <div class="mb-3">
                <h5>Contact the Developer</h5>
                <div><b>Jiang (Jon) Long</b></div>
                <div>Co-founder, design &amp; dev</div>
                <div>
                  <a
                    href="https://www.sfu.ca/linguistics/events/2022/07/StudentProfile_JiangLong.html"
                  >
                    Undergrad student at SFU (Linguistics)
                  </a>
                </div>
              </div>
              <div>
                <strong>{{ $t("Email:") }}</strong>
                <a href="mailto:jon.long@zerotohero.ca">
                  jon.long@zerotohero.ca
                </a>
              </div>
              <div>
                <strong>{{ $t("WeChat:") }}</strong>
                longjiang2005bby
              </div>
              <div>
                <strong>{{ $t("Discord:") }}</strong>
                Jiang#2737
              </div>
              <div>
                <strong>{{ $t("Telegram:") }}</strong>
                jon_zerotohero
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-sm-3"></div>
          <div class="col-sm-3"></div>
          <!-- <div class="col-sm-6 mb-4" >
            <div class="contact-block p-4" style="height: 100%">
              <div class="mb-3">
                <h5>Ken Dai</h5>
                <div>Co-founder, Chinese Zero to Hero sales &amp; operations</div>
              </div>
              <div>
                <span>
                  <strong>{{ $t("Email:") }}</strong>
                  <a href="mailto:ken.dai@zerotohero.ca">
                    ken.dai@zerotohero.ca
                  </a>
                </span>
              </div>
              <div>
                <strong>{{ $t("WeChat:") }}</strong>
                kendai9&nbsp;
              </div>
            </div>
          </div> -->
        </div>
        <div class="row mt-4">
          <div class="col-sm-12">
            <div class="text-center p-4">
              <h4 class="mb-4">Follow Us on Social Media</h4>
              <SocialLogos style="line-height: 3" />
            </div>
          </div>
        </div>
        <!-- <div class="row" v-if="this.$l2.code === 'zh'">
          <div class="col-sm-12">
            <h4 class="mt-5 mb-4 text-center">Chinese Language Chat</h4>
          </div>
          <div class="col-sm-12 col-md-6 mb-3">
            <div>
              <div class="p-4 container">
                <h5>Chinese Learning WeChat Group</h5>
                <ul class="pl-3 mt-3">
                  <li>{{ $t("Share learning resources.") }}</li>
                  <li>{{ $t("Interact with fellow learners.") }}</li>
                  <li>{{ $t("Help each other out with questions.") }}</li>
                  <li>{{ $t("Inspire others with learning experiences.") }}</li>
                </ul>
                <p class="mt-3">
                  Download the
                  <a
                    class="strong"
                    target="_blank"
                    href="https://www.wechat.com/"
                  >
                    WeChat app
                  </a>
                  , add Ken's WeChat (id: kendai9) and send a request to join.
                </p>
              </div>
            </div>
          </div>
          <div class="col-sm-12 col-md-6 mb-3">
            <TelegramPrompt bodyClasses="  p-4 " />
          </div>
        </div> -->
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
  height: 100%;
}
</style>

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
      <SocialHead :title="`Contact Us | ${$l2.name} Zero to Hero`" />
      <!-- <template v-if="this.$l1.code && this.$l2.code === 'en'">
        <div class="row">
          <div class="col-12 text-center mt-4">
            <img
              src="/img/contact-us.svg"
              class="img-fluid"
              style="max-width: 690px"
            />
          </div>
        </div>
      </template> -->
      <template>
        <div class="row">
          <div class="col-12">
            <h3 class="mb-5 text-center">
              {{ $t("Contact {l2} Zero to Hero", { l2: $l2.name }) }}
            </h3>
          </div>
        </div>
        <container-query :query="query" v-model="params">
          <div class="row">
            <div
              :class="{
                'col-12': !params.lg,
                'col-6': params.lg,
              }"
            >
              <div class="rounded bg-light p-4 container">
                <div class="row">
                  <div class="col-sm-4">
                    <img
                      src="/img/ken-standing.png"
                      alt=""
                      style="height: 10rem"
                    />
                  </div>
                  <div class="col-sm-8">
                    <h5 class="mb-3">
                      {{
                        $t("Contact Ken with general or business inquiries.")
                      }}
                    </h5>
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
              </div>
              <div class="rounded bg-light p-4 mt-4 mb-4 container">
                <div class="row">
                  <div class="col-sm-4">
                    <img
                      src="/img/jon-sitting.png"
                      alt=""
                      style="height: 8rem"
                    />
                  </div>
                  <div class="col-sm-8">
                    <h5 class="mb-3">
                      {{ $t("Contact Jon with course-related questions.") }}
                    </h5>
                    <p>
                      {{
                        $t(
                          "If you are taking our courses and have a question regarding any content, leave a comment in the comment area of the lecture."
                        )
                      }}
                    </p>
                    <p></p>
                  </div>
                </div>
              </div>
            </div>
            <div
              :class="{
                col: true,
                'col-6': params.lg,
              }"
            >
              <div v-if="this.$l2.code === 'zh'">
                <div class="rounded bg-light p-4 container">
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
                    class="img-fluid shadow rounded"
                    style="max-width: 15rem"
                  />
                </div>
                <TelegramPrompt bodyClasses="rounded bg-light p-4 " />
              </div>
            </div>
          </div>
        </container-query>
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

<style></style>

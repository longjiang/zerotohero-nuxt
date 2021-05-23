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
  <div class="container main mt-5 mb-5">
    <template v-if="this.$l1.code && this.$l2.code === 'en'">
      <div class="row">
        <div class="col-sm-12 text-center mt-4">
          <img src="/img/contact-us.svg" class="img-fluid" style="max-width: 690px" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="row">
        <div class="col-sm-12">
          <h1 class="mb-5 text-center">
            {{ $t('Contact {l2} Zero to Hero', { l2: $l2.name }) }}
          </h1>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12 col-lg-6">
          <div class="rounded shadow bg-light p-4 container">
            <div class="row">
              <div class="col-sm-4">
                <img src="/img/ken-standing.png" alt="" style="height: 10rem" />
              </div>
              <div class="col-sm-8">
                <h3 class="mb-3">
                  {{ $t('Contact Ken with general or business inquiries.') }}
                </h3>
                <p>
                  <span
                    ><strong>{{ $t('Ken’s Email:') }} </strong
                    ><a href="mailto:ken@chinesezerotohero.com"
                      >ken@chinesezerotohero.com</a
                    >
                    (please note that our email server was down from December 10
                    to December 15, 2020. If you've sent an email during this
                    period, please send it again)</span
                  >
                </p>
                <p>
                  <strong>{{ $t('Ken’s WeChat:') }}</strong> kendai9&nbsp;
                </p>
              </div>
            </div>
          </div>
          <div class="rounded shadow bg-light p-4  mt-4  mb-4 container">
            <div class="row">
              <div class="col-sm-4">
                <img src="/img/jon-sitting.png" alt="" style="height: 8rem" />
              </div>
              <div class="col-sm-8">
                <h3 class="mb-3">
                  {{ $t('Contact Jon with course-related questions.') }}
                </h3>
                <p>
                  {{
                    $t(
                      'If you are taking our courses and have a question regarding any content, leave a comment in the comment area of the lecture.'
                    )
                  }}
                </p>
                <p></p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!isZh" class="col-sm-12 col-lg-6">
          <div class="rounded shadow bg-light p-4 container">
            <h3>{{ $t('Join our WeChat discussion group') }}</h3>
            <p class="mt-3">
              {{
                $t(
                  'Download the WeChat app, scan Ken’s QR code below, leave him a message, and he will invite you into the group.'
                )
              }}
            </p>
            <img
              src="/img/ken-wechat-qr.jpg"
              class="img-fluid"
              style="max-width: 15rem"
            />
          </div>
        </div>
        <div v-else class="col-sm-12 col-lg-6">
          <TelegramPrompt bodyClasses="rounded shadow bg-light p-4 " />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Page from '@/components/Page'

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
  components: {
    Page
  }
}
</script>

<style></style>

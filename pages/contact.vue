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
      <SocialHead :title="$t('Support and Contact') + ' | Language Player'" />
      <template>
        <div class="row">
          <div class="col-12">
            <h4 class="mb-5 text-center">
              {{ $t("Contact Language Player") }}
            </h4>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6 mb-4">
            <div class="contact-block p-4" style="height: 100%">
              <h5>{{ $t("Join Our Discord Server") }}</h5>
              <p>
                {{
                  $t(
                    "Ask us questions, give us feedback, and network with other language learners."
                  )
                }}
              </p>
              <a
                href="https://discord.gg/D7vKcuKXuA"
                target="_blank"
                class="btn text-white"
                style="background-color: #5865f2"
              >
                <i class="fa-brands fa-discord"></i>
                {{ $t("Join Our Discord Server to Chat") }}
              </a>
            </div>
          </div>
          <div class="col-sm-6 mb-4">
            <div class="contact-block p-4" style="height: 100%">
              <div class="mb-3">
                <h5>
                  <b>{{ $t("Jiang (Jon) Long") }}</b>
                </h5>
                <p>{{ $t("Co-founder, Designer, Developer") }}</p>
                <hr />
                <div>
                  {{ $t("Undergrad student at SFU (Linguistics)") }}
                </div>
                <p>
                  <a
                    href="https://www.sfu.ca/linguistics/events/2022/07/StudentProfile_JiangLong.html"
                  >
                    {{ $t('About Jiang at SFU') }}
                  </a>
                </p>
                <hr />
              </div>
              <div>
                <strong>{{ $t("Email:") }}</strong>
                <a href="mailto:jon.long@zerotohero.ca">
                  jon.long@zerotohero.ca
                </a>
              </div>
              <div>
                <strong>{{ $t("Discord:") }}</strong>
                <a href="https://discord.gg/D7vKcuKXuA" target="_blank">
                  https://discord.gg/D7vKcuKXuA
                </a>
              </div>
              <div>
                <strong>{{ $t("Twitter:") }}</strong>
                <a
                  href="https://twitter.com/language_player?lang=en"
                  target="_blank"
                  >@language_player</a
                >
              </div>
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

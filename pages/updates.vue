<router>
  {
    path: '/:l1/:l2/updates',
    props: true
  }
</router>
<template>
  <div class="main pt-5 pb-5">
    <div class="container">
      <div class="row">
        <div class="col">
          <h3 class="text-center">{{ $t('What’s New') }}</h3>
          <p class="mt-5 mb-5" style="font-size: 1.2em">
            <i18n path="Follow our Twitter account {0} to keep yourself up-to-date with our latest features and announcements." tag="p">
              <a
                href="https://twitter.com/language_player"
                target="_blank"
                slot="link"
                >@language_player</a
              >
            </i18n>
          </p>
          <client-only>
            <a
              class="twitter-timeline"
              href="https://twitter.com/language_player"
            >
              {{ $t('Tweets by {handle}', {handle: '@language_player'}) }}
            </a>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async mounted() {
    let twitterScript = document.createElement("script");
    twitterScript.setAttribute(
      "src",
      "https://platform.twitter.com/widgets.js"
    );
    document.head.appendChild(twitterScript);
  },
};
</script>

<style>
</style>
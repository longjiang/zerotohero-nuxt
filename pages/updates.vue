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
          <h3 class="text-center">What’s New</h3>
          <p class="mt-5 mb-5" style="font-size: 1.2em">
            <b>
              Follow our Twitter account
              <a href="https://twitter.com/zerotoherolang" target="_blank">
                @zerotoherolang
              </a>
            </b>
            to keep yourself up-to-date with our latest features and
            announcements.
          </p>
          <client-only>
            <a
              class="twitter-timeline"
              href="https://twitter.com/zerotoherolang?ref_src=twsrc%5Etfw"
            >
              Tweets by @zerotoherolang
            </a>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
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
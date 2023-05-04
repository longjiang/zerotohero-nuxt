<router>
  {
    path: '/:l1/:l2/faq'
  }
</router>
<template>
  <div class="main">
    <div class="faq container pt-5 pb-5">
      <SocialHead
        :title="`Frequently Asked Questions | Language Player`"
      />
      <div class="row">
        <div class="col-sm-12">
          <div>
            <h3 class="text-center mb-5">Frequently Asked Questions</h3>
            <div class="faq-item">
              <h5>What is Language Player?</h5>
              <p>
                Language Player is an
                <a href="https://github.com/longjiang/zerotohero-nuxt">
                  open-source
                </a>
                language-learning platform that helps people learn all languages
                natually via comprehensible input.
              </p>
              <p>
                Our company, Zero to Hero Education, have also produced online video lessons for the Chinese and
                English languages: Chinese Zero to Hero (hosted on Teachable)
                and Enlgish Zero to Hero (hosted on CCtalk).
              </p>
            </div>
            <div class="faq-item">
              <h5>Where are your videos hosted?</h5>
              <p>
                The videos under the Media tab are
                <em>NOT hosted on our servers</em>
                but merely
                <a
                  href="https://support.google.com/youtube/answer/171780?hl=en"
                >
                  YouTube iframe embeds
                </a>
                . YouTube allows anyone to embed any video on any website. We do
                not infringe on copyright simply by embedding YouTube videos.
              </p>
              <p>
                Nevertheless, the community behind Language Player wants to be on
                good terms with all content creators. If you wish to have your
                content removed, you can easily do so by following the
                instructions in the next section.
              </p>
            </div>
            <div class="faq-item">
              <h5>How can I prevent my videos from showing up on this site?</h5>
              <p>
                By allowing websites like Language Player, your videos will get
                views and generate ad revenue for you as if the videos are
                viewed on YouTube. The YouTube embed player on this website also
                recommends other videos from you channel, which can potentially
                give you additional views. What's more, by allowing your videos
                on this site you are helping the language-learning community
                with your great content.
              </p>
              <p>
                Having said that, if you still wish to remove your video, you
                can do so in the following ways:
              </p>
              <ol>
                <li>
                  <b>Restrict embedding for specific websites.</b>
                  You can blacklist certain domains (such as this one, www.languageplayer.io)
                  to prevent them from displaying your YouTube videos. For
                  instructions, see
                  <a
                    href="https://support.google.com/youtube/answer/6301625"
                    target="_blank"
                  >
                    Restrict embedding on websites
                  </a>
                  .
                </li>
                <li>
                  <b>Turn off embedding for a specific video.</b>
                  By turning off embedding for a specific video, you will stop
                  all websites from displaying that video. Once you turn off
                  embedding, the video will no longer play on any website and
                  instead display an error message. See
                  <a
                    href="https://support.google.com/youtube/answer/171780?hl=en#zippy=%2Cturn-on-privacy-enhanced-mode%2Cturn-off-embedding-for-your-videos"
                    target="_blank"
                  >
                    How to turn off embedding for your videos
                  </a>
                </li>
                <li>
                  <b>Contact us to have your videos blacklisted.</b>
                  If the above two options don't work for you, you can contact
                  us to have some all of your videos "blacklisted" and never
                  again show up on this website. Please contact us via the
                  <router-link :to="{ name: 'contact-us' }">
                    Contact Us
                  </router-link>
                  page.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>




export default {
};
</script>

<style lang="scss">
.faq-item {
  margin-top: 2rem;
  h5 {
    margin-bottom: 1rem;
  }
  p {
    padding-left: 2rem;
  }
}
</style>

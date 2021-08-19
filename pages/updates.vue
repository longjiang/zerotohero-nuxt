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
          <h3 class="text-center">Updates</h3>
          <a
            class="twitter-timeline"
            href="https://twitter.com/zerotoherolang?ref_src=twsrc%5Etfw"
          >
            Tweets by @zerotoherolang
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      script: [
        { hid: 'twitter', src: 'https://platform.twitter.com/widgets.js', defer: true }
      ]
    }
  }
  
};
</script>

<style>
</style>
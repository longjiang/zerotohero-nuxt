<template>
  <div class="screen pt-5 pb-5">
    <div class="text-center" style="line-height: 2">
      <Logo :forcePro="true" />
      <div class="mt-3" />
      <div>
        <p class="text-white mb-0" style="font-size: 1.2em">
          Continue learning by upgrading to a Pro account.
        </p>
        <p style="font-size: 0.8em">
          A Pro account gives you access to the full transcript.
        </p>
      </div>
      <div class="mt-3" />
      <div class="text-white pl-5">
        <sup style="font-size: 1rem">$</sup>
        <span style="font-size: 2.2rem; font-weight: bold">89</span>
        <sup style="font-size: 1rem">/ lifetime</sup>
      </div>
      <div class="mt-2" />
      <div class="strong text-white">Pay only once, enjoy it forever!</div>
      <div style="font-size: 0.8em">
        Compare with subscription-based services like
        <a href="https://www.fluentu.com/chinese/home/#all">FluentU</a>
        ,
        <a href="https://www.yabla.com/">Yabla</a>
        , and
        <a href="https://www.lingq.com/en/">LingQ</a>
        .
      </div>
      <div class="mt-4" />
      <div>
        <router-link class="btn btn-primary pl-3 pr-3" :to="{ name: 'go-pro' }">
          Get Pro
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.screen {
  background: linear-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
  width: 100%;
}
</style>
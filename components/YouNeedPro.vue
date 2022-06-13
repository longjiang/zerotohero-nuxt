<template>
  <div class="screen pt-5 pb-5">
    <div class="text-center">
      <Logo :forcePro="true" />
      <div class="mt-3" />
      <div>
        <p class="text-white mb-1 strong" style="font-size: 1.2em">
          See full transcript with a Pro account.
        </p>
      </div>
      <div class="mt-3" />
      <div class="text-white pl-5">
        <sup style="font-size: 1rem">$</sup>
        <span style="font-size: 2.2rem; font-weight: bold">89</span>
        <sup style="font-size: 1rem">/ lifetime</sup>
      </div>
      <div class="mt-2" />
      <div class="strong text-white mb-2" style="font-size: 0.85em">Pay only once, enjoy it forever!</div>
      <div style="font-size: 0.85em">
        Compare prices with subscription-based services:
        <a href="https://www.fluentu.com/chinese/home/#all" class="text-primary">FluentU</a>
        ,
        <a href="https://www.yabla.com/" class="text-primary">Yabla</a>
        , and
        <a href="https://www.lingq.com/en/" class="text-primary">LingQ</a>
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
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 33%, rgba(0, 0, 0, 1) 100%);
  width: 100%;
}
</style>
<template>
  <footer style="padding-bottom: 6rem">
    <div
      class="text-center pt-5 pb-2"
      style="line-height: 1.2; font-size: 1.1em"
    >
      <router-link class="link-unstyled text-white" to="/">
        <h4>zerotohero.ca</h4>
      </router-link>
    </div>
    
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <Choose :showLanguageList="false" skin="dark" />
          <div>
            <p>
              <strong>This is an open-source project.</strong>
              This website is built on
              <code>Vue.js</code>
              and is fully open source. Check out the code on GitHub at
              <a href="https://github.com/longjiang/zerotohero-nuxt">
                https://github.com/longjiang/zerotohero-nuxt
              </a>
              .
            </p>
          </div>
          <div>
            <p>
              <strong>Credits:</strong>
              <client-only><span v-if="dictionaryCredit" v-html="dictionaryCredit"></span></client-only>
              The collocations and example sentences are provided by
              <a target="_blank" href="https://www.sketchengine.eu/">
                SketchEngine
              </a>
              . Languages population size from
              <a href="https://github.com/wooorm/speakers">
                github.com/wooorm/speakers
              </a>
              .
              <a
                href="https://www.vecteezy.com/free-vector/background"
              >
                Background Vectors by Vecteezy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  props: {
    dictionaryCredit: {
      default: undefined,
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
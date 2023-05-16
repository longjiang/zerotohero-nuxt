<template>
  <footer style="padding-bottom: 6rem">
    
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <!-- <Choose :showLanguageList="false" skin="dark" /> -->
          <!-- <div>
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
          </div> -->
          <div>
            <p>© {{ new Date().getFullYear() }} Zero to Hero Education, Canada.</p>
            <VersionInfo />
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
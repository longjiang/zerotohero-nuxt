<template>
  <div class="main">
    <div class="container pt-5 pb-5" v-cloak>
      <div class="row">
        <div class="col-sm-12">
          <div>
            <div class="text-center">
              <h3>Words by Topic</h3>
              <p>
                Browse Words by Theme. Themes are as classified under the Dewey
                decimal system.
              </p>
              <hr />
              <Loader class="mt-5" />
            </div>
            <ThemeBrowser />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>

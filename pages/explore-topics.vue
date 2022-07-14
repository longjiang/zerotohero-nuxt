<router>
  {
    path: '/:l1/:l2/explore/topics',
    meta: {
      title: 'Words by Topic | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'Explore new words by topics'
        }
      ]
    }
  }
</router>
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
import ThemeBrowser from "@/components/ThemeBrowser.vue";

export default {
  components: {
    ThemeBrowser,
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>

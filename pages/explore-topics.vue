<router>
  {
    path: '/:l1/:l2/explore/topics',
    meta: {
      title: 'Words by Topic | Zero to Hero',
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
    <div class="container pt-4 pb-4" v-cloak>
      <div class="row">
        <div class="col-sm-12">
          <div>
            <h4>Browse Words by Theme</h4>
            <p>Themes are as classified under the Dewey decimal system.</p>
            <hr />
            <Loader class="mt-5" />
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

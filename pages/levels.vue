<router>
  {
    path: '/:l1/:l2/explore/levels',
    meta: {
      title: 'Words by Level | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Learn words by levels (levels 1 to 6).'
        }
      ]
    }
  }
</router>
<template>
  <div class="container main mt-4 mb-4" v-cloak>
    <div class="row">
      <div class="col-sm-12">
        <div>
          <h4>Browse Words by HSK Courses</h4>
          <p>
            Each tiny square represents a word in the
            <a
              href="https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi"
              target="_blank"
              >HSK <i class="glyphicon glyphicon-new-window"></i
            ></a>
            curriculum.
          </p>
          <hr />
          <Loader class="mt-5" />
          <CourseBrowser />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CourseBrowser from '@/components/CourseBrowser.vue'

export default {
  components: {
    CourseBrowser
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {}
}
</script>
<style>

</style>

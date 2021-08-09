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
  <div class="container main pt-5 mb-5" v-cloak>
    <SocialHead
      :title="`HSK Words by Level | Chinese Zero to Hero`"
      :image="'/img/hsk-word-vis.jpg'"
      :description="'All the Chinese words in the HSK curriculum, as covered by the Chinese Zero to Hero courses.'"
    />
    <div class="row">
      <div class="col-sm-12">
        <div>
          <h4>Browse Words by HSK Courses</h4>
          <p>
            Each tiny square represents a word in the
            <a
              href="https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi"
              target="_blank"
            >
              HSK
              <i class="glyphicon glyphicon-new-window"></i>
            </a>
            curriculum.
          </p>
          <hr />
          <Loader class="mt-5" />
          <CourseBrowser />
        </div>
        <div>
          <h5 class="text-center mt-5 mb-3">All HSK words on a big, interactive chart:</h5>
          <a
            href="https://www.chinesezerotohero.com/hsk-word-vis/"
            target="_blank"
          >
            <img src="/img/hsk-word-vis.jpg" class="img-fluid shadow p-3" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CourseBrowser from "@/components/CourseBrowser.vue";

export default {
  components: {
    CourseBrowser,
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>
<style>
</style>

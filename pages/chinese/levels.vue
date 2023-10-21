<router>
  {
    path: '/:l1/:l2/explore/levels',
    meta: {
      title: 'Words by Level | Language Player',
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
  <div class="main">
    <div class="container pt-5 pb-5" v-cloak>
      <SocialHead
        :title="`HSK Words by Level | Language Player`"
        :image="'/img/hsk-word-vis.jpg'"
        :description="'All the Chinese words in the HSK curriculum, as covered by the Chinese Zero to Hero online courses.'"
      />
      <div class="row">
        <div class="col-sm-12">
          <div>
            <!-- <Sale class="mb-4" /> -->
            <h3 class="text-center">{{ $t('Browse Words by {level} Courses', { level: $t(l2LevelName($l2.code)) }) }} </h3>
            <p class="text-center">
              {{ $t('Each tiny square represents a word in the {level} curriculum.', { level: l2LevelName($l2.code) }) }}
            </p>
            <client-only>
              <div class="text-center">
                <Loader class="mt-5" />
              </div>
              <CourseBrowser class="mt-5 mb-5" />
            </client-only>
          </div>
          <div v-if="$l2.code === 'zh'">
            <h5 class="text-center mt-5 mb-3">
              {{ $t('All HSK words on a big, interactive chart:') }}
            </h5>
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
  </div>
</template>

<script>
import CourseBrowser from "@/components/CourseBrowser.vue";
import { l2LevelName } from '@/lib/utils'

export default {
  components: {
    CourseBrowser,
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {
    l2LevelName
  },
};
</script>
<style>
</style>

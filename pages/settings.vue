<router>
  {
    path: '/:l1/:l2/settings',
    meta: {
      title: 'Settings | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Change preferences: choose a different text corpus.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main mt-4 mb-5" v-cloak>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="jumbotron mt-5 p-4 bg-warning text-dark">
            Settings are <b>automatically saved</b> as soon as you make the
            change.
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <h1 class="page-title mb-4">
            {{ $t('Settings') }}
          </h1>
          <AnnotationSettings />
          <div>
            <h4>{{ $t('Text Corpus Settings') }}</h4>
            <p v-if="$l1.code === 'zh'">
              <a
                href="https://baike.baidu.com/item/%E8%AF%AD%E6%96%99%E5%BA%93"
                target="_blank"
                >语料库</a>是用大量语言文本编写而成的集合，让我们我们可以提取词语搭配和例句。我们的文本语料库由 <a href="https://www.sketchengine.eu/">Sketch Engine</a> 提供，有许多不同的英语语料库可供选择。根据你选择的语料库，你看到的例句和词语搭配会有所不同。
            </p>
            <p v-else>
              A
              <a
                href="https://en.wikipedia.org/wiki/Text_corpus"
                target="_blank"
                >text corpus</a
              >
              is a large collection of text written in a language, where we can
              extract collocations and example sentences.
              <a href="https://www.sketchengine.eu/">Sketch Engine</a>, our text
              corpora provider, has a number of {{ $l2.name }} text corpora to select
              from. Depending on the corpus you choose, the example sentences
              and collocations you see will be different.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <CorpusSelect />
    </div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <b-form-checkbox
            v-model="adminMode"
          >
            Enable administrative mode (no cache, more buttons)
          </b-form-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CorpusSelect from '@/components/CorpusSelect'
import AnnotationSettings from '@/components/AnnotationSettings'

export default {
  components: {
    CorpusSelect,
    AnnotationSettings
  },
  data() {
    return {
      adminMode: this.$settings.adminMode
    }
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  watch: {
    adminMode() {
      this.$store.commit('settings/SET_ADMIN_MODE', this.adminMode)
    }
  }
}
</script>
<template>
  <div class="main pt-3 pb-5" v-cloak>
    <div class="container text-center my-5" v-if="!settingsLoaded">
      <Loader message="Loading settings..." :sticky="true" />
    </div>
    <div v-else>
      <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <div>
              <h5 class="my-4">{{ $t("General settings") }}</h5>
              <b-form-checkbox
                v-model="localSettings.subsSearchLimit"
                @change="updateSettings"
              >
                {{ $t('Limit "this word in TV Shows" search result (faster)') }}
              </b-form-checkbox>
              <hr class="my-4" />
            </div>
            <div>
              <h5 class="my-4">
                {{ $t("Settings specific to {l2}", { l2: $t($l2.name) }) }}:
              </h5>
              <AnnotationSettings />
            </div>
            <hr class="my-4" />
            <div class="my-4">
              <h5>{{ $t("Content Preferences") }}</h5>
              <ContentPreferences />
            </div>
            <hr class="my-4" />
            <div>
              <h5>{{ $t("Text Corpus Settings") }}</h5>
              <p v-if="$l1.code === 'zh'">
                <a
                  href="https://baike.baidu.com/item/%E8%AF%AD%E6%96%99%E5%BA%93"
                  target="_blank"
                >
                  语料库
                </a>
                是用大量语言文本编写而成的集合，让我们我们可以提取词语搭配和例句。我们的文本语料库由
                <a href="https://www.sketchengine.eu/">Sketch Engine</a>
                提供，有许多不同的英语语料库可供选择。根据你选择的语料库，你看到的例句和词语搭配会有所不同。
              </p>
              <p v-else>
                A
                <a
                  href="https://en.wikipedia.org/wiki/Text_corpus"
                  target="_blank"
                >
                  text corpus
                </a>
                is a large collection of text written in a language, where we
                can extract collocations and example sentences.
                <a href="https://www.sketchengine.eu/">Sketch Engine</a>
                , our text corpora provider, has a number of {{ $l2.name }} text
                corpora to select from. Depending on the corpus you choose, the
                example sentences and collocations you see will be different.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="container-fluid">
        <CorpusSelect />
      </div>
    </div>
  </div>
</template>

<script>
import settingsMixin from '../../../lib/mixins/settings-mixin'

export default {
  mixins: [ settingsMixin ],
};
</script>

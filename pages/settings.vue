<router>
  {
    path: '/:l1/:l2/settings',
    meta: {
      title: 'Settings | Language Player',
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
  <div class="main pt-3 pb-5" v-cloak>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div>
            <h5>{{ $t('General settings') }}</h5>
            <b-form-checkbox v-model="subsSearchLimit">
              {{ $t('Limit "this word in TV Shows" search result (faster)') }}
            </b-form-checkbox>
            <hr />
          </div>
          <div>
            <h5>{{ $t('Settings specific to {l2}', {l2: $t($l2.name)})}}:</h5>
            <AnnotationSettings />
            <client-only>
              <div class="text-right">
                <b-form-checkbox
                  v-model="adminMode"
                  style="display: inline-block"
                  v-if="userIsAdmin"
                  class="mt-2 mb-4"
                >
                  {{ $t('Admin Mode') }}
                </b-form-checkbox>
              </div>
            </client-only>
          </div>
          <div class="mb-3">
            <h5>{{ $t('Content Preferences') }}</h5>
            <ContentPreferences />
          </div>
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
              is a large collection of text written in a language, where we can
              extract collocations and example sentences.
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
</template>

<script>
import CorpusSelect from "@/components/CorpusSelect";
import AnnotationSettings from "@/components/AnnotationSettings";
import { mapState } from "vuex";

export default {
  components: {
    CorpusSelect,
    AnnotationSettings,
  },
  mounted() {
    if (typeof this.$store.state.settings !== "undefined") {
      this.subsSearchLimit = this.$store.state.settings.subsSearchLimit;
      this.adminMode = this.$store.state.settings.adminMode;
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
        this.subsSearchLimit = this.$store.state.settings.subsSearchLimit;
        this.adminMode = this.$store.state.settings.adminMode;
      }
    });
  },
  data() {
    return {
      subsSearchLimit: true,
      adminMode: false,
    };
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
    userIsAdmin() {
      return this.$auth.user && this.$auth.user.role == 1;
    },
    ...mapState("settings", ["l2Settings", "l1", "l2"]),
  },
  watch: {
    subsSearchLimit() {
      this.$store.dispatch("settings/setGeneralSettings", {
        subsSearchLimit: this.subsSearchLimit,
      });
    },
    adminMode() {
      this.$store.dispatch("settings/setGeneralSettings", {
        adminMode: this.adminMode,
      });
    },
  },
};
</script>
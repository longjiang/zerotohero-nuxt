<router>
  {
    path: '/:l1/:l2/language-info',
    props: true,
  }
</router>
<template>
  <div class="main pb-5">
    <div class="container">
      <div class="row">
        <div class="col-sm-12" style="max-width: 50rem; margin: 0 auto">
          <div v-if="$route.params.l1 && $route.params.l1 && $l1 && $l2">
            <div class="pb-2">
              <h4 class="text-center my-4">
                {{ $t("About the {l2} language", { l2: $t($l2.name) }) }}
              </h4>
              <LazyLanguageInfoBox :lang="$l2" class="mb-4" />
              <LanguageAttributes />
            </div>
            <hr />
            </div>
            <div class="pb-3 pt-3" v-if="$l2.han">
              <h4 class="text-center mb-4">{{ $t("Dialects of Chinese") }}</h4>
              <p class="text-center">
                {{ $t("Bar graph shows number of speakers.") }}
              </p>
              <Dialects :skin="$skin" />
            </div>
            <div class="pb-2 pt-5" v-if="$l2.han">
              <h4 class="text-center">{{ $t("56 Ethnic Groups of China") }}</h4>
              <p class="text-center">
                {{ $t("Bar graph shows number of speakers.") }}
                ( {{ $t("2010 Numbers") }})
              </p>
              <FiftySixEthnic :skin="$skin" />
            </div>
            <div class="pb-2 pt-2">
              <hr />
              <h5 class="mt-3 mb-3 text-center">{{ $t("Ask ChatGPT") }}</h5>
              <ChatGPT
                :initialMessages="[
                  $t(
                    'What is the {l2} language (also known as {otherNames}, ISO639-3 code {isoCode}, glottolog ID {glottologId})? Could you give a few common phrases in the language, along with IPA transcriptions and {l1} translations?',
                    {
                      l2: $t($l2.name),
                      otherNames: $l2.otherNames.join(','),
                      isoCode: $l2['iso639-3'],
                      glottologId: $l2['glottologId'],
                      l1: $t($l1.name),
                    }
                  ),
                  $t(
                    'Could you please give the following words in {l2} (also known as {otherNames}, ISO639-3 code {isoCode}, glottolog ID {glottologId}), along with IPA transcriptions and {l1} translations: hello, yes, no, I, you, this, that, good, what, why, thank you, please, sorry.',
                    {
                      l2: $t($l2.name),
                      otherNames: $l2.otherNames.join(','),
                      isoCode: $l2['iso639-3'],
                      glottologId: $l2['glottologId'],
                      l1: $t($l1.name),
                    }
                  ),
                ]"
              />
              <div class="bg-accent rounded p-2 text-center">
                <b>{{ $t("Note:") }}</b>
                {{
                  $t(
                    "Some information about lesser-known languages may not be accurate."
                  )
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async mounted() {
    await this.$languages.loadFull();
  },
  beforeDestroy() {},
  computed: {},
  methods: {
    getSmart(...args) {
      let language = this.$languages.getSmart(...args);
      return language;
    },
    languageName(l2Code) {
      let language = this.$languages.getSmart(l2Code);
      if (language?.name) {
        let name = language.name.replace(/ \(.*\)/gi, "");
        return name;
      } else return l2Code;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";
:deep(.synced-transcript) {
  height: 5rem;
  overflow: hidden;
}

h3 {
  position: relative;
  font-size: 1.3rem;
}

.show-all {
  font-size: 1rem;
  margin-left: 1rem;
  display: inline-block;
  color: $primary-color;
}


</style>

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

            <h4 class="text-center my-4">
              {{ $t("About the {l2} language", { l2: $t($l2.name) }) }}
            </h4>
            <LazyLanguageInfoBox :lang="$l2" class="mb-4" />
            <TabbedSections v-bind="{ sections }">
              <template #facts>
                <div class="pb-2">
                  <LanguageAttributes />
                </div>
              </template>
              <template #dialects>
                <div class="pb-3 pt-3" v-if="$l2.han">
                  <h4 class="text-center mb-4">{{ $t("Dialects of Chinese") }}</h4>
                  <p class="text-center">
                    {{ $t("Bar graph shows number of speakers.") }}
                  </p>
                  <Dialects :skin="$skin" />
                </div>
              </template>
              <template #ethnic>
                <div class="pb-2 pt-5" v-if="$l2.han">
                  <h4 class="text-center">{{ $t("56 Ethnic Groups of China") }}</h4>
                  <p class="text-center">
                    {{ $t("Bar graph shows number of speakers.") }}
                    ( {{ $t("2010 Numbers") }})
                  </p>
                  <FiftySixEthnic :skin="$skin" />
                </div>
              </template>
              <template #phrases>
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
                  ]"
                  :showPrompt="true"
                  :key="`chatgpt-${$l2.code}-phrases`"
                />
                <div class="pb-2 pt-2">
                  <div class="bg-accent rounded p-2 text-center">
                    <b>{{ $t("Note:") }}</b>
                    {{
                      $t(
                        "Some information about lesser-known languages may not be accurate."
                      )
                    }}
                  </div>
                </div>
              </template>
              <template #words>
                <ChatGPT
                  :initialMessages="[
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
                  :showPrompt="true"
                  :key="`chatgpt-words-${$l2.id}`"
                />
                <div class="pb-2 pt-2">
                  <div class="bg-accent rounded p-2 text-center">
                    <b>{{ $t("Note:") }}</b>
                    {{
                      $t(
                        "Some information about lesser-known languages may not be accurate."
                      )
                    }}
                  </div>
                </div>
              </template>
            </TabbedSections>
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
  computed: {

    sections() {
      return [
        {
          name: "facts",
          title: "Facts",
          visible: true
        },
        {
          name: "dialects",
          title: "Dialects",
          visible: this.$l2.han
        },
        {
          name: "ethnic",
          title: "Ethnic Groups",
          visible: this.$l2.han
        },
        {
          name: "phrases",
          title: "Phrases",
          visible: true
        },
        {
          name: "words",
          title: "Vocabulary",
          visible: true
        },
      ];
    },
  },
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

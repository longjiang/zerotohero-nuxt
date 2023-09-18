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
              <h4 class="text-center mb-4">
                {{ $t("About the {l2} language", { l2: $t($l2.name) }) }}
              </h4>
              <LazyLanguageInfoBox :lang="$l2" class="mb-4" />
              <p v-if="$l2['iso639-1']">
                <b>{{ $t("ISO639-1:") }}</b>
                {{ $l2["iso639-1"] || $t("Not available") }}
              </p>
              <p>
                <b>{{ $t("ISO639-3:") }}</b>
                {{ $l2["iso639-3"] || $t("Not available") }}
              </p>
              <p v-if="$l2['glottologId']">
                <b>{{ $t("Glottolog ID:") }}</b>
                {{ $l2["glottologId"] }}
              </p>
              <p v-if="$l2['glottologFamilyId']">
                <b>{{ $t("Glottolog Family ID:") }}</b>
                {{ $l2["glottologFamilyId"] }}
              </p>
              <p v-if="$l2['glottologParentId']">
                <b>{{ $t("glottologParentId:") }}</b>
                {{ $l2["Glottolog Parent ID"] }}
              </p>
              <p>
                <b>{{ $t("Language Player Language ID:") }}</b>
                {{ $l2.id || $t("Not available") }}
              </p>
              <p v-if="$l2.lat && $l2.long">
                <b>{{ $t("Location (lat, long):") }}</b>
                {{ $l2.lat }}, {{ $l2.long }}
              </p>
              <p v-if="$l2.scope">
                <b>{{ $t("Language Scope:") }}</b>
                {{ scope[$l2.scope] }}
              </p>
              <p v-if="$l2.scope">
                <b>{{ $t("Language Type:") }}</b>
                {{ type[$l2.type] }}
              </p>
              <p v-if="$l2.scripts && $l2.scripts.length > 0">
                <b>{{ $t("Orthography Code:") }}</b>
                {{
                  $l2.scripts
                    ? $l2.scripts.map((s) => s.script).join(", ")
                    : $t("Not available")
                }}
              </p>
              <p v-if="$l2.otherNames?.length > 0">
                <b>{{ $t("Other names:") }}</b>
                {{ $l2.otherNames.join(",") }}
              </p>
              <p v-if="$l2.speakers">
                <b>{{ $t("Number of Speakers:") }}</b>
                {{ $l2.speakers ? $n($l2.speakers, $l1.code || 'en') : $t("Not available") }}
              </p>
              <p>
                <b>{{ $t("Native to:") }}</b>
                <span
                  v-for="c in $l2.country"
                  :key="`lang-country-${c.alpha2Code}`"
                  style="margin-right: 0.5rem"
                >
                  <img
                    :src="`/vendor/flag-svgs/${c.alpha2Code}.svg`"
                    class="flag-icon mr-1"
                  />
                  {{ c.name }}
                  <span v-if="c.languages?.length > 0">
                    ({{ $t("Also speaks:") }}
                    <span
                      v-for="(language, index) in c.languages"
                      :key="`c-${c.name}-l-${language}`"
                    >
                      <router-link
                        :to="{
                          name: 'language-info',
                          params: { l1: 'en', l2: language },
                        }"
                      >
                        {{ language }} </router-link
                      ><span v-if="index + 1 < c.languages.length">,</span>
                    </span>
                    )
                  </span>
                </span>
              </p>
            </div>
            <div class="pb-2 pt-5" v-if="$l2.han">
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
              <div class="alert alert-danger text-center">
                <b>{{ $t("Note:") }}</b> {{ $t('Some information about lesser-known languages may not be accurate.') }}
              </div>
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
                  $t(
                    'Please give a list of printed and online materials for learning the {l2} language (also known as {otherNames}, ISO639-3 code {isoCode}, glottolog ID {glottologId}).',
                    {
                      l2: $t($l2.name),
                      otherNames: $l2.otherNames.join(','),
                      isoCode: $l2['iso639-3'],
                      glottologId: $l2['glottologId'],
                    }
                  ),
                ]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      scope: {
        I: "Individual",
        M: "Macrolanguage",
        S: "Special",
      },
      type: {
        A: "Ancient",
        C: "Constructed",
        E: "Extinct",
        H: "Historical",
        L: "Living",
        S: "Special",
      },
    };
  },
  async mounted() {},
  beforeDestroy() {},
  computed: {
  },
  methods: {
    async getSmart(...args) {
      await this.$languages.loadFull();
      let language = this.$languages.getSmart(...args);
      return language;
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

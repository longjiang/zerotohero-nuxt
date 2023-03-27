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
                About the {{ $l2.name }} {{ $l2.level }}
              </h4>
              <LazyLanguageInfoBox :lang="$l2" class="mb-4" />
              <p v-if="$l2['iso639-1']">
                <b>ISO639-1:</b>
                {{ $l2["iso639-1"] || "Not available" }}
              </p>
              <p>
                <b>ISO639-3:</b>
                {{ $l2["iso639-3"] || "Not available" }}
              </p>
              <p v-if="$l2['glottologId']">
                <b>Glottolog ID:</b>
                {{ $l2["glottologId"] }}
              </p>
              <p v-if="$l2['glottologFamilyId']">
                <b>glottologFamilyId:</b>
                {{ $l2["glottologFamilyId"] }}
              </p>
              <p v-if="$l2['glottologParentId']">
                <b>glottologParentId:</b>
                {{ $l2["glottologParentId"] }}
              </p>
              <p>
                <b>Language Player ID:</b>
                {{ $l2.id || "Not available" }}
              </p>
              <p v-if="$l2.lat && $l2.long">
                <b>Location (lat, long):</b>
                {{ $l2.lat }}, {{ $l2.long }}
              </p>
              <p v-if="$l2.scope">
                <b>Scope:</b>
                {{ scope[$l2.scope] }}
              </p>
              <p v-if="$l2.scope">
                <b>Type:</b>
                {{ type[$l2.type] }}
              </p>
              <p v-if="$l2.scripts && $l2.scripts.length > 0">
                <b>Scripts used:</b>
                {{
                  $l2.scripts
                    ? $l2.scripts.map((s) => s.script).join(", ")
                    : "Not available"
                }}
              </p>
              <p v-if="$l2.otherNames?.length > 0">
                <b>Other names:</b>
                {{ $l2.otherNames.join(",") }}
              </p>
              <p v-if="$l2.speakers">
                <b>Number of Speakers:</b>
                {{ $l2.speakers ? $n($l2.speakers) : "Not available" }}
              </p>
              <p>
                <b>Native to:</b>
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
                    (Also speaks
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
                        {{ language }}
                      </router-link><span v-if="index + 1 < c.languages.length">,</span>
                    </span>
                    )
                  </span>
                </span>
              </p>
            </div>
            <div class="pb-2 pt-5" v-if="$l2.han">
              <h4 class="text-center mb-4">Dialects of Chinese</h4>
              <p class="text-center">Bar graph shows number of speakers.</p>
              <Dialects skin="light" />
            </div>
            <div class="pb-2 pt-5" v-if="$l2.han">
              <h4 class="text-center">56 Ethnic Groups of China</h4>
              <p class="text-center">
                Bar graph shows number of speakers. (2010 Numbers)
              </p>
              <FiftySixEthnic skin="light" />
            </div>
            <div class="pb-2 pt-2">
              <hr />
              <h5 class="mt-3 mb-3 text-center">Ask ChatGPT</h5>
              <div class="alert alert-danger text-center"><b>Note:</b> Some information about lesser-known languages may <em>not</em> be accurate.</div>
              <ChatGPT
                :initialMessages="[
                  `What is the ${$l2.name} language (also known as ${$l2.otherNames.join(',')}, ISO639-3 code ${$l2['iso639-3']}, glottolog ID ${$l2['glottologId']})? Could you give a few common phrases in the language, along with IPA transcriptions and ${$l1.name} translations?`,
                  `Could you please give the following words in ${$l2.name} (also known as ${$l2.otherNames.join(',')}, ISO639-3 code ${$l2['iso639-3']}, glottolog ID ${$l2['glottologId']}), along with IPA transcriptions and ${$l1.name} translations: hello, yes, no, I, you, this, that, good, what, why, thank you, please, sorry.`,
                  `Please give a list of printed and online materials for learning the ${$l2.name} language (also known as ${$l2.otherNames.join(',')}, ISO639-3 code ${$l2['iso639-3']}, glottolog ID ${$l2['glottologId']}).`,
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
        'I': 'Individual',
        'M': 'Macrolanguage', 
        'S': 'Special', 
      },
      type: {
        'A': 'Ancient',
        'C': 'Constructed',
        'E': 'Extinct',
        'H': 'Historical',
        'L': 'Living',
        'S': 'Special'
      }
    };
  },
  async mounted() {},
  beforeDestroy() {},
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  methods: {
    async getSmart(...args) {
      await this.$languages.loadFull()
      let language = this.$languages.getSmart(...args)
      return language
    }
  },
};
</script>

<style lang="scss" scoped>
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
  color: #28a745;
}
</style>
<router>
  {
    path: '/phonological-features',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div class="bg-white" style="min-height: 100vh">
    <SocialHead
      title="Phonological Features | Language Player"
      description="Input IPA symbols, output phonological features."
    />
    <SiteTopBar />

    <div class="container pb-5">
      <div class="row">
        <div class="col-sm-12 pt-5">
          <h3 class="mb-4 text-center">{{ $t("Phonological Features") }}</h3>

          <b-form-input
            v-model.lazy="ipa"
            @compositionend.prevent.stop="() => false"
            :placeholder="$t('Input IPA symbols')"
          />
          <div class="mt-2 text-right">
            <a
              href="https://www.internationalphoneticassociation.org/IPAcharts/inter_chart_2018/IPA_2018.html"
              target="_blank"
            >
              {{ $t("IPA keyboard") }}
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-sm-12 col-md-6 mb-4">
          <h6 v-if="ipa">
            <i18n path="Minimal phonological shared by {phonemes}:">
              <template v-slot:phonemes>
                <span
                  v-for="phoneme in phonemes"
                  :key="`phoneme-${phoneme}`"
                >
                  [{{ phoneme }}]
                </span>
              </template>
            </i18n>
          </h6>
          <div
            v-for="(value, feature) in minimalCommonFeatures"
            :key="`feature-${feature}`"
          >
            <template v-if="!unaryFeatures.includes(feature)">
              <template v-if="value">+</template>
              <template v-else>-</template>
            </template>
            {{ expand(feature) }}
          </div>
        </div>
        <div class="col-sm-12 col-md-6 mb-4">
          <h6 v-if="ipa">
            <i18n path="All phonological features shared by {phonemes}:">
              <template v-slot:phonemes>
                <span
                  v-for="phoneme in phonemes"
                  :key="`phoneme-${phoneme}`"
                >
                  [{{ phoneme }}]
                </span>
              </template>
            </i18n>
          </h6>
          <div
            v-for="(value, feature) in commonFeatures"
            :key="`feature-${feature}`"
          >
            <template v-if="!unaryFeatures.includes(feature)">
              <template v-if="value">+</template>
              <template v-else>-</template>
            </template>
            {{ expand(feature) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      ipa: "kɡŋxɣɰtʃ",
      features: undefined,
      unaryFeatures: ["labial", "coronal", "dorsal", "pharyngeal"],
      phonemes: [],
      commonFeatures: {},
      minimalCommonFeatures: {},
    };
  },
  computed: {
  },
  async mounted() {
    let l1 = this.$languages.getSmart(this.browserLanguage);
    this.$i18n.locale = l1.code;
    this.$i18n.setLocaleMessage(l1.code, l1.translations);
    let res = await axios.get(`/data/phonemes/phonemes.json`);
    if (res && res.data) {
      let features = res.data;
      features["ɡ"] = features["g"]; // Normalize ASCII 'g' to IPA /ɡ/ (different characters)
      delete features["g"];
      this.features = features;
    }
    if (this.features) {
      this.commonFeatures = this.getCommonFeatures(this.ipa);
      this.minimalCommonFeatures = this.minimizeCommonFeatures(
        this.commonFeatures
      );
    }
  },
  watch: {
    ipa() {
      if (this.features) {
        this.commonFeatures = this.getCommonFeatures(this.ipa);
        this.minimalCommonFeatures = this.minimizeCommonFeatures(
          this.commonFeatures
        );
      }
    },
  },
  methods: {
    expand(feature) {
      let full = {
        cons: "consonantal (cons)",
        son: "sonorant (son)",
        syl: "syllabic (syl)",
        ATR: "advanced tongue root (ATR)",
        SG: "spread glottis (SG)",
        CG: "constricted glottis (CG)",
        cont: "continuant",
        del_rel: "delayed release (del rel)",
      };
      if (this.unaryFeatures.includes(feature)) feature = feature.toUpperCase();
      return full[feature] ? full[feature] : feature;
    },
    getCommonFeatures(ipa) {
      this.phonemes = this.tokenize(ipa);
      let features = this.phonemes.map(
        (phoneme) => this.features[phoneme].features
      );
      let commonFeatures = {};
      for (let feature in features[0]) {
        let common = true;
        for (let phoneme of features) {
          if (phoneme[feature] !== features[0][feature]) {
            common = false;
          }
          if (this.unaryFeatures.includes(feature) && !features[0][feature]) {
            common = false;
          }
        }
        if (common === true) {
          commonFeatures[feature] = features[0][feature];
        }
      }
      return commonFeatures;
    },
    getFeatureValuePopularity(feature, value) {
      let popularity = 0;
      for (let key in this.features) {
        let phoneme = this.features[key].features;
        if (phoneme[feature] == value) {
          popularity += 1;
        }
      }
      return popularity;
    },
    minimizeCommonFeatures(commonFeatures) {
      let phonemeArray = [];
      let featuresArray = Object.keys(commonFeatures)
        .map((feature) => {
          let value = commonFeatures[feature];
          return {
            feature,
            value,
            popularity: this.getFeatureValuePopularity(feature, value),
          };
        })
        .sort((a, b) => a.popularity - b.popularity); // Most distinctive features first
      let minimalCommonFeatures = {};
      for (let phoneme in this.features) {
        phonemeArray.push(
          Object.assign({ phoneme }, this.features[phoneme].features)
        );
      }
      let filteredPhonemes = phonemeArray;
      for (let feature of featuresArray) {
        let unfilteredLength = filteredPhonemes.length;
        let featureName = feature.feature;
        filteredPhonemes = filteredPhonemes.filter((phoneme) => {
          return feature.value === phoneme[featureName];
        });
        if (filteredPhonemes.length < unfilteredLength) {
          minimalCommonFeatures[featureName] = feature.value;
        }
        if (filteredPhonemes.length === this.phonemes.length) {
          return minimalCommonFeatures;
        }
      }
      return minimalCommonFeatures;
    },
    tokenize(ipa) {
      let phonemes = Object.keys(this.features).sort(
        (a, b) => b.length - a.length
      );
      let tokens = [];
      let length = ipa.length;
      for (let i = 0; i < length; i++) {
        let found = false;
        for (let phoneme of phonemes) {
          if (ipa.startsWith(phoneme)) {
            found = true;
            tokens.push(phoneme);
            ipa = ipa.substring(phoneme.length);
          }
        }
        if (!found) ipa = ipa.substring(1);
      }
      return tokens.filter((token) => phonemes.includes(token));
    },
  },
};
</script>

<style lang="scss" scoped></style>

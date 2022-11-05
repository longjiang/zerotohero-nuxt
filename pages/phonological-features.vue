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
          <h3 class="mb-4 text-center">Phonological Features</h3>

          <b-form-input
            v-model.lazy="ipa"
            @compositionend.prevent.stop="() => false"
            placeholder="Type IPA symbols here"
          />
          <div class="mt-2">
            Need to type IPA? Use the
            <a
              href="https://www.internationalphoneticassociation.org/IPAcharts/inter_chart_2018/IPA_2018.html"
              target="_blank"
            >IPA keyboard</a>.
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-sm-12 col-md-6">
          <h6 v-if="ipa">
            <u>MINIMAL</u> set of phonological features that exclusively identify
            <span
              v-for="phoneme in this.phonemes"
              :key="`phoneme-${phoneme}`"
            >[{{ phoneme }}]</span>:
          </h6>
          <div v-for="(value, feature) in minimalCommonFeatures" :key="`feature-${feature}`">
            <template v-if="!unaryFeatures.includes(feature)">
              <template v-if="value">+</template>
              <template v-else>-</template>
            </template>
            {{ expand(feature) }}
          </div>
        </div>
        <div class="col-sm-12 col-md-6">
          <h6 v-if="ipa">
            <u>ALL</u> set of phonological features that exclusively identify
            <span
              v-for="phoneme in this.phonemes"
              :key="`phoneme-${phoneme}`"
            >[{{ phoneme }}]</span>:
          </h6>
          <div v-for="(value, feature) in commonFeatures" :key="`feature-${feature}`">
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
      ipa: "ʃʒθð",
      features: undefined,
      unaryFeatures: ["labial", "coronal", "dorsal", "pharyngeal"],
      phonemes: [],
      commonFeatures: {},
      minimalCommonFeatures: {}
    };
  },
  async mounted() {
    let res = await axios.get(`/data/phonemes/phonemes.json`);
    if (res && res.data) {
      this.features = res.data;
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
    }
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
        cont: "continuent",
        del_rel: "delayed release (del rel)"
      };
      if (this.unaryFeatures.includes(feature)) feature = feature.toUpperCase();
      return full[feature] ? full[feature] : feature;
    },
    getCommonFeatures(ipa) {
      this.phonemes = this.tokenize(ipa);
      let features = this.phonemes.map(
        phoneme => this.features[phoneme].features
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
    minimizeCommonFeatures(commonFeatures) {
      let phonemeArray = [];
      let minimalCommonFeatures = {};
      for (let phoneme in this.features) {
        phonemeArray.push(
          Object.assign({ phoneme }, this.features[phoneme].features)
        );
      }
      let filteredPhonemes = phonemeArray;
      console.log({ filteredPhonemes });
      for (let key in commonFeatures) {
        minimalCommonFeatures[key] = commonFeatures[key];
        filteredPhonemes = filteredPhonemes.filter(phoneme => {
          return commonFeatures[key] === phoneme[key];
        });
        console.log({
          key,
          value: commonFeatures[key],
          filteredPhonemes,
          minimalCommonFeatures
        });
        if (filteredPhonemes.length === this.phonemes.length) {
          return minimalCommonFeatures;
        }
      }
      return minimalCommonFeatures;
    },
    tokenize(ipa) {
      let phonemes = Object.keys(this.features);
      for (let phoneme of phonemes) {
        ipa = ipa.replace(phoneme, `!!!DELIMITER!!!${phoneme}!!!DELIMITER!!!`);
      }
      let tokens = ipa.split("!!!DELIMITER!!!");
      return tokens.filter(token => token !== "");
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
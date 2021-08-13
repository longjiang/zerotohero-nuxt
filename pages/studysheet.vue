<router>
  {
    path: '/:l1/:l2/studysheet/'
  }
</router>
<template>
  <div class="main pt-4 pb-5">
    <SocialHead
      :title="`${$l2.name} Study Sheet (PDF) Creator | ${$l2.name} Zero to Hero`"
      :description="`Generate ${$l2.name} guided readers for language learning.'`"
    />
    <div class="container">
      <div class="row mt-4">
        <div class="col-sm-12">
          <h3 class="mb-5 text-center">{{ $l2.name }} Study Sheet Generator</h3>
        </div>
        <div class="col-sm-12 col-md-6 mb-4">
          <textarea
            id="reader-textarea"
            class="form-control"
            cols="30"
            rows="5"
            v-model="translation"
            :placeholder="$t('Paste {l1} translation here', { l1: $l1.name })"
          ></textarea>
        </div>
        <div class="col-sm-12 col-md-6 mb-4">
          <textarea
            id="reader-textarea"
            class="form-control"
            cols="30"
            rows="5"
            v-model="text"
            :placeholder="$t('Paste {l2} text here', { l2: $l2.name })"
          ></textarea>
        </div>
      </div>
      <div class="row text-center mb-4">
        <div class="col-sm-12">
          <b-dropdown
            id="targetHSK"
            :text="targetLevel ? this.levels[targetLevel] : 'Target Level'"
            class="mr-1"
          >
            <b-dropdown-item
              v-for="level of [1, 2, 3, 4, 5, 6, 7]"
              :value="level"
              @click="setLevel(level)"
              v-bind:key="level"
            >
              {{ levels[level] }}
            </b-dropdown-item>
          </b-dropdown>
          <button class="btn btn-primary" @click="generate">
            {{ $t("Generate") }}
          </button>
          <br />
          <br />
          <div v-if="targetLevel === 7 && this.$l2.code === 'en'">
            <span class="rank-slider-label mr-2">{{ $t("More words") }}</span>
            <b-form-input
              id="minRankPercentage"
              v-model="minRankPercentage"
              type="range"
              min="0"
              max="1"
              step="0.01"
              class="rank-slider"
            ></b-form-input>
            <span class="ml-2 rank-slider-label">{{ $t("Less words") }}</span>
          </div>
        </div>
      </div>
      <div class="row mt-5">
        <div class="col-sm-12" v-bind:key="genKey" :class="targetLevelClasses">
          <StudySheet
            v-if="genKey > 0"
            :text="genText"
            :translation="genTranslation"
          />
        </div>
      </div>
    </div>
    <!-- .container -->
  </div>
</template>

<script>
import StudySheet from "@/components/StudySheet";
import SmartQuotes from "smartquotes";
import Helper from "@/lib/helper";

export default {
  components: {
    StudySheet,
  },
  data() {
    return {
      text: "",
      translation: "",
      targetLevel: 1,
      genText: "",
      genTranslation: "",
      genKey: 0,
      minRankPercentage: 0,
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
    levels() {
      if (this.$l2.code === "zh") {
        return {
          1: "HSK 1",
          2: "HSK 2",
          3: "HSK 3",
          4: "HSK 4",
          5: "HSK 5",
          6: "HSK 6",
          7: "Outside HSK",
        };
      } else if (this.$l2.code === "en") {
        return {
          1: "零基础",
          2: "A1（初级）",
          3: "A2（雅思3.5分以下）",
          4: "B1（雅思4～5分）",
          5: "B2（雅思5.5～6.5分）",
          6: "C1（雅思7～8分）",
          7: "C2（雅思8.5～9分）",
        };
      } else {
        return Helper.levels(this.$l2);
      }
    },
    targetLevelClasses() {
      let classes = {
        "show-level-1": this.targetLevel <= 1,
        "show-level-2": this.targetLevel <= 2,
        "show-level-3": this.targetLevel <= 3,
        "show-level-4": this.targetLevel <= 4,
        "show-level-5": this.targetLevel <= 5,
        "show-level-6": this.targetLevel <= 6,
        "show-level-outside": this.targetLevel <= 7,
      };
      return classes;
    },
  },
  watch: {
    text() {
      this.save(this.text, "zthStudySheetText");
    },
    translation() {
      this.save(this.translation, "zthStudySheetTranslation");
    },
    targetLevel() {
      this.save(this.targetLevel, "zthStudySheetTargetLevel");
    },
    async minRankPercentage() {
      if (this.$l2.code === "en") {
        let maxRank = await (await this.$getDictionary()).maxRank();
        let minRankPercentage = this.minRankPercentage;
        $(".word-block-dictionary, .word-block").each(function () {
          if ($(this).attr("data-rank") < minRankPercentage * maxRank) {
            $(this).addClass("low-rank");
          } else {
            $(this).removeClass("low-rank");
          }
        });
      }
    },
  },
  methods: {
    generate() {
      this.genText = SmartQuotes.string(this.text);
      this.genTranslation = SmartQuotes.string(this.translation);
      this.genKey++;
    },
    setLevel(level) {
      this.targetLevel = level;
    },
    getSaved(key) {
      let textJSON = localStorage.getItem(key);
      try {
        if (textJSON) {
          let saved = JSON.parse(textJSON);
          return saved;
        }
      } catch (e) {}
    },
    get(key) {
      let saved = this.getSaved(key);
      if (saved) {
        return saved[this.$l2.code] || "";
      } else {
        return "";
      }
    },
    save(text, key) {
      let saved = this.getSaved(key) || {};
      saved[this.$l2.code] = text;
      localStorage.setItem(key, JSON.stringify(saved));
    },
    breakIntoLines() {
      this.text = this.text
        .replace(/([。，？！：；、…]+)/g, "$1\n")
        .replace(/\n”/g, "”\n")
        .replace(/\n\n+/g, "\n\n")
        .replace(/[　\t]+/g, "");
    },
  },
  mounted() {
    const text = this.get("zthStudySheetText");
    if (text) {
      this.text = text;
    }
    const translation = this.get("zthStudySheetTranslation");
    if (translation) {
      this.translation = translation;
    }
    const targetLevel = this.get("zthStudySheetTargetLevel");
    if (targetLevel) {
      this.targetLevel = targetLevel;
    }
  },
};
</script>

<style lang="scss">
.rank-slider {
  display: inline-block;
  width: 10rem;
}
.word-block-dictionary.low-rank {
  display: none !important;
}

.rank-slider-label {
  display: inline-block;
  overflow: hidden;
}
</style>
<template>
  <div>
    <div class="row mb-3">
      <div class="col-sm-12" v-if="phrasebook">
        <h4 class="text-center">
          {{ $t(phrasebook.title, { l2: $t($l2.name) }) }}
        </h4>
        <div class="mt-2 text-center">
          {{ $t("{num} phrases", { num: phrasebook.phrases.length }) }}
        </div>
        <div class="text-center mt-3">
          <b-input-group :prepend="$t('Filter')">
            <b-form-input v-model.lazy="keyword"></b-form-input>
            <b-input-group-append>
              <b-button variant="primary">{{ $t("OK") }}</b-button>
            </b-input-group-append>
            <a
              :href="csvHref"
              :download="`${phrasebook.title}.csv`"
              v-if="csvHref"
              class="btn btn-secondary ml-1"
            >
              <i class="fa fa-download"></i>
              CSV
            </a>
          </b-input-group>
        </div>
        <div class="mt-3 phrasebook-description">
          <small v-html="phrasebook.description" class="mt-1 text-center" />
        </div>
      </div>
    </div>
    <!-- <div class="pt-3 pb-3 mb-3 hide-defs">
      <LazyHideDefs
        @hideWord="hideWord = arguments[0]"
        @hideDefinitions="hideDefinitions = arguments[0]"
        @hidePhonetics="hidePhonetics = arguments[0]"
      />
    </div> -->
    <div class="row" v-if="phrasebook">
      <div
        class="col-sm-12 mb-3 mt-3"
        v-if="startRow > 1"
        @click="startRow = 1"
      >
        <b-button variant="success" class="d-block w-100"
          ><i class="fa fa-chevron-up mr-1"></i>
          {{ $t("Show Previous {n} Phrases", { n: startRow - 1 }) }}</b-button
        >
      </div>
      <router-link
        v-for="(phraseObj, phraseIndex) in filteredPhrases.slice(
          Number(startRow) - 1,
          Number(startRow) + 1 + Number(numRowsVisible)
        )"
        :key="`phrasebook-phrase-${phraseObj.phrase}-${
          (phraseObj.id || phraseIndex) + 1
        }`"
        :id="`phrasebook-phrase-${(phraseObj.id || phraseIndex) + 1}`"
        class="link-unstyled col-sm-12 col-md-6 col-lg-4 mb-3 mt-3"
        :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/${
          phraseObj.id || phraseIndex
        }/${encodeURIComponent(phraseObj.phrase)}`"
        v-observe-visibility="
          phraseIndex === numRowsVisible - 1 ? visibilityChanged : false
        "
      >
        <div
          :class="{
            'rounded p-4 bg-accent phrasebook-card': true,
            'text-right': $l2.direction === 'rtl',
            'phrasebook-card-current':
              initId && (phraseObj.id || phraseIndex) + 1 == initId,
          }"
        >
          <div
            :class="`${$l2.direction === 'rtl' ? 'float-left' : 'float-right'}`"
            style="color: #ccc"
          >
            <div>#{{ (phraseObj.id || phraseIndex) + 1 }}</div>
            <div class="text-right" v-if="$adminMode">
              <i
                class="fa-solid fa-trash btn-remove"
                @click.prevent.stop="remove(phraseObj)"
              ></i>
            </div>
          </div>
          <div>
            <Saved
              :item="phraseItem(phraseObj)"
              store="savedPhrases"
              icon="bookmark"
              class="saved-button"
            />
            <span
              v-if="phraseObj && phraseObj.pronunciation"
              :class="{ transparent: hidePhonetics }"
            >
              {{ phraseObj.pronunciation }}
            </span>
          </div>

          <h4
            :data-level="
              phraseObj && phraseObj.level ? phraseObj.level : 'outside'
            "
            class="mb-0"
          >
            <TokenizedText
              :phonetics="!phraseObj.pronunciation"
              :popup="false"
              :class="{
                'hide-phonetics': hidePhonetics,
                'hide-word': hideWord,
              }"
              :text="phraseObj.phrase"
            />
          </h4>

          <div
            :class="{ 'mb-0': true, transparent: hideDefinitions }"
            v-if="phraseObj && (phraseObj[$l1.code] || phraseObj.en)"
          >
            {{ phraseObj[$l1.code] || phraseObj.en }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { makeTextFile } from "../lib/utils";

export default {
  props: {
    phrasebook: {
      type: Object,
    },
    initId: {
      default: undefined,
    },
  },
  data() {
    return {
      csvHref: undefined,
      numRowsVisible: 24,
      startRow: this.initId ? this.initId : 1,
      keyword: undefined,
      hideDefinitions: false,
      hidePhonetics: false,
      hideWord: false,
    };
  },
  mounted() {
    this.genCSV();
  },
  computed: {
    filteredPhrases() {
      if (this.keyword) {
        return this.phrasebook.phrases.filter((p) => {
          return (
            p.phrase.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1 ||
            (p[this.$l1.code] &&
              p[this.$l1.code].toLowerCase().indexOf(this.keyword) > -1) ||
            (p.en && p.en.toLowerCase().indexOf(this.keyword) > -1)
          );
        });
      } else {
        return this.phrasebook.phrases;
      }
    },
  },
  watch: {
    startRow() {
      if (!this.startRow || this.startRow < 1) {
        this.startRow = 1;
      }
    },
    keyword() {
      if (this.keyword) {
        this.startRow = 1;
      }
    },
  },
  methods: {
    remove(phraseObj) {
      this.$store.dispatch("phrasebooks/removePhrase", {
        phrasebook: this.phrasebook,
        phrase: phraseObj,
      });
    },
    genCSV() {
      let csv = Papa.unparse(
        this.phrasebook.phrases.map((p) => {
          let op = Object.assign({}, p);
          delete op.exact;
          return op;
        })
      );
      this.csvHref = makeTextFile(csv);
    },
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 24;
      }
    },
    phraseItem(phrase) {
      if (typeof phrase !== "undefined") {
        let phraseItem = {
          l2: this.$l2.code,
          phrase: phrase.phrase,
          phrasebookId: this.phrasebook.phrasebookId,
          pronunciation: phrase.pronunciation,
          exact: this.phrasebook.exact,
          translations: {},
        };
        if (phrase[this.$l1.code])
          phraseItem.translations[this.$l1.code] = phrase[this.$l1.code];
        else if (phrase.en) phraseItem.translations.en = phrase.en;
        return phraseItem;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";
.zerotohero-dark {
  .hide-defs {
    background-color: $bg-color-dark-1;
  }
}
.zerotohero-light {
  .hide-defs {
    background-color: $bg-color-light-1;
  }
}

.phrasebook-phrase-images {
  height: 3rem;
  white-space: nowrap;
  overflow: hidden;
  :deep(.image-wall-image) {
    height: 3rem;
    width: auto;
    object-fit: cover;
  }
}
.phrasebook-card {
  box-shadow: 0 5px 25px #55170435 !important;
  height: 100%;
}
.phrasebook-card-current {
  box-shadow: 0 0 30px rgba(255, 95, 32, 0.212) !important;
  transform: scale(1.2);
  position: relative;
  z-index: 2;
}

.saved-button {
  position: absolute !important;
  top: -7px;
  font-size: 1.3em;
}

:deep(.hide-phonetics) .word-block-pinyin {
  opacity: 0;
}

:deep(.hide-word) .word-block-text {
  opacity: 0;
}

.btn-remove:hover {
  color: #666;
}

:deep(.phrasebook-description) a {
  color: #777;
  text-decoration: underline;
}

.hide-defs {
  position: sticky;
  z-index: 2;
  top: 0;
  text-align: center;
}
</style>

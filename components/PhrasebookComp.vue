<template>
  <div>
    <div class="row mb-3">
      <div class="col-sm-12" v-if="phrasebook">
        <h4 class="text-center">{{ phrasebook.title }}</h4>
        <div class="mt-2 text-center">
          ({{ phrasebook.phrases.length }} phrases)
        </div>
        <div v-html="phrasebook.description" class="mt-1 text-center" />
        <div class="text-center mt-3">
          <b-input-group prepend="Start from #">
            <b-form-input v-model.lazy="startRow" type="number"></b-form-input>
            <b-input-group-append>
              <b-button variant="primary">OK</b-button>
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
      </div>
    </div>
    <div
      class="pt-3 pb-3 mb-3 bg-white"
      style="position: sticky; top: 0; z-index: 2"
    >
      <LazyHideDefs
        @hideWord="hideWord = arguments[0]"
        @hideDefinitions="hideDefinitions = arguments[0]"
        @hidePhonetics="hidePhonetics = arguments[0]"
      />
    </div>
    <div class="row" v-if="phrasebook">
      <router-link
        v-for="(phraseObj, phraseIndex) in phrasebook.phrases.slice(
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
            'rounded p-4 phrasebook-card': true,
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

          <Annotate
            :phonetics="!phraseObj.pronunciation"
            :popup="false"
            :class="{ 'hide-phonetics': hidePhonetics, 'hide-word': hideWord }"
          >
            <h4
              :data-level="
                phraseObj && phraseObj.level ? phraseObj.level : 'outside'
              "
              class="mb-0"
              v-html="phraseObj.phrase"
            />
          </Annotate>

          <div
            :class="{ 'mb-0': true, transparent: hideDefinitions }"
            v-if="phraseObj && phraseObj[$l1.code]"
          >
            {{ phraseObj[$l1.code] }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
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
      hideDefinitions: false,
      hidePhonetics: false,
      hideWord: false,
    };
  },
  mounted() {
    this.genCSV();
  },
  computed: {
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  watch: {
    startRow() {
      if (!this.startRow || this.startRow < 1) {
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
      this.csvHref = Helper.makeTextFile(csv);
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
        return phraseItem;
      }
    },
  },
};
</script>


<style lang="scss" scoped>
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
  background-color: white;
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
  top: -8px;
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
</style>
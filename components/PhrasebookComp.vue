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
            <b-form-input v-model.lazy="startRow"></b-form-input>
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
    <div class="row" v-if="phrasebook">
      <router-link
        v-for="(phraseObj, phraseIndex) in phrasebook.phrases.slice(
          Number(startRow) - 1,
          Number(startRow) + 1 + Number(numRowsVisible)
        )"
        :key="`phrasebook-phrase-${phraseObj.id}`"
        :id="`phrasebook-phrase-${phraseIndex}`"
        class="link-unstyled col-sm-12 col-md-6 col-lg-4 mb-3 mt-3"
        :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/${
          phraseObj.id
        }/${encodeURIComponent(phraseObj.phrase)}`"
        v-observe-visibility="
          phraseIndex === numRowsVisible - 1 ? visibilityChanged : false
        "
      >
        <div
          :class="{
            'rounded p-4 phrasebook-card': true,
            'text-right': $l2.direction === 'rtl',
            'phrasebook-card-current': initId && phraseIndex === initId,
          }"
        >
          <div
            :class="`${$l2.direction === 'rtl' ? 'float-left' : 'float-right'}`"
            style="color: #ccc"
          >
            #{{ phraseObj.id + 1 }}
          </div>
          <div>
            <Saved :item="phraseItem(phraseObj)" store="savedPhrases" />
            <span v-if="phraseObj && phraseObj.pronunciation">
              {{ phraseObj.pronunciation }}
            </span>
          </div>
          <Annotate :phonetics="false">
            <h4
              :data-level="
                phraseObj && phraseObj.level ? phraseObj.level : 'outside'
              "
              class="mb-0"
              v-html="phraseObj.phrase"
            />
          </Annotate>

          <div class="mb-0" v-if="phraseObj && phraseObj[$l1.code]">
            {{ phraseObj[$l1.code] }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    phrasebook: {
      type: Object,
    },
  },
  data() {
    return {
      csvHref: undefined,
      numRowsVisible: 24,
      startRow: 1,
      initId: undefined,
    };
  },
  mounted() {
    this.genCSV();
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
  },
  methods: {
    makeTextFile(text) {
      var data = new Blob([text], { type: "text/plain" });

      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
      }

      var textFile = window.URL.createObjectURL(data);

      // returns a URL you can use as a href
      return textFile;
    },
    genCSV() {
      let csv = Papa.unparse(this.phrasebook.phrases);
      this.csvHref = this.makeTextFile(csv);
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
  ::v-deep .image-wall-image {
    height: 3rem;
    width: auto;
    object-fit: cover;
  }
}
.phrasebook-card {
  background-color: white;
  box-shadow: 0 5px 20px #5517041c !important;
  height: 100%;
}
.phrasebook-card-current {
  box-shadow: 0 0 40px rgba(255, 95, 32, 0.301) !important;
  transform: scale(1.2);
  position: relative;
  z-index: 2;
  padding: 3rem !important;
  // background-color: rgb(250, 244, 241);
}
</style>
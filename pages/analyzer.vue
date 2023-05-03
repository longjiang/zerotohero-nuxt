<router>
  {
    path: '/:l1/:l2/analyzer',
    meta: {
      title: 'Analyze Cases in Text | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'Take a piece of text and figure out the case of each adjective + noun combo.'
        }
      ]
    }
  }
</router>
<template>
  <div class="analyzer main">
    <div class="container mb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="mt-5 mb-5">Analyze Russian Case Ending</h3>
          <div v-if="markedText">
            <div id="analyzed" v-html="markedText" class="mb-4"></div>
            <hr />
            <div id="legend" class="mt2">
              <span data-case="nominative">nominative</span>
              <span data-case="genitive">genitive</span>
              <span data-case="dative">dative</span>
              <span data-case="accusative">accusative</span>
              <span data-case="instrumental">instrumental</span>
              <span data-case="prepositional">prepositional</span>
              <span data-case="locative">locative</span>
            </div>
          </div>
          <textarea
            name="text"
            class="form-control mt-4 mb-2"
            id="text"
            v-model="text"
            cols="30"
            rows="10"
            style="width: 100%"
            placeholder="Paste some Russian text here to have the cases analyzed. Only works with adjective + noun pairs."
          ></textarea>
          <button v-on:click="analyze" class="btn btn-success btn-block">
            Analyze
          </button>
          <div id="popup" class="popup hidden"></div>
        </div>
      </div>
      <div class="row mt-5">
        <div class="col-sm-12">
          <h5>Study tips</h5>
          <ul>
            <li>
              Get lyrics of Russian songs at
              <a href="http://www.megalyrics.ru/lyric/kino/gruppa-krovi.htm">
                Megalyrics
              </a>
              . Paste in the analyzer. Study while you listen to the song.
            </li>
            <li>
              Use the
              <a href="https://readlang.com/">ReadLang tool</a>
              to look up text quickly.
            </li>
            <li>
              Use
              <router-link to="/cases/nouns">this tool</router-link>
              to learn noun endings in context.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    RussianLegacy.loadAllCsvsThen((files) => {
      this.files = files;
      this.adjTable = files.find((file) => file.pos === "adjective").data;
      this.nounTable = files.find((file) => file.pos === "noun").data;
    });
  },
  data() {
    return {
      files: undefined,
      adjTable: undefined,
      nounTable: undefined,
      text: "",
      markedText: "",
    };
  },
  methods: {
    analyze: function () {
      let html = RussianLegacy.markCases(this.text, this.adjTable, this.nounTable);
      this.markedText = html.replace(/\n/g, "<br>");
    },
  },
  updated: function () {
    $(".case-marked").hover(RussianLegacy.caseMarkedOver);
    $(".case-marked").mouseout(function () {
      $(".popup").addClass("hidden");
    });
  },
  computed: {},
};
</script>

<style>
#legend span {
  margin: 0.2rem;
  padding: 0.2rem;
}
</style>

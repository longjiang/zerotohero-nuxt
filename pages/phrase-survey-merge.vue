<router>
  {
    path: '/:l1/:l2/phrase-survey-merge',
    props: true
  }
</router>
<template>
  <div class="main container pt-5">
    <div class="row">
      <div :class="{ 'col-sm-12 mb-5': true }">
        <h4 class="text-center mb-5">Merge Phrase Survey Results</h4>
        <div class="mt-2 mb-2">Input CSV:</div>
        <b-form-textarea
          v-model.lazy="csv"
          style="height: 10rem"
        ></b-form-textarea>
        <div class="text-center mt-4 mb-4">
          <b-button variant="primary" @click="add">Add</b-button>
        </div>
        <template v-if="allLines && allLines.length > 0">
          <b-table
            small
            striped
            hover
            :items="allLines.slice(0, numRowsVisible)"
            :fields="fields"
            responsive
          ></b-table>
        </template>
        <div v-observe-visibility="visibilityChanged"></div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    start: {
      default: 0,
    },
  },
  data() {
    return {
      allLines: [],
      csv: undefined,
      fields: ["line", "count"],
      numRowsVisible: 20,
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    lines() {
      if (this.csv) {
        let csv = this.csv;
        return Papa.parse(csv, { header: true }).data;
      }
    },
  },
  methods: {
    add() {
      let sortedLines = this.allLines.concat(this.lines).sort((a, b) =>
        a.line.localeCompare(b.line, this.$l2.code)
      );
      let foldedLines = [];
      if (sortedLines.length > 0) {
        let lastSeen = sortedLines[0];
        for (let line of sortedLines.slice(1)) {
          line.count = Number(line.count)
          if (line.line === lastSeen.line) {
            lastSeen.count = lastSeen.count + line.count;
          } else {
            foldedLines.push(lastSeen);
            lastSeen = line;
          }
        }
      }
      foldedLines = foldedLines
        .sort((a, b) => a.line.length - b.line.length)
        .sort((a, b) => b.count - a.count);
      this.allLines = foldedLines
    },
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 100;
      }
    },
  },
};
</script>

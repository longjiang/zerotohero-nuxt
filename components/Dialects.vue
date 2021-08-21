<template>
  <div>
    <div
      v-for="(dialect, index) in dialects"
      :key="`dialect-${index}`"
      class="dialect-item"
    >
      <div class="dialect-languages">
        <LanguageList :langs="dialect.languages" :singleColumn="true" />
      </div>
      <div class="dialect-simplified">
        <Annotate :buttons="false">
          <span>{{ dialect.simplified }}</span>
        </Annotate>
      </div>
      <b-progress
        :max="dialects[0].population / Math.sqrt(dialects[0].population)"
        variant="success"
        class="progress-bar-wrapper"
      >
        <b-progress-bar
          :value="dialect.population / Math.sqrt(dialect.population)"
          class="progress-bar"
        ></b-progress-bar>
      </b-progress>
      <div style="width: 5rem; margin-top: 0.15rem" class="ml-2 small">
        {{ $n(Number(Math.ceil(dialect.population / 1000))) }} K
      </div>
    </div>
  </div>
</template>

<script>
import Papa from "papaparse";

export default {
  data: () => ({
    csv: `english	simplified	population	iso639-3
Mandarin	官话	920	zho|cmn
Jin	晋语	63.05	cjy
Wu	吴语	80	wuu
Xiang	湘语	38	hsn
Eastern Min	闽东语	9.5	cdo
Northern Min	闽北语	2.191	mnp
Central Min	闽中语	0.683	czo
Pu-Xian Min	莆仙话	2.6	cpx
Southern Min	闽南语	48	nan
Leizhou Min	雷州话	2.8	
Hakka	客家话	47.8	hak
Yue	粤语	84	yue
Pinghua	平话	7	csp|cnp`,
    dialects: undefined,
    population:
      1339724852 + // PRC
      23162000 + // ROC
      7024000 + // Hong Kong
      538219, // Macau
  }),
  async created() {
    let parsed = Papa.parse(this.csv, {
      header: true,
      delimiter: "	",
    });
    let dialects = parsed.data.map((g) => {
      g.languages = g["iso639-3"].split("|").map((l) => this.$languages.get(l));
      g.population = Number(g.population) * 1000000
      return g;
    });
    this.dialects = dialects.sort((a, b) => b.population - a.population);
  },
};
</script>

<style lang="scss" scoped>
.dialect-item {
  display: flex;
  padding: 0.5rem 0;
  max-width: 40rem;
  margin: 0 auto;
  &:not(:last-child) {
    border-bottom: 1px solid #00000022;
  }
  .dialect-english {
    width: 7rem;
  }
  .dialect-simplified {
    width: 7rem;
  }
  .dialect-languages {
    width: 15rem;
    margin-left: 1rem;
  }
  .progress-bar-wrapper {
    flex: 1;
    background: none;
    margin-top: 0.2rem;
    .progress-bar {
      background-color: #f4d03f;
      background-image: linear-gradient(228deg, #f4d03f 0%, #a06016 100%);
      background-size: 50vw;
      border-radius: 0.15rem;
      min-width: 0.3rem;
    }
  }
}
</style>
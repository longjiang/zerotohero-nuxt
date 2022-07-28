<template>
  <div class="dialects">
    <div
      v-for="(dialect, index) in dialects"
      :key="`dialect-${index}`"
      class="dialect-item"
    >
      <div class="dialect-languages">
        <LanguageList :langs="dialect.languages" :singleColumn="true" :skin="skin" />
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
      <!-- <div style="width: 5rem; margin-top: 0.15rem; white-space: nowrap;" class="ml-2 small">
        {{ $n(Number(Math.ceil(dialect.population / 1000))) }} K
      </div> -->
    </div>
  </div>
</template>

<script>
import Papa from "papaparse";

export default {
  props: {
    skin: {
      default: 'light'
    }
  },
  data: () => ({
    csv: `english	simplified	population	iso639-3	city	lat	long	dialectOf
Mandarin	官话	920	zho|cmn	Beijing	39.906667	116.3975	zh
Jin	晋语	63.05	cjy	Taiyuan	37.8704	112.5497	zh
Wu	吴语	80	wuu	Shanghai	31.228611	121.474722	zh
Xiang	湘语	38	hsn	Changsha	28.228	112.939	zh
Eastern Min	闽东语	9.5	cdo	Fuzhou	26.15	119.283333	zh
Northern Min	闽北语	2.191	mnp	Nanping	26.6415	118.1779	zh
Central Min	闽中语	0.683	czo	Sanming	26.263	117.639	zh
Pu-Xian Min	莆仙话	2.6	cpx	Putian	25.4526	119.0078	zh
Southern Min	闽南语	48	nan	Chaozhou	23.658	116.622	zh
Leizhou Min	雷州话	2.8	leiz1236	Leizhou	20.9143	110.0967	zh
Hakka	客家话	47.8	hak	Meizhou	24.289	116.122	zh
Yue	粤语	84	yue	Guangzhou	23.132	113.266	zh
Pinghua	平话	2	csp|cnp	Guilin	25.275	110.296	zh`,
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
      g.languages = g["iso639-3"].split("|").map((l) => this.$languages.getSmart(l));
      g.population = Number(g.population) * 1000000
      return g;
    });
    this.dialects = dialects.sort((a, b) => b.population - a.population);
  },
};
</script>

<style lang="scss" scoped>
.dialects {
  overflow-x: auto;
}
.dialect-item {
  display: flex;
  padding: 0.5rem 0;
  width: 35rem;
  margin: 0 auto;
  &:not(:last-child) {
    border-bottom: 1px solid #00000022;
  }
  .dialect-english {
    width: 7rem;
  }
  .dialect-simplified {
    width: 7rem;
    white-space: nowrap;
  }
  .dialect-languages {
    width: 16rem;
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
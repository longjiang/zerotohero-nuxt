<template>
  <div>
    <div
      v-for="(group, index) in groups"
      :key="`ethnic-group-${index}`"
      class="ethnic-group-item"
    >
      <div class="ethnic-group-languages">
        <LanguageList
          :langs="group.languages"
          :singleColumn="true"
          :skin="skin"
        />
      </div>
      <div class="ethnic-group-simplified">
        <Annotate :buttons="false">
          <span>{{ group.simplified }}</span>
        </Annotate>
      </div>
      <b-progress
        :max="groups[0].population / Math.sqrt(groups[0].population)"
        variant="success"
        class="ethnic-progress-bar-wrapper"
      >
        <b-progress-bar
          :value="group.population / Math.sqrt(group.population)"
          class="ethnic-progress-bar"
        ></b-progress-bar>
      </b-progress>
      <div style="width: 5rem; margin-top: 0.15rem" class="ml-2 small">
        {{ formatK(group.population) }}
      </div>
    </div>
  </div>
</template>

<script>
import Papa from "papaparse";
import axios from "axios";
import { SERVER, logError, formatK } from "@/lib/utils";

export default {
  props: {
    skin: {
      default: "light",
    },
  },
  data: () => ({
    groups: undefined,
    population:
      1339724852 + // PRC
      23162000 + // ROC
      7024000 + // Hong Kong
      538219, // Macau
  }),
  async created() {
    let res
    try {
      res = await axios.get(
        `${SERVER}data/56-ethnic-groups/56-ethnic-groups-of-china.csv.txt`
      );
    } catch (err) {
      logError(err);
    }
    if (res && res.data) {
      let parsed = Papa.parse(res.data, {
        header: true,
        delimiter: ",",
      });
      let groups = parsed.data.map((g) => {
        g.languages = g["iso639-3"]
          .split("|")
          .map((l) => this.$languages.getSmart(l));
        if (g.english === "Han Chinese")
          g.population = Math.floor(
            Number(g.population) +
              23162000 * 0.95 + // Taiwan
              7024000 * 0.92 + // Hong Kong
              539219 * 0.884
          ); // Macau
        return g;
      });
      this.groups = groups.sort((a, b) => b.population - a.population);
    }
  },
  methods: {
    formatK
  }
};
</script>

<style lang="scss" scoped>
.ethnic-group-item {
  display: flex;
  padding: 0.5rem 0;
  max-width: 40rem;
  margin: 0 auto;
  &:not(:last-child) {
    border-bottom: 1px solid #00000022;
  }
  .ethnic-group-english {
    width: 7rem;
  }
  .ethnic-group-simplified {
    width: 7rem;
  }
  .ethnic-group-languages {
    width: 15rem;
    margin-left: 1rem;
  }
  .ethnic-progress-bar-wrapper {
    flex: 1;
    background: none;
    margin-top: 0.2rem;
    .ethnic-progress-bar {
      background-color: #f4d03f;
      background-image: linear-gradient(228deg, #f4d03f 0%, #a06016 100%);
      background-size: 50vw;
      border-radius: 0.15rem;
      min-width: 0.3rem;
    }
  }
}
</style>
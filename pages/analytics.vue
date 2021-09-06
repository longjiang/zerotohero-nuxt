<router>
  {
    path: '/:l1/:l2/analytics',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5">
      <div class="row">
        <div :class="{ 'col-sm-12 mb-5': true }">
          <h3 class="text-center">
            Language Content Audit for
            <span class="text-primary">www.zerotohero.ca</span>
          </h3>
          <client-only>
            <table class="table mt-5" v-if="analytics">
              <thead class="table-header">
                <tr>
                  <th>Language</th>
                  <th>Views</th>
                  <th>
                    <i class="fa fa-play mr-2"></i>
                    Videos
                  </th>
                  <th>
                    <i class="fa fa-tv mr-2"></i>
                    Shows
                  </th>
                  <th>
                    <i class="fa fa-music mr-2"></i>
                    Songs
                  </th>
                  <th>
                    <i class="fa fa-film mr-2"></i>
                    Movies
                  </th>
                  <th>
                    <i class="fa fa-newspaper mr-2"></i>
                    News
                  </th>
                  <th>
                    <i class="fa fa-graduation-cap mr-2"></i>
                    Talks
                  </th>
                  <th>
                    <i class="fa fa-comment-alt mr-2"></i>
                    Phrasebooks
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in analytics.slice(0, numRowsVisible)"
                  :key="`analytics-row-${index}`"
                >
                  <td>
                    <LazyLanguageList :singleColumn="true" :langs="[row.l2]" />
                  </td>
                  <td>
                    {{ formatK(row.uniquePageViews) }}
                  </td>
                  <td :class="{ warn: row.youtube_videos < 3 }">
                    {{ formatK(row.youtube_videos) }}
                  </td>
                  <td :class="{ warn: row.tv_shows < 3 }">
                    {{ formatK(row.tv_shows) }}
                  </td>
                  <td :class="{ warn: row.Music < 3 }">
                    {{ formatK(row.Music) }}
                  </td>
                  <td :class="{ warn: row.Movies < 3 }">
                    {{ formatK(row.Movies) }}
                  </td>
                  <td :class="{ warn: row.News < 3 }">
                    {{ formatK(row.News) }}
                  </td>
                  <td :class="{ warn: row.talks < 3 }">
                    {{ formatK(row.talks) }}
                  </td>
                  <td :class="{ warn: row.phrasebook < 3 }">
                    {{ formatK(row.phrasebook) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-observe-visibility="infiniteScroll"></div>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import axios from "axios";
import Papa from "papaparse";
import Helper from "@/lib/helper";
import Vue from "vue";

export default {
  data() {
    return {
      analytics: undefined,
      numRowsVisible: 10,
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
  },
  async mounted() {
    let res = await axios.get(
      `${Config.server}data/analytics/analytics-2021-09-05.csv`
    );
    if (res && res.data) {
      let parsed = Papa.parse(res.data, { header: true });
      let rows = parsed.data;
      let l2Codes = Helper.unique(rows.map((r) => r.l2));
      let analytics = [];
      for (let l2Code of l2Codes) {
        let l2Rows = rows.filter((r) => r.l2 === l2Code);
        let l2 = this.$languages.getSmart(l2Code);
        if (!l2) continue;
        let data = {
          l2,
          pageViews: l2Rows.reduce((sum, r) => sum + Number(r.pageViews), 0),
          uniquePageViews: l2Rows.reduce(
            (sum, r) => sum + Number(r.uniquePageViews),
            0
          ),
          BounceRate: l2Rows[0].BounceRate,
          percentageExit: l2Rows[0].percentageExit,
          avgTimeOnPage: l2Rows[0].avgTimeOnPage,
        };
        analytics.push(data);
      }
      this.analytics = analytics;
      this.loadData();
    }
  },
  methods: {
    formatK() {
      return Helper.formatK(...arguments);
    },
    infiniteScroll(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 10;
      }
    },
    async loadData() {
      if (this.analytics) {
        let visibleRows = this.analytics.slice(0, this.numRowsVisible);
        for (let row of visibleRows) {
          for (let key of [
            "youtube_videos",
            "tv_shows",
            "talks",
            "phrasebook",
          ]) {
            if (!row[key]) {
              let res = await axios.get(
                `${Config.wiki}items/${key}?filter[l2][eq]=${row.l2.id}&filter[title][nin]=Movies,Music,News&limit=1&meta=filter_count`
              );
              if (res && res.data) {
                Vue.set(row, key, res.data.meta.filter_count);
              }
            }
          }
          for (let key of ["Music", "Movies", "News"]) {
            if (!row[key]) {
              let res = await axios.get(
                `${Config.wiki}items/youtube_videos?filter[l2][eq]=${
                  row.l2.id
                }&filter[${
                  "News" === key ? "talk" : "tv_show"
                }.title][eq]=${key}&limit=1&meta=filter_count`
              );
              if (res && res.data) {
                Vue.set(row, key, res.data.meta.filter_count);
              }
            }
          }
        }
      }
    },
  },
  watch: {
    async numRowsVisible() {
      this.loadData();
    },
  },
};
</script>
<style lang="scss" scoped>
.table-header {
  position: sticky;
  top: 0;
  background: #ccc;
  th {
    white-space: nowrap;
  }
}
.warn {
  background-color: rgb(248, 238, 238);
  color: rgb(170, 18, 18);
  font-weight: bold;
}
</style>
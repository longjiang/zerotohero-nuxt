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

          <b-input-group class="mt-5 mb-3 input-group-ghost-dark">
            <b-form-input
              v-model="keyword"
              @compositionend.prevent.stop="() => false"
              placeholder="Filter by language or country"
            />
            <b-input-group-append>
              <b-button variant="gray">
                <i class="fas fa-filter"></i>
              </b-button>
            </b-input-group-append>
          </b-input-group>
          <client-only>
            <table class="table mt-5" v-if="analytics">
              <thead class="table-header">
                <tr>
                  <th></th>
                  <th>Language</th>
                  <th>Views</th>
                  <th>All Videos</th>
                  <th>TV Shows</th>
                  <th>Music</th>
                  <th>Movies</th>
                  <th>News</th>
                  <th>Talks</th>
                  <th>Phrasebooks</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr
                  v-for="(row, index) in filteredRows.slice(0, numRowsVisible)"
                  :key="`analytics-row-${index}`"
                >
                  <td class="text-center">
                    <router-link
                      :to="{
                        name: 'home',
                        params: {
                          l1: l1(row.l2),
                          l2: row.l2.code,
                        },
                      }"
                    >
                      <img
                        :src="`/img/logo-square/${row.l2.code}.jpeg`"
                        :alt="row.l2.name"
                        :title="row.l2.logoDesc"
                        class="lang-logo"
                      />
                    </router-link>
                  </td>
                  <td>
                    <LazyLanguageList :singleColumn="true" :langs="[row.l2]" />
                  </td>
                  <td>
                    {{ formatK(row.uniquePageViews) }}
                  </td>
                  <td
                    :class="{ 'data-cell': true, warn: row.youtube_videos < 3 }"
                    @click="loadDataForRowKey(row, 'youtube_videos', true)"
                  >
                    <i class="fa fa-play-circle mr-2"></i>
                    {{ formatK(row.youtube_videos) }}
                  </td>
                  <td
                    :class="{ 'data-cell': true, warn: row.tv_shows < 3 }"
                    @click="loadDataForRowKey(row, 'tv_shows', true)"
                  >
                    <i class="fa fa-tv mr-2"></i>
                    {{ formatK(row.tv_shows) }}
                  </td>
                  <td
                    :class="{ 'data-cell': true, warn: row.Music < 3 }"
                    @click="loadDataForRowKey(row, 'Music', true)"
                  >
                    <i class="fa fa-music mr-2"></i>
                    {{ formatK(row.Music) }}
                  </td>
                  <td
                    :class="{ 'data-cell': true, warn: row.Movies < 3 }"
                    @click="loadDataForRowKey(row, 'Movies', true)"
                  >
                    <i class="fa fa-film mr-2"></i>
                    {{ formatK(row.Movies) }}
                  </td>
                  <td
                    :class="{ 'data-cell': true, warn: row.News < 3 }"
                    @click="loadDataForRowKey(row, 'News', true)"
                  >
                    <i class="fa fa-newspaper mr-2"></i>
                    {{ formatK(row.News) }}
                  </td>
                  <td
                    :class="{ 'data-cell': true, warn: row.talks < 3 }"
                    @click="loadDataForRowKey(row, 'talks', true)"
                  >
                    <i class="fa fa-graduation-cap mr-2"></i>
                    {{ formatK(row.talks) }}
                  </td>
                  <td
                    :class="{ 'data-cell': true, warn: row.phrasebook < 3 }"
                    @click="loadDataForRowKey(row, 'phrasebook', true)"
                  >
                    <i class="fa fa-comment-alt mr-2"></i>
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
      keyword: undefined,
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
    filteredRows() {
      let rows = this.analytics;
      rows = rows.filter((row) => {
        if (this.keyword) {
          let l = row.l2;
          let keyword = this.keyword.toLowerCase();
          if (l["iso639-1"].includes(keyword)) return true;
          if (l["iso639-3"].includes(keyword)) return true;
          if (l["glottologId"].includes(keyword)) return true;
          if (l["glottologFamilyId"].includes(keyword)) return true;
          if (l["glottologParentId"].includes(keyword)) return true;
          if (l.name.toLowerCase().includes(keyword)) return true;
          if (l.logoDesc.toLowerCase().includes(keyword)) return true;
          let countries = l.country.filter((c) =>
            c.name.toLowerCase().includes(keyword)
          );
          if (countries.length > 0) return true;
          return false;
        }
        return true;
      });
      return rows;
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
      this.analytics = analytics.sort((a, b) => b.l2.speakers - a.l2.speakers);
      this.loadData();
    }
  },
  methods: {
    l1(l2) {
      return ["en", "lzh", "hak", "nan"].includes(l2.code) ? "zh" : "en";
    },
    formatK() {
      return Helper.formatK(...arguments);
    },
    infiniteScroll(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 10;
      }
    },
    async loadDataForRowKey(row, key, forceRefresh) {
      let config = {};
      if (forceRefresh)
        config.headers = {
          // "Cache-Control": "no-cache", // Can't set CORS headers in directus config for some reason
        };
      if (["Music", "Movies", "News"].includes(key)) {
        let collection = "News" === key ? "talk" : "tv_show";
        let res = await axios.get(
          `${Config.wiki}items/youtube_videos?filter[l2][eq]=${row.l2.id}&filter[${collection}.title][eq]=${key}&limit=1&meta=filter_count`,
          config
        );
        if (res && res.data) {
          if (res.data.data[0])
            Vue.set(row, `${key}Id`, res.data.data[0][collection]);
          Vue.set(row, key, res.data.meta.filter_count);
        }
      } else {
        let res = await axios.get(
          `${Config.wiki}items/${key}?filter[l2][eq]=${row.l2.id}&filter[title][nin]=Movies,Music,News&limit=1&meta=filter_count`,
          config
        );
        if (res && res.data) {
          Vue.set(row, key, res.data.meta.filter_count);
        }
      }
    },
    async loadData() {
      if (this.filteredRows) {
        let visibleRows = this.filteredRows.slice(0, this.numRowsVisible);
        for (let row of visibleRows) {
          for (let key of [
            "youtube_videos",
            "tv_shows",
            "talks",
            "phrasebook",
          ]) {
            if (!row[key]) {
              this.loadDataForRowKey(row, key);
            }
          }
          for (let key of ["Music", "Movies", "News"]) {
            if (!row[key]) {
              this.loadDataForRowKey(row, key);
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
.table-body {
  td {
    vertical-align: middle;
    .lang-logo {
      width: 3rem;
      height: 3rem;
      object-fit: cover;
      border-radius: 100%;
    }
    &.data-cell {
      cursor: pointer;
      &:hover {
        background-color: #efefef;
      }
    }
  }
}
.warn {
  background-color: rgb(248, 238, 238);
  color: rgb(170, 18, 18);
  font-weight: bold;
}
</style>
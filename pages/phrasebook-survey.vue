<router>
  {
    path: '/phrasebook-survey/:start?',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5">
      <div class="row">
        <div :class="{ 'col-sm-12 mb-5': true }">
          <h4 class="text-center">Interlingual Phrasebook Survey</h4>
          <div
            class="text-center pt-2 pb-2 mb-5"
            v-if="phrases && phrasebooks && langs && groups"
          >
            {{ phrases.length }} phrases in {{ phrasebooks.length }} phrasebooks
            surveyed, across {{ langs.length }} languages.
            <router-link
              :to="{
                name: 'phrasebook-creator',
                params: {
                  l1: 'en',
                  l2: 'en',
                  csvProp: groups
                    .filter(g => g.instances.length > 20)
                    .slice(0, 1000)
                    .map((l) => l.en)
                    .join('\n'),
                },
              }"
            >
              Make Phrasebook
            </router-link>
          </div>
          <div
            :class="{
              'loader text-center mb-4': true,
              'd-none': !gettingPhrases,
            }"
            style="flex: 1"
          >
            <Loader :sticky="true" message="Getting phrases..." />
          </div>
          <template v-if="groups && groups.length > 0">
            <b-table
              small
              striped
              hover
              :items="groups.slice(0, numRowsVisible)"
              :fields="fields"
              responsive
            >
              <template #cell(rank)="data">
                {{ data.index + 1 }}
              </template>
              <template #cell(line)="data">
                <div>
                  {{ data.item.en }}
                </div>
                <div v-if="expand[data.index]" class="mt-2 mb-2 ml-2">
                  <div
                    v-for="(phrase, index) of data.item.instances"
                    :key="`phrase-${index}`"
                  >
                    <pre>{{ phrase }}</pre>
                    <hr />
                  </div>
                </div>
              </template>
              <template #cell(count)="data">
                {{ data.item.instances.length }}
              </template>
              <template #cell(actions)="data">
                <b-button
                  size="sm"
                  variant="success"
                  @click="toggle(data.index)"
                >
                  <span v-if="expand[data.index]">Collapse</span>
                  <span v-if="!expand[data.index]">Expand</span>
                </b-button>
              </template>
            </b-table>
          </template>
          <div v-observe-visibility="visibilityChanged"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Papa from "papaparse";
import Vue from "vue";
import { unique } from "@/lib/utils";

export default {
  props: {
    start: {
      default: 0,
    },
  },
  data() {
    return {
      groups: undefined,
      phrases: undefined,
      phrasebooks: undefined,
      langs: undefined,
      fields: ["rank", "line", "count", "actions"],
      numRowsVisible: 20,
      gettingPhrases: false,
      expand: {},
    };
  },
  async mounted() {
    await this.surveyPhrases();
  },
  methods: {
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 100;
      }
    },
    toggle(index) {
      Vue.set(this.expand, index, this.expand[index] ? false : true);
    },
    async surveyPhrases() {
      this.gettingPhrases = true;
      let res = await this.$directus.get(`items/phrasebook`);
      if (res && res.data) {
        let phrasebooks = res.data.data;
        for (let phrasebook of phrasebooks) {
          phrasebook.phrases = Papa.parse(phrasebook.phrases, {
            header: true,
          }).data.map((p, id) => {
            p.id = id;
            return p;
          });
        }
        let phrases = phrasebooks.reduce(
          (phrases, phrasebook) => phrases.concat(phrasebook.phrases),
          []
        );
        phrases = phrases.filter((p) => p.en);
        let groups = this.sortPhrases(phrases, "en");
        this.langs = unique(phrasebooks.map((p) => p.l2));
        this.phrases = phrases;
        this.phrasebooks = phrasebooks;
        this.groups = groups.slice(0, 1000);
        this.gettingPhrases = false;
      }
    },
    sortPhrases(phrases, key) {
      let sortedPhrases = phrases.sort((a, b) => a[key].localeCompare(b[key]));
      let groups = [];
      if (sortedPhrases.length > 0) {
        let group = {
          instances: [sortedPhrases[0]],
        };
        group[key] = sortedPhrases[0][key];
        for (let phrase of sortedPhrases) {
          // Case insensitive comparison, so we don't get duplicate phrases that differ only in case.
          if (phrase[key].toUpperCase() === group[key].toUpperCase()) {
            group.instances.push(phrase);
          } else {
            groups.push(group);
            // Start a new group
            group = {
              instances: [phrase],
            };
            group[key] = phrase[key];
          }
        }
      }
      groups = groups
        .sort((a, b) => a[key].length - b[key].length)
        .sort((a, b) => b.instances.length - a.instances.length);
      return groups;
    },
  },

  computed: {
  },
};
</script>
<style lang="scss" scoped>
</style>
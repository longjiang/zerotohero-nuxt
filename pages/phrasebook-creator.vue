<router>
  {
    path: '/:l1/:l2/phrasebook-creator',
    props: true
  }
</router>
<template>
  <div>
    <div class="container main pt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <h4 class="mb-4">New phrasebook</h4>
          <b-form-input
            placeholder="Title"
            class="mt-2 mb-2"
            v-model="title"
          ></b-form-input>
          <b-form-input
            v-model="sourceURL"
            :lazy="true"
            class="mt-2 mb-2"
            placeholder="Source URL"
          ></b-form-input>
          <AssignShow
            @assignShow="assignShow"
            :enableNewShow="false"
            type="tv-shows"
          />
          <div v-if="this.show">Associated with show {{ this.show.title }} (ID: {{ this.show.id }})</div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="mt-2 mb-2">Input CSV:</div>
          <b-form-textarea
            v-model="csv"
            :lazy="true"
            style="height: calc(100vh - 30rem)"
          ></b-form-textarea>
          <div class="mt-3">
            <b-button variant="success" v-if="!saving && !saved" @click="save">
              Save
            </b-button>
            <span v-if="saving">
              <i class="fas fa-hourglass mr-2 text-secondary"></i>
              Saving...
            </span>
            <span v-if="saved && saved.id">
              <i class="fas fa-check-circle mr-2 text-success"></i>
              Saved
              <router-link
                :to="`/${$l1.code}/${$l2.code}/phrasebook/${saved.id}/`"
              >
                View {{ saved.title }}
              </router-link>
            </span>
            <b-form-checkbox v-model="exact" class="d-inline-block ml-2">Exact</b-form-checkbox>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mt-2 mb-2">Data preview (<a href="#" @click.prevent="flip = !flip">flip</a>):</div>
          <b-table
            v-if="rows"
            small
            striped
            hover
            :items="rows"
            responsive
          ></b-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Config from "@/lib/config";
import Papa from "papaparse";

export default {
  props: {},
  data() {
    return {
      title: undefined,
      csv: undefined,
      phrasebook: undefined,
      words: undefined,
      sourceURL: undefined,
      saved: undefined,
      saving: false,
      flip: false,
      show: undefined,
      showType: undefined
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
    rows() {
      if (this.csv) {
        let headerRow = "phrase\t" + this.$l1.code + "\tpronunciation\n";
        if (this.flip) headerRow = this.$l1.code + "\tphrase\tpronunciation\n";
        let csv = headerRow + this.csv;
        return Papa.parse(csv, { header: true }).data;
      }
    },
  },
  methods: {
    assignShow(show, type) {
      this.show = show
      this.showType = type
    },
    async save() {
      let phrases = Papa.unparse(this.rows);
      let phrasebook = {
        title: this.title,
        phrases,
        l2: this.$l2.id,
      };
      if (this.show && this.showType) {
        phrasebook[this.showType] = this.show.id
        phrasebook.exact = true
      }
      if (this.exact) phrasebook.exact = true
      if (this.sourceURL) {
        phrasebook.description = `Source: <a href="${this.sourceURL}">${this.sourceURL}</a>`
      }
      this.saving = true;
      try {
        let res = await axios.post(
          `${Config.wiki}items/phrasebook`,
          phrasebook
        );
        if (res && res.data) {
          this.saved = res.data.data;
        }
        this.saving = false;
        this.$store.dispatch("phrasebooks/load", {
          l2: this.$l2,
          adminMode: this.$store.state.settings.adminMode,
        });
      } catch (err) {
        this.saving = false;
        console.log(err);
      }
    },
  },
};
</script>

<style></style>

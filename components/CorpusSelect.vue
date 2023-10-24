<template>
  <div class="corpus-select">
    <table class="table table-bordered table-responsive">
      <thead>
        <tr>
          <th></th>
          <th>{{ $t("Corpus") }}</th>
          <th>{{ $t("Code") }}</th>
          <th>{{ $t("Language") }}</th>
          <th>{{ $t("Words") }}</th>
          <th>{{ $t("Note") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(corpus, index) in corpora"
          :key="`corpora-select-row-${index}`"
        >
          <td>
            <b-form-radio :value="corpus.corpname" v-model="localL2Settings.corpname" @change="updateL2Settings" />
          </td>
          <td>{{ corpus.name }}</td>
          <td>
            <code>{{ corpus.corpname.replace("preloaded/", "") }}</code>
          </td>
          <td>{{ corpus.language_name }}</td>
          <td class="text-right">
            {{ Intl.NumberFormat("en-US").format(corpus.sizes.wordcount) }}
          </td>
          <td>
            {{ corpus.info }}
            <ul>
              <li v-if="corpus.is_featured">Featured.</li>
              <li v-if="corpus.aligned">
                Parallel. That means L1 translation is available.
              </li>
              <li v-if="corpus.diachronic">
                Diachronic. That means time information is available.
              </li>
              <li v-if="corpus.tags && corpus.tags.includes('spoken')">
                Spoken.
              </li>
              <li v-if="corpus.tags && corpus.tags.includes('web')">Web.</li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

import settingsMixin from '../lib/mixins/settings-mixin'
import SketchEngine from "../lib/sketch-engine";

export default {
  mixins: [ settingsMixin ],
  data() {
    return {
      SketchEngine,
      corpora: null,
    };
  },
  async mounted() {
    this.corpora = await this.getCorpora();
    this.localL2Settings.corpname = await SketchEngine.corpname(this.$l2);
  },
  methods: {
    async getCorpora() {
      let corpora = await SketchEngine.getCorpora();
      corpora = corpora || []
      corpora = corpora
        .filter(
          (corpus) =>
            [this.$l2.code]
              .concat(this.$l2.locales || [])
              .includes(corpus.language_id) &&
            !(corpus.tags && corpus.tags.includes("learner"))
        )
        .sort((a, b) => b["wordcount"] - a["wordcount"]);
      return corpora;
    },
  },
};
</script>

<style></style>

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
        <tr v-for="(corpus, index) in corpora" :key="`corpora-select-row-${index}`">
          <td>
            <b-form-radio
              :value="corpus.corpname"
              v-model="corpname"
            />
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
import SketchEngine from "@/lib/sketch-engine";
export default {
  data() {
    return {
      SketchEngine,
      corpname: undefined,
      corpora: undefined
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
  },
  async mounted() {
    this.corpora = await this.getCorpora()
    this.corpname = await SketchEngine.corpname(this.$l2)
  },
  watch: {
    corpname() {
      let corpnames = JSON.parse(localStorage.getItem("zthCorpnames")) || {};
      corpnames[this.$l2.code] = this.corpname;
      localStorage.setItem("zthCorpnames", JSON.stringify(corpnames));
    },
  },
  methods: {
    async getCorpora() {
      let corpora = await SketchEngine.getCorpora();
      corpora = corpora
        .filter(
          (corpus) =>
            [this.$l2.code].concat(this.$l2.locales || []).includes(corpus.language_id) &&
            !(corpus.tags && corpus.tags.includes("learner"))
        )
        .sort((a, b) => b['wordcount'] - a['wordcount']);
      return corpora;
    },
  }
};
</script>

<style></style>

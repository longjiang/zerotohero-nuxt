<template>
  <Widget id="entry-morphology">
    <template #title>{{
      $t("Word forms of “{word}”", { word: word.head })
    }}</template>
    <template #body>
      <Inflections :data="tables" />
    </template>
  </Widget>
</template>

<script>
import { isEmpty, ucFirst, groupArrayBy } from "@/lib/utils";

export default {
  props: {
    word: {
      type: Object,
    },
  },
  data() {
    return {
      tables: {},
      checking: true,
    };
  },
  watch: {
    word() {
      this.getTables();
    },
  },
  mounted() {
    this.getTables();
  },
  methods: {
    isEmpty(...args) {
      return isEmpty(...args);
    },
    ucFirst(...args) {
      return ucFirst(...args);
    },
    async getTables() {
      // https://www.consolelog.io/group-by-in-javascript/
      this.checking = true;
      let dictionary = await this.$getDictionary();
      let forms = await dictionary.inflect(this.word.head);
      forms = forms.filter((form) => form.table !== "head");
      this.tables = groupArrayBy(forms, "table");
      this.checking = false;
    },
  },
};
</script>
<style scoped>
@media screen and (min-width: 768px) {
  .form-table-content {
    columns: 1;
    column-gap: 2rem;
  }
}
@media screen and (min-width: 992px) {
  .form-table-content {
    columns: 2;
    column-gap: 2rem;
  }
}
@media screen and (min-width: 1200px) {
  .form-table-content {
    columns: 3;
    column-gap: 2rem;
  }
}
</style>

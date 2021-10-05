<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12 text-center definitions">
        <Merge direction="top" class="h-half d-none d-sm-block" />
        <DefinitionsList
          v-if="defCommon"
          :definitions="defCommon"
          nodef="(no common definitions)"
          class="mt-2 mb-2"
        ></DefinitionsList>
        <Merge direction="bottom" class="h-half d-none d-sm-block" />
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-6 text-center">
        <DefinitionsList
          v-if="defDistinctA"
          :definitions="defDistinctA"
          :singleColumn="true"
        ></DefinitionsList>
      </div>
      <div class="col-6 text-center">
        <DefinitionsList
          v-if="defDistinctB"
          :definitions="defDistinctB"
          :singleColumn="true"
        ></DefinitionsList>
      </div>
    </div>
  </div>
</template>

<script>
import DefinitionsList from "@/components/DefinitionsList.vue";
import Merge from "@/components/Merge";

export default {
  components: {
    DefinitionsList,
    Merge,
  },
  props: ["a", "b"],
  data() {
    return {
      defCommon: undefined,
      defDistinctA: undefined,
      defDistinctB: undefined,
    };
  },
  mounted() {
    this.common(this.a, this.b);
  },
  methods: {
    defListIncludes(defList, def) {
      return defList.find((d) => def.includes(d));
    },
    common(a, b) {
      this.defCommon = a.definitions.filter(def => b.definitions.includes(def));
      this.defDistinctA = a.definitions.filter(def => !b.definitions.includes(def));
      this.defDistinctB = b.definitions.filter(def => !a.definitions.includes(def));
    },
  },
};
</script>

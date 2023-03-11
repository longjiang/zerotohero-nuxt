<template>
  <div :key="'grammar-' + grammarKey">
    <div class="text-center" v-if="grammarPoints && grammarPoints.length > 0">
      <div class="widget-title mb-2">{{ $t('Grammar Notes') }}</div>
      <div class="grammar-notes" id="grammar">
        <GrammarPoint
          v-for="(grammar, index) in grammarPoints"
          :key="`grammar-point-${index}`"
          :grammar="grammar"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Grammar from "@/lib/grammar";
import GrammarPoint from "@/components/GrammarPoint";

export default {
  props: {
    text: {
      type: String,
    },
  },
  components: {
    GrammarPoint,
  },
  data() {
    return {
      grammarKey: 0,
      grammarPoints: undefined,
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
  mounted() {
    this.grammarPoints = Grammar.lookupFuzzy(this.text);
    this.grammarKey += 1;
  },
};
</script>

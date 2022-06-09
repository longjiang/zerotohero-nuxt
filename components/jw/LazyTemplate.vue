<template>
  <v-runtime-template :template="template" ref="template" />
</template>

<script>
import VRuntimeTemplate from "v-runtime-template";
export default {
  props: ["template", "studyElem"],
  components: {
    VRuntimeTemplate,
  },
  computed: {
    jwAnchors() {
      let templateRef = this.$refs.template.$children[0];
      if (templateRef.$children && templateRef.$children.length > 0) {
        return templateRef.$children.filter(
          ($child) => $child._name === "<JWAnchor>"
        );
      } else {
        return [];
      }
    },
  },
  methods: {
    toggleMaximizeAllRefs() {
      let collapsed = undefined
      for (let anchor of this.jwAnchors) {
        if (collapsed === undefined) {
          collapsed = anchor.collapsed;
        }
        collapsed ? anchor.maximize() : anchor.minimize();
      }
    },
    expandAllJWAnchors() {
      let expand = undefined
      for (let anchor of this.jwAnchors) {
        if (expand === undefined) {
          expand = anchor.expand;
        }
        anchor.expand  = !expand
      }
    },
  },
};
</script>

<style>
</style>
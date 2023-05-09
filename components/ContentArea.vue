<template>
  <div class="content-area zth-content">
    <slot></slot>
  </div>
</template>
<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState("settings", ["l1", "l2"]),
  },
};

</script>

<style scoped>
.content-area {
  grid-area: content;
  overflow: auto;
  padding-bottom: 5rem;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.zerotohero-wide .content-area {
  padding-bottom: 0;
}
</style>

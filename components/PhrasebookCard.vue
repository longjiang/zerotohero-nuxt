<template>
  <div class="media rounded shadow phrasebook">
    <router-link
      :class="`phrasebook-thumb link-unstyled bg-gradient-${phrasebook.title.length
        .toString()
        .split('')
        .pop()}`"
      :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/`"
    >
      <i class="fas fa-book"></i>
    </router-link>
    <div class="media-body">
      <router-link
        class="link-unstyled"
        :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/`"
      >
        <h5>{{ phrasebook.title }}</h5>
      </router-link>
      <div style="color: #999">({{ phrasebook.phrases.length }} phrases)</div>

      <b-button
        v-if="$adminMode"
        class="btn btn-small bg-danger text-white mt-2 ml-0"
        @click.stop.prevent="remove(phrasebook)"
      >
        <i class="fa fa-trash"></i>
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    phrasebook: {
      type: Object,
    },
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
  },
};
</script>

<style lang="scss" scoped>
.phrasebook {
  height: 100%;
  .phrasebook-thumb {
    width: 100%;
    display: block;
    padding: 0.5rem 0 0.5rem 1rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 2em;
    overflow: hidden;
  }
}
</style>
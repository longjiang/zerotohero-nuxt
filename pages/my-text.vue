<router>
  {
    path: '/:l1/:l2/my-text/',
    props: true,
  }
</router>
<template>
  <div class="main pt-3 pb-5">
    <SocialHead
      :title="`My ${$l2.name} Text | Zero to Hero`"
      :description="`Read ${$l2.name} text with phonetic annotation dictionary lookup. Save new words for review.`"
    />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div v-for="savedText in savedtexts" :key="savedText.id">
            <TextCard :text="savedText" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
    };
  },
  mounted() {
    if (!this.loadedByL2?.[this.$l2.code]) {
      this.$store.dispatch('savedText/load', {l2: this.$l2, adminMode: this.$adminMode})
    }
  },
  computed: {
    ...mapState('savedText', ['loadedByL2']),
    ...mapState('savedText', ['itemsByL2']),
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    savedtexts() {
      return this.itemsByL2[this.$l2.code];
    },
  },
  methods: {
    getSavedTexts() {},
  },
};
</script>

<style lang="scss">
</style>
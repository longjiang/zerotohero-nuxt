<router>
  {
    path: '/:l1/:l2/epub',
    meta: {
      title: 'Epub Reader | Language Player',
      metaTags: [
        {
          name: 'description',
          content:
            'Read an ePub ebook with annotation and save new words for review.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-3 pb-5">
    <SocialHead
      :title="`${$l2.name} ${$t('ePub Reader (Annotator)')} | Language Player`"
      :description="`${$t(
        'Read {l2} epubs with phonetic annotation dictionary lookup.',
        { l2: $t($l2.name) }
      )}`"
    />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <LazyEpubReader />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  }
};
</script>
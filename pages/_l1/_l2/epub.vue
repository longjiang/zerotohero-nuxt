<template>
  <div class="main pb-5">
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
  name: "epub", // Name must be explicitly declared for keep-alive to work
  computed: {
  }
};
</script>
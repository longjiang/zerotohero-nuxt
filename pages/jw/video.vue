<router>
  {
    path: '/:l1/:l2/jw-video/:languageAgnosticNaturalKey',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <JWVideo :languageAgnosticNaturalKey="languageAgnosticNaturalKey" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    languageAgnosticNaturalKey: {
      type: String,
    },
  },
};
</script>

<style>
</style>
<template>
    <div class="container pt-5 pb-5">
    <div class="row">
      <div class="col-md-12">
        <h5 class="text-center">The following videos in {{ $l2?.name }} are marked for deletion.</h5>
        <p class="text-center text-muted">Delete them in the database directly.</p>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <MediaSearchResults :params="mediaSearchParams" class="mt-4" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mediaSearchParams: {
        l1: this.$l1,
        l2: this.$l2,
        start: 0,
        limit: 100,
        status: "deleted",
      },
    };
  },
};
</script>
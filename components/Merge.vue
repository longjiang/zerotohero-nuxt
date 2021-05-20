<template>
  <div class="merge-wrapper">
    <div class="merge" v-if="direction === 'top'">
      <div class="merge-top">
        <div class="merge-bl"></div>
        <div class="merge-br"></div>
      </div>
      <div class="merge-bottom">
        <div class="merge-tr"></div>
        <div class="merge-tl"></div>
      </div>
    </div>
    <div class="merge" v-if="direction === 'bottom'">
      <div class="merge-top">
        <div class="merge-br"></div>
        <div class="merge-bl"></div>
      </div>
      <div class="merge-bottom">
        <div class="merge-tl"></div>
        <div class="merge-tr"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['direction']
}
</script>

<style scoped>
.merge-top,
.merge-bottom {
  display: flex;
}

.merge .merge-bl,
.merge .merge-br,
.merge .merge-tr,
.merge .merge-tl {
  width: 50%;
  height: 1rem;
}
.merge .merge-bl {
  border-left: 2px solid #e6e6e6;
  border-bottom: 2px solid #e6e6e6;
  border-radius: 0 0 0 1rem;
  margin-right: 2rem;
}
.merge .merge-br {
  border-right: 2px solid #e6e6e6;
  border-bottom: 2px solid #e6e6e6;
  border-radius: 0 0 1rem 0;
  margin-left: 2rem;
}

.merge .merge-tr {
  border-top: 2px solid #e6e6e6;
  border-right: 2px solid #e6e6e6;
  border-radius: 0 1rem 0 0;
  margin-left: 2rem;
}
.merge .merge-tl {
  border-top: 2px solid #e6e6e6;
  border-left: 2px solid #e6e6e6;
  border-radius: 1rem 0 0 0;
  margin-right: 2rem;
}

.merge-wrapper.h-half {
  width: 50%;
  margin: 0 auto;
}

.merge-wrapper.v-half {
  height: 50%;
  margin: auto 0;
}

.merge-top {
  margin-bottom: -2px;
}
</style>

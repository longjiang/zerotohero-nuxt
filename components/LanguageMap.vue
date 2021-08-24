<template>
  <div class="language-map">
    <client-only>
      <l-map :zoom="3" :center="[0, 0]">
        <l-tile-layer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ></l-tile-layer>
      </l-map>
    </client-only>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.language-map {
  width: 100%;
  height: 40rem;
  max-height: 100vh;
}
</style>
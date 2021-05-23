<template>
  <div>
    <div v-if="!resources || resources.length === 0">
      <div class="jumbotron shadow rounded bg-white">
        <p class="lead text-center mb-3">No resource is found in this category. Why not add your own here?</p>
        <div class="text-center">
          <a :href="`/${$l1.code}/${$l2.code}/contact-us`" class="btn btn-success">Contact Us</a>
        </div>
      </div>
    </div>
    <div v-else class="resources">
      <Resource v-for="(resource, index) of resources" :resource="resource" :key="`resource-${index}`" />
    </div>
  </div>
</template>

<script>
import Resource from '@/components/Resource'
import Helper from '@/lib/helper'

export default {
  components: {
    Resource
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
  },
  data() {
    return {
      Helper
    }
  },
  props: {
    resources: {
      type: Array
    }
  }
}
</script>

<style lang="scss">
.resources {
  display: flex;
  flex-wrap: wrap;
}
</style>

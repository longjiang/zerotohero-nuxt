<template>
  <div>
    <div v-if="!resources || resources.length === 0">
      <div class="jumbotron shadow rounded bg-white">
        <p class="lead text-center mb-3">No resource is found in this category. Why not add your own here?</p>
        <div class="text-center">
          <router-link :to="`/${$l1.code}/${$l2.code}/contact-us`" class="btn btn-success">Contact Us</router-link>
        </div>
      </div>
    </div>
    <div v-else class="resources">
      <Resource v-for="(resource, index) of resources" :resource="resource" :internal="resource.internal" :key="`resource-${index}`" class="m-1" />
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
  data() {
    return {
      Helper
    }
  },
  props: {
    resources: {
      type: Array
    },
  }
}
</script>

<style lang="scss">
.resources {
  display: flex;
  flex-wrap: wrap;
}
</style>

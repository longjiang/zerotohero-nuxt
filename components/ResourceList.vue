<template>
  <div>
    <div v-if="!resources || resources.length === 0">
      <div class="jumbotron shadow rounded bg-accent">
        <p class="lead text-center mb-3">{{ $t('No resource found in this category. Contact us if you have any to suggest.') }}</p>
        <div class="text-center">
          <router-link :to="`/${$l1.code}/${$l2.code}/contact-us`" class="btn btn-success">{{ $t('Contact Us') }}</router-link>
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

export default {
  components: {
    Resource
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

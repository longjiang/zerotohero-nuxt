<router>
  {
    path: '/all-routes',
    meta: {
      title: 'All Routes | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'All routes (paths) in Language Player.'
        }
      ]
    }
  }
</router>
<template>
  <div>
    <h1>List of Route Patterns</h1>
    <ul>
      <li v-for="route in routePatterns" :key="route.path">{{ route.path }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  computed: {
    routePatterns() {
      return this.$router.options.routes.map((route) => ({
        path: route.path
      }));
    }
  }
};
</script>

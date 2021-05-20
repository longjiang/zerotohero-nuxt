<template>
  <div class="resource media rounded shadow">
    <a :href="resource.url" :target="internal ? '_self' : '_blank'" class="link-unstyled">
      <img :src="resource.thumbnail" class="resource-thumbnail img-fluid" />
      <div class="media-body">
        <h6>
          <Annotate>
            <span>{{ resource.title }}</span>
          </Annotate>
        </h6>
        <div>{{ resource.description }}</div>
      </div>
    </a>
  </div>
</template>

<script>
export default {
  props: [ 'resource', 'internal' ]
}
</script>

<style>
.resource {
  min-width: 15rem;
  max-width: 480px;
  flex: 1;
  margin-right: 1rem;
  margin-bottom: 1rem;
}
.resource-thumbnail {
  width: 100%;
}
</style>
<router>
  {
    path: '/:l1/:l2/profile/',
    props: true
  }
</router>
<template>
  <div class="main pt-5 pb-5">
    <div class="container">
      <div class="row">
        <div class="col-sm-12  text-center">
          <h3>{{ $auth.user.first_name }} {{ $auth.user.last_name }}</h3>
          <p>{{ $auth.user.email }}</p>
          <p>{{ $auth.user.avatar }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
  }
}
</script>

<style>

</style>
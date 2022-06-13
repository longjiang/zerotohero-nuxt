<router>
  {
    path: '/go-pro-success',
    props: true
  }
</router>
<template>
  <div class="main container mt-5 p-4 rounded shadow">
    <div class="row">
      <div class="col-sm-12">
        <div>
          <div v-if="$auth.loggedIn">
            <div>
              You are logged in as
              <b>{{ $auth.user ? $auth.user.email : "" }}</b>
              (User #{{ $auth.user.id }}) {{ pro ? '🚀' : '' }}
              <span class="ml-2" />
              <router-link to="/logout">Logout</router-link>
            </div>
            <div class="mt-3"></div>
            <div v-if="pro">
              <h3>You’re now Pro!</h3>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed
                praesentium ex excepturi rem magnam vitae inventore doloribus
                voluptatem sunt magni alias quas deserunt animi ipsam, mollitia
                nisi reprehenderit distinctio eum.
              </p>
              <div class="mt-3" />
              <router-link class="btn btn-success" to="/">
                Back to Homepage
              </router-link>
            </div>
          </div>
          <div v-else>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    pro() {
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false
    }
  }
}
</script>
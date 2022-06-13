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
        <client-only>
          <div v-if="$auth.loggedIn && $auth.user">
            <div>
              Welcome,
              <b>{{ $auth.user ? $auth.user.email : "" }}</b>
              (User #{{ $auth.user.id }}) {{ pro ? "🚀" : "" }}
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
            <h3>Welcome to Pro!</h3>
            <p>
              Your upgrade was successful. Please login again to activate your Pro features.
            </p>
            <div class="mt-3" />
            <div>
              <router-link
                :to="{ path: '/login' }"
                class="btn btn-success"
              >
                Login
                <i class="fas fa-chevron-right"></i>
              </router-link>
            </div>
          </div>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";

export default {
  computed: {
    pro() {
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false;
    },
  },
  async mounted() {
    if (this.$auth.loggedIn) {
      let response = await this.$authios.get(`${Config.wiki}users/me`);
      if (response.data && response.data.data) {
        let user = response.data.data;
        this.$auth.setUser(user);
        if (this.pro) {
          this.$toast.success(
            `Congrats ${this.$auth.user.first_name}, you're now Pro!`,
            {
              position: "top-center",
              duration: 5000,
            }
          );
        }
      }
    }
  },
};
</script>
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
        <div class="col-sm-12 text-center">
          <h3>{{ $auth.user.first_name }} {{ $auth.user.last_name }}</h3>
          <p>{{ $auth.user.email }}</p>
          <p>{{ $auth.user.avatar }}</p>
          <p>{{ $store.state.progress }}</p>
        </div>
        <div class="col-sm-12">
          <div v-if="$store.state.progress.progressLoaded">
            You spent
            {{ Math.round((time / 1000 / 60 / 60) * 100) / 100 }} hours on Zero to Hero learning {{ $l2.name }}.
          </div>
          {{ targetHours  }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
export default {
  mounted() {},
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    time() {
      return this.$store.state.progress.progressLoaded
        ? this.$store.getters["progress/time"](this.$l2)
        : 0;
    },
    targetHours() {
      return Helper.levels[this.level].hoursMultiplier * this.$l2.hours
    }
  },
  data() {
    return {
      level: 1
    }
  }
};
</script>

<style>
</style>
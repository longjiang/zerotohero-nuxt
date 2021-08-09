<router>
  {
    path: '/:l1/:l2/online-courses'
  }
</router>
<template>
  <div class="main">
    <CoursesEnZh v-if="$l1.code === 'en' && $l2.code === 'zh'" />
    <CoursesZhEn v-if="$l1.code === 'zh' && $l2.code === 'en'" />
  </div>
</template>

<script>
import CoursesZhEn from '@/components/CoursesZhEn'
import CoursesEnZh from '@/components/CoursesEnZh'

export default {
  components: {
    CoursesZhEn,
    CoursesEnZh
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
  }
}
</script>

<style>
</style>

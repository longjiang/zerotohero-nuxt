<router>
  {
    path: '/:l1/:l2/course-release-schedule',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <ReleaseScheduleEnZh v-if="$l1.code === 'en' && $l2.code === 'zh'" />
      <ReleaseScheduleZhEn v-if="$l1.code === 'zh' && $l2.code === 'en'" />
    </div>
  </div>
</template>

<script>
import ReleaseScheduleEnZh from "@/components/ReleaseScheduleEnZh";
import ReleaseScheduleZhEn from "@/components/ReleaseScheduleZhEn";

export default {
  components: {
    ReleaseScheduleEnZh,
    ReleaseScheduleZhEn,
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
};
</script>


<style>
</style>

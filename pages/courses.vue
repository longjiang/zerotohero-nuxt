<router>
  {
    path: '/:l1/:l2/online-courses'
  }
</router>
<template>
  <div>
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
  }
}
</script>

<style>
</style>

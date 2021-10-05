<template>
  <div>
    <h3 class="text-center mb-5">关于“英语英雄”课程的常见问题</h3>
    <p class="mb-5"></p>
    <h5>课程会过期吗？</h5>
    <p>
      不会。你可以任何时候访问购买的课件，永远不会过期。视频都可以下载。只要点击网页上视频播放器下方的下载按钮即可。
    </p>
    <h5>课本怎么买？</h5>
    <p>
      想知道课本详情及如何购买，请参考这个页面的信息：
      <router-link :to="`#/${$l1.code}/${$l2.code}/textbooks-workbooks`">
        如何购买课本？
      </router-link>
    </p>
  </div>
</template>

<script>
export default {
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

<style scoped>
* >>> h5 {
  margin-top: 2rem;
}

* >>> h5 + div {
  padding-left: 2rem;
}
</style>

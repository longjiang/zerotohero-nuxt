<router>
  {
    path: '/:l1/:l2/live-tv',
    props: true
  }
</router>
<template>
  <div class="container main mt-5 mb-5">
    <LiveVideo url="http://ivi.neu6.edu.cn/hls/cctv13hd.m3u8" />
    <div class="pt-2 pb-2">
      <div class="channel-button">
        <img src="https://gitee.com/radioer/radioer/raw/main/CCTV13.png" alt="">
      </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.channel-button {
  background: black;
  border-radius: 0.5rem;
  text-align: center;
  display: inline-block;
  padding: 0.5em 2rem;
  img {
    width: 4rem;
    height: 3rem;
    object-fit: contain;
  }
}
</style>
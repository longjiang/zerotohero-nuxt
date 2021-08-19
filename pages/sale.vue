<router>
  {
    path: '/sale',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div>
    <SocialHead :title="title" :description="description" :image="image" />
    <!-- The video -->
    <video autoplay muted loop class="video-background">
      <source src="/video/backgrounds/vbg-waves-480p.mp4" type="video/mp4" />
    </video>

    <!-- Optional: some overlay text to describe the video -->
    <div class="content">
      <h1>Heading</h1>
      <p>Lorem ipsum...</p>
      <!-- Use a button to pause/play the video with JavaScript -->
      <button id="myBtn" onclick="myFunction()">Pause</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "HSK Courses at 30% Off | Chinese Zero to Hero",
      description: "Deal ends Sun, Aug 25, 2021",
      image: "/img/sale/summer-sale-2021.jpg",
    };
  },
};
</script>

<style lang="scss" scoped>
.video-background {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
}

</style>
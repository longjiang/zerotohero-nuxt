<router>
  {
    path: '/:l1/:l2/video-view/:type/:youtube_id?/:directus_id?/:lesson?',
    props: true,
    meta: {
      skin: 'dark',
      // collapseNav: true
    },
  }
</router>
<!-- The logic for the video-view route is handled in the <ContentArea /> component. -->